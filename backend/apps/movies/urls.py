from django.urls import path

from apps.movies import views
urlpatterns = [
    path("", views.MovieListCreateView.as_view(), name="movie-list-create"),
    path("<int:pk>/", views.MovieDetailView.as_view(), name="movie-detail"),
    path(
        "<int:pk>/rewatch-order/",
        views.MovieRewatchOrderView.as_view(),
        name="movie-rewatch-order",
    ),
]
