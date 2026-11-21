from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cinemas.exceptions import InvalidBundleCountError
from apps.cinemas.models import Bundle, Cinema
from apps.cinemas.serializers import CinemaSerializer, QuoteRequestSerializer
from apps.cinemas.services import calculate_minimum_bundles


class CinemaListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/cinemas/ - List all cinemas with their bundle sizes.
    POST /api/cinemas/ - Create a cinema with its bundle sizes.
    """
    queryset = Cinema.objects.prefetch_related('bundles')
    serializer_class = CinemaSerializer

    def perform_create(self, serializer):
        bundle_sizes = serializer.validated_data.pop('bundle_sizes', None)
        print('--->', bundle_sizes)
        if bundle_sizes is None:
            raise InvalidBundleCountError()
        with transaction.atomic():
            cinema = serializer.save()
            Bundle.objects.bulk_create(
                [Bundle(cinema=cinema, size=size) for size in bundle_sizes]
            )


class CinemaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/cinemas/{id}/ - Retrieve cinema details and bundle sizes.
    PATCH  /api/cinemas/{id}/ - Update name and/or bundle sizes.
    DELETE /api/cinemas/{id}/ - Delete cinema and its bundles.
    """
    queryset = Cinema.objects.prefetch_related('bundles')
    serializer_class = CinemaSerializer

    def perform_update(self, serializer):
        bundle_sizes = serializer.validated_data.pop('bundle_sizes', None)
        with transaction.atomic():
            cinema = serializer.save()
            if bundle_sizes is not None:
                cinema.bundles.all().delete()
                Bundle.objects.bulk_create(
                    [Bundle(cinema=cinema, size=size) for size in bundle_sizes]
                )


class CinemaQuoteView(APIView):
    """
    POST /api/cinemas/{id}/quote/ - Minimum-bundle booking quote.
    """

    def post(self, request, pk: int) -> Response:
        cinema = get_object_or_404(
            Cinema.objects.prefetch_related('bundles'), pk=pk
        )

        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group_size = serializer.validated_data['group_size']

        bundle_sizes = [b.size for b in cinema.bundles.all()]
        result = calculate_minimum_bundles(bundle_sizes, group_size)

        if result is None:
            return Response({
                "possible": False,
                "group_size": group_size,
                "message": "No exact bundle combination is available for this group size.",
            }, status=status.HTTP_200_OK)

        bundles = [
            {
                "size": size,
                "quantity": quantity,
                "seats": size * quantity,
            }
            for size, quantity in sorted(result["bundles"].items(), reverse=True)
        ]

        return Response({
            "possible": True,
            "group_size": group_size,
            "total_seats": result["total_seats"],
            "total_bundles": result["total_bundles"],
            "bundles": bundles,
        }, status=status.HTTP_200_OK)
