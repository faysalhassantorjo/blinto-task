from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Cinema(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    @property
    def bundle_sizes(self):
        """Sorted list of this cinema's bundle sizes."""
        return sorted(self.bundles.values_list('size', flat=True))

    def __str__(self):
        return self.name


class Bundle(models.Model):
    cinema = models.ForeignKey(
        Cinema,
        on_delete=models.CASCADE,
        related_name='bundles',
    )
    size = models.IntegerField(
        validators=[
            MinValueValidator(1, message="Bundle size must be at least 1."),
            MaxValueValidator(500, message="Bundle size must not exceed 500."),
        ]
    )

    class Meta:
        ordering = ['size']
        constraints = [
            models.UniqueConstraint(
                fields=['cinema', 'size'],
                name='unique_bundle_size_per_cinema',
            ),
            models.CheckConstraint(
                condition=models.Q(size__gte=1) & models.Q(size__lte=500),
                name='bundle_size_between_1_and_500',
            ),
        ]

    def __str__(self):
        return f"{self.cinema.name} - {self.size} seats"
