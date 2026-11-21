
from typing import Dict, List, Optional


def calculate_minimum_bundles(bundle_sizes: List[int],group_size: int):
    sizes = sorted(set(bundle_sizes))

    INF = float('inf')

    dp = [INF] * (group_size + 1)
    dp[0] = 0

    chosen = [None] * (group_size + 1)

    for seats in range(1, group_size + 1):
        for size in sizes:
            if seats >= size and dp[seats - size] != INF:
                candidate = dp[seats - size] + 1
                if candidate < dp[seats]:
                    dp[seats] = candidate
                    chosen[seats] = size

    if dp[group_size] == INF:
        return None

    bundles: Dict[int, int] = {}
    remaining = group_size
    while remaining > 0:
        size = chosen[remaining]
        if size is None:
            raise ValueError("Invalid DP reconstruction state")
        bundles[size] = bundles.get(size, 0) + 1
        remaining -= size

    return {
        "total_bundles": dp[group_size],
        "total_seats": group_size,
        "bundles": bundles,
    }
