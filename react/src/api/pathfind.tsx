type Shape = {
    type: "circle" | "rectangle" | "polygon";
    points: number[][]; // list of [latitude, longitude]
    radius?: number;    // used if type is "circle"
};

type Point = {
    longitude: number;
    latitude: number;
};

interface PathfindingComponentProps {
    dronePosition: Point;
    currentDestination: Point;
    zones: Shape[];
    setPathfind: (path: Point[]) => void;
}

const PathfindingComponent = ({ dronePosition, currentDestination, zones, setPathfind }: PathfindingComponentProps) => {
    // Pathfinding function
    const pathfind = (start: Point, end: Point, noFlyZones: Shape[]) => {
        // Get min/max lat/long
        const minLat = Math.min(start.latitude, end.latitude);
        const maxLat = Math.max(start.latitude, end.latitude);
        const minLong = Math.min(start.longitude, end.longitude);
        const maxLong = Math.max(start.longitude, end.longitude);

        // Create a grid of points within the bounding box with step 0.0001
        const grid: Point[] = [];
        for (let lat = minLat; lat <= maxLat; lat += 0.0001) {
            for (let lon = minLong; lon <= maxLong; lon += 0.0001) {
                grid.push({ latitude: lat, longitude: lon });
            }
        }

        // Mark points within no-fly zones as unwalkable
        const walkablePoints = grid.filter((point) => {
            return !noFlyZones.some((zone) => isPointInZone(point, zone));
        });

        // Set the pathfind grid
        setPathfind(walkablePoints);  
    };

    // Check if a point is inside a zone (circle, polygon, or rectangle)
    const isPointInZone = (point: Point, zone: Shape): boolean => {
        switch (zone.type) {
            case "circle":
                return isPointInCircle(point, zone);
            case "polygon":
                return isPointInPolygon(point, zone);
            case "rectangle":
                return isPointInRectangle(point, zone);
            default:
                return true;
        }
    };

    const isPointInCircle = (point: Point, zone: Shape): boolean => {
        if (!zone.radius) return false;

        const [centerLat, centerLon] = zone.points[0];  // Get the center of the zone (first point in the list)

        // Calculate the distance between the point and the zone center
        const distance = calculateDistance(point, { latitude: centerLat, longitude: centerLon });

        // Check if the distance from the point to the center is within the radius
        return distance <= zone.radius;
    };

    // Helper function for calculating the distance (in meters) between two points
    const calculateDistance = (point1: Point, point2: Point): number => {
        const earthRadius = 6371e3; // Earth radius in meters
        const lat1 = point1.latitude * (Math.PI / 180); // Convert latitude to radians
        const lat2 = point2.latitude * (Math.PI / 180); // Convert latitude to radians
        const deltaLat = (point2.latitude - point1.latitude) * (Math.PI / 180); // Latitude difference in radians
        const deltaLon = (point2.longitude - point1.longitude) * (Math.PI / 180); // Longitude difference in radians

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;  // Distance in meters
    };

    // Polygon check: Ray-casting algorithm to check if point is inside polygon
    const isPointInPolygon = (point: Point, zone: Shape): boolean => {
        const polygon = zone.points.map(([longitude, latitude]) => ({ latitude, longitude }));
        let inside = false;
        let x = point.longitude, y = point.latitude;
        let j = polygon.length - 1;
        for (let i = 0; i < polygon.length; i++) {
            const { latitude: xi, longitude: yi } = polygon[i];
            const { latitude: xj, longitude: yj } = polygon[j];
            const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
            j = i;
        }
        return inside;
    };

    // Rectangle check: If the point is within the rectangle's bounds
    const isPointInRectangle = (point: Point, zone: Shape): boolean => {
        const [p1, p2] = zone.points;
        const minLat = Math.min(p1[0], p2[0]);
        const maxLat = Math.max(p1[0], p2[0]);
        const minLon = Math.min(p1[1], p2[1]);
        const maxLon = Math.max(p1[1], p2[1]);

        return point.longitude >= minLon && point.longitude <= maxLon && point.latitude >= minLat && point.latitude <= maxLat;
    };

    const handlePathfind = () => {
        pathfind(dronePosition, currentDestination, zones);
    };

    return (
        <div>
            <button onClick={handlePathfind}>Pathfind</button>
        </div>
    );
};

export default PathfindingComponent;
