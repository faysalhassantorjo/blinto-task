from rest_framework import serializers

from apps.cinemas.exceptions import (
    DuplicateBundleSizeError,
    DuplicateCinemaNameError,
    InvalidBundleCountError,
    InvalidBundleSizeError,
    InvalidGroupSizeError,
)
from apps.cinemas.models import Cinema

MIN_BUNDLE_SIZES = 1
MAX_BUNDLE_SIZES = 10
MIN_BUNDLE_SIZE = 1
MAX_BUNDLE_SIZE = 500
MIN_GROUP_SIZE = 1
MAX_GROUP_SIZE = 10000


class CinemaSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[])
    bundle_sizes = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
    )

    class Meta:
        model = Cinema
        fields = [
            "id",
            "name",
            "bundle_sizes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value: str) -> str:
        queryset = Cinema.objects.filter(name=value)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise DuplicateCinemaNameError()
        return value

    def validate_bundle_sizes(self, value: list) -> list:
        print("value is : ", value)
        if len(value) < MIN_BUNDLE_SIZES or len(value) > MAX_BUNDLE_SIZES:
            raise InvalidBundleCountError()
        if len(set(value)) != len(value):
            raise DuplicateBundleSizeError()
        for size in value:
            if size < MIN_BUNDLE_SIZE or size > MAX_BUNDLE_SIZE:
                raise InvalidBundleSizeError()
        return value


class QuoteRequestSerializer(serializers.Serializer):
    group_size = serializers.IntegerField()

    def validate_group_size(self, value: int) -> int:
        if value < MIN_GROUP_SIZE or value > MAX_GROUP_SIZE:
            raise InvalidGroupSizeError()
        return value
