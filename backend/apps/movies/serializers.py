from rest_framework import serializers

from apps.movies.models import Movie
from apps.movies.services import build_prerequisites_graph, find_order_or_cycle

from rest_framework.exceptions import APIException
class CircularDependencyException(APIException):
    status_code = 409
    default_detail = "This operation would create a circular dependency."
    default_code = "CIRCULAR_DEPENDENCY"

class MovieSerializer(serializers.ModelSerializer):
    prerequisites = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Movie.objects.all(),
        required=False,
    )

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "release_year",
            "runtime",
            "prerequisites",
            "watched",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_runtime(self, value: int) -> int:
        if value < 1 or value > 300:
            raise serializers.ValidationError(
                "Runtime must be between 1 and 300 minutes."
            )
        return value


class RewatchTargetSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()


class RewatchMovieItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "release_year",
            "runtime",
            "watched",
        ]


class RewatchSummarySerializer(serializers.Serializer):
    total_movies = serializers.IntegerField()
    watched_count = serializers.IntegerField()
    unwatched_count = serializers.IntegerField()
    unwatched_runtime = serializers.IntegerField()


class RewatchOrderResponseSerializer(serializers.Serializer):
    target = RewatchTargetSerializer()
    movies = RewatchMovieItemSerializer(many=True)
    summary = RewatchSummarySerializer()
