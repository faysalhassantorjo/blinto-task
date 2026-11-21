from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.movies.models import Movie
from apps.movies.serializers import (
    MovieSerializer,
    RewatchOrderResponseSerializer,
    CircularDependencyException,
)
from apps.movies.services import (
    calculate_rewatch_order_and_summary,
    build_prerequisites_graph,
    find_order_or_cycle,
)


class MovieListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/movies/     - List all movies with their details and prerequisites.
    POST /api/movies/     - Create a new movie.
    """
    queryset = Movie.objects.all().prefetch_related("prerequisites")
    serializer_class = MovieSerializer

    def perform_create(self, serializer):
        # Validate for circular dependencies before saving
        prerequisites = self.request.data.get('prerequisites', [])
        prereq_ids = [int(p) for p in prerequisites] if prerequisites else []

        existing_graph = build_prerequisites_graph()
        node_id = max(existing_graph.keys()) + 1 if existing_graph else 1
        existing_graph[node_id] = prereq_ids

        if find_order_or_cycle(node_id, graph=existing_graph)["has_cycle"]:
            raise CircularDependencyException()

        serializer.save()


class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/movies/{id}/ - Retrieve full movie details.
    PATCH  /api/movies/{id}/ - Partially update movie (e.g. prerequisites, watched status).
    PUT    /api/movies/{id}/ - Full update of movie.
    DELETE /api/movies/{id}/ - Delete movie (cascades prerequisite relationships).
    """
    queryset = Movie.objects.all().prefetch_related("prerequisites")
    serializer_class = MovieSerializer

    def perform_update(self, serializer):
        # Validate for circular dependencies if prerequisites are being updated
        if 'prerequisites' in self.request.data:
            prerequisites = self.request.data.get('prerequisites', [])
            prereq_ids = [int(p) for p in prerequisites] if prerequisites else []

            existing_graph = build_prerequisites_graph()
            node_id = serializer.instance.id
            existing_graph[node_id] = prereq_ids

            if find_order_or_cycle(node_id, graph=existing_graph)["has_cycle"]:
                raise CircularDependencyException()

        serializer.save()


class MovieRewatchOrderView(APIView):
    """
    GET /api/movies/{id}/rewatch-order/ - Computes topological rewatch order and summary.
    """

    def get(self, request, pk: int) -> Response:
        movie = get_object_or_404(Movie, pk=pk)
        result = calculate_rewatch_order_and_summary(movie)
        serializer = RewatchOrderResponseSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)
