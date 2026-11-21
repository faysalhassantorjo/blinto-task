from rest_framework import status
from rest_framework.exceptions import APIException


class CinemaAPIError(APIException):
    """Base error returning {"error": code, "message": ...}."""

    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.status_code = status_code
        self.default_code = code
        detail = {"error": code, "message": message}
        super().__init__(detail=detail)


class InvalidGroupSizeError(CinemaAPIError):
    def __init__(self):
        super().__init__(
            "INVALID_GROUP_SIZE",
            "Group size must be between 1 and 10000.",
        )


class InvalidBundleSizeError(CinemaAPIError):
    def __init__(self):
        super().__init__(
            "INVALID_BUNDLE_SIZE",
            "Bundle sizes must be between 1 and 500.",
        )


class InvalidBundleCountError(CinemaAPIError):
    def __init__(self):
        super().__init__(
            "INVALID_BUNDLE_COUNT",
            "A cinema must have between 1 and 10 different bundle sizes.",
        )


class DuplicateBundleSizeError(CinemaAPIError):
    def __init__(self):
        super().__init__(
            "DUPLICATE_BUNDLE_SIZE",
            "Bundle sizes must be unique within a cinema.",
        )


class DuplicateCinemaNameError(CinemaAPIError):
    def __init__(self):
        super().__init__(
            "DUPLICATE_CINEMA_NAME",
            "A cinema with this name already exists.",
        )
