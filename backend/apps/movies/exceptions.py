from rest_framework import status
from rest_framework.exceptions import APIException


class CircularDependencyError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_code = "CIRCULAR_DEPENDENCY"

    def __init__(
        self,
        message: str = "This prerequisite relationship would create a circular dependency.",
    ):
        detail = {
            "error": "CIRCULAR_DEPENDENCY",
            "message": message,
        }
        super().__init__(detail=detail)
