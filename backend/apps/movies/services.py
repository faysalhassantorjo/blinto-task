
from typing import Any, Dict, List

from apps.movies.exceptions import CircularDependencyError
from apps.movies.models import Movie



def build_prerequisites_graph() -> Dict[int, List[int]]:

    all_movie_ids = Movie.objects.values_list("id", flat=True)

    graph: Dict[int, List[int]] = {
        movie_id: [] for movie_id in all_movie_ids
    }

    through_records = Movie.prerequisites.through.objects.values_list(
        "from_movie_id",
        "to_movie_id",
    )

    for from_id, to_id in through_records:
        graph.setdefault(from_id, []).append(to_id)
        graph.setdefault(to_id, [])

    return graph

def find_order_or_cycle(init_node: int, graph=None) -> Dict[str, Any]:
    """
    Finds the prerequisite-first order or detects a cycle.

    Returns:
        {
            "has_cycle": bool,
            "order": List[int]
        }
    """
    if graph is None:
        graph = build_prerequisites_graph()

    visited = set()
    path_visited = set()
    order = []

    def dfs(node: int) -> bool:
        if node in path_visited:
            return True

        if node in visited:
            return False

        visited.add(node)
        path_visited.add(node)

        for neighbor in graph.get(node, []):
            if dfs(neighbor):
                return True

        path_visited.remove(node)
        order.append(node)

        return False

    if dfs(init_node):
        return {
            "has_cycle": True,
            "order": [],
        }

    return {
        "has_cycle": False,
        "order": order,
    }

def calculate_rewatch_order_and_summary(
    target_movie: Movie,
) -> Dict[str, Any]:
    """
    Calculates the prerequisite rewatch order and summary.

    The target movie itself is excluded from the rewatch order.
    """

    result = find_order_or_cycle(target_movie.id)

    if result["has_cycle"]:
        raise CircularDependencyError(
            f"Circular dependency detected for movie: "
            f"{target_movie.title}"
        )

    # Exclude the target movie from the rewatch order.
    ordered_ids = [
        movie_id
        for movie_id in result["order"]
        if movie_id != target_movie.id
    ]

    # Fetch movies while preserving the graph traversal order.
    movies_by_id = {
        movie.id: movie
        for movie in Movie.objects.filter(id__in=ordered_ids)
    }

    ordered_movies = [
        movies_by_id[movie_id]
        for movie_id in ordered_ids
        if movie_id in movies_by_id
    ]

    # Calculate summary statistics.
    total_movies = len(ordered_movies)

    watched_count = sum(
        1 for movie in ordered_movies if movie.watched
    )

    unwatched_count = total_movies - watched_count

    unwatched_runtime = sum(
        movie.runtime
        for movie in ordered_movies
        if not movie.watched
    )

    return {
        "target": {
            "id": target_movie.id,
            "title": target_movie.title,
        },
        "movies": ordered_movies,
        "summary": {
            "total_movies": total_movies,
            "watched_count": watched_count,
            "unwatched_count": unwatched_count,
            "unwatched_runtime": unwatched_runtime,
        },
    }
