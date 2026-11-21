from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=255, unique=True)
    release_year = models.IntegerField()
    runtime = models.IntegerField(
        validators=[
            MinValueValidator(1, message="Runtime must be at least 1 minute."),
            MaxValueValidator(300, message="Runtime must not exceed 300 minutes."),
        ]
    )
    prerequisites = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='dependent_movies',
        blank=True,
    )
    watched = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(runtime__gte=1) & models.Q(runtime__lte=300),
                name='runtime_between_1_and_300',
            )
        ]

    def __str__(self):
        return f"{self.title} ({self.release_year})"
