type Point = { x: number, y: number };
type Grid = number[][];

function dijkstra(grid: Grid, start: Point, end: Point): Point[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const distances: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    const previous: (Point | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

    const directions = [
        { x: -1, y: 0 }, // up
        { x: 1, y: 0 },  // down
        { x: 0, y: -1 }, // left
        { x: 0, y: 1},   // right
        { x: -1, y: -1 }, // up-left
        { x: -1, y: 1 },  // up-right
        { x: 1, y: -1 },  // down-left
        { x: 1, y: 1 }    // down-right
    ];

    distances[start.y][start.x] = 0;
    const queue: Point[] = [start];

    while (queue.length > 0) {
        queue.sort((a, b) => distances[a.y][a.x] - distances[b.y][b.x]);
        const current = queue.shift()!;
        const { x, y } = current;

        if (visited[y][x]) continue;
        visited[y][x] = true;

        if (x === end.x && y === end.y) break;

        for (const direction of directions) {
            const newX = x + direction.x;
            const newY = y + direction.y;

            if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && !visited[newY][newX] && grid[newY][newX] === 0) {
                const newDist = distances[y][x] + 1;
                if (newDist < distances[newY][newX]) {
                    distances[newY][newX] = newDist;
                    previous[newY][newX] = { x, y };
                    queue.push({ x: newX, y: newY });
                }
            }
        }
    }

    const path: Point[] = [];
    let current: Point | null = end;
    while (current) {
        path.unshift(current);
        current = previous[current.y][current.x];
    }

    return path.length > 1 ? path : [];
}

export { dijkstra };