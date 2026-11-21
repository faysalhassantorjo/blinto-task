from django.urls import path

from apps.cinemas.views import (
    CinemaDetailView,
    CinemaListCreateView,
    CinemaQuoteView,
)

urlpatterns = [
    path("", CinemaListCreateView.as_view(), name="cinema-list-create"),
    path("<int:pk>/", CinemaDetailView.as_view(), name="cinema-detail"),
    path(
        "<int:pk>/quote/",
        CinemaQuoteView.as_view(),
        name="cinema-quote",
    ),
]
