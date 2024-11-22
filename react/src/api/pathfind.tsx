import ButtonComponent from "../components/button";
import { dijkstra } from "./dijkstra";

type Shape = {
  type: "circle" | "rectangle" | "polygon";
  points: number[][]; // list of [latitude, longitude]
  radius?: number; // used if type is "circle"
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

const PathfindingComponent = ({
  dronePosition,
  currentDestination,
  zones,
  setPathfind,
}: PathfindingComponentProps) => {
  const pathfind = (start: Point, end: Point, noFlyZones: Shape[]) => {
    // Helper function to calculate the bounds of a shape
    const getShapeBounds = (shape: Shape) => {
      if (shape.type === "circle") {
        const center = shape.points[0];
        const radiusDegrees = shape.radius! / 111320; // Convert meters to degrees (approximation)
        return {
          minLat: center[0] - radiusDegrees,
          maxLat: center[0] + radiusDegrees,
          minLong: center[1] - radiusDegrees,
          maxLong: center[1] + radiusDegrees,
        };
      } else {
        const lats = shape.points.map(([lat, _]) => lat);
        const longs = shape.points.map(([_, lon]) => lon);
        return {
          minLat: Math.min(...lats),
          maxLat: Math.max(...lats),
          minLong: Math.min(...longs),
          maxLong: Math.max(...longs),
        };
      }
    };

    // Initialize bounding box with start and end points
    let minLat = Math.min(start.latitude, end.latitude);
    let maxLat = Math.max(start.latitude, end.latitude);
    let minLong = Math.min(start.longitude, end.longitude);
    let maxLong = Math.max(start.longitude, end.longitude);

    // Expand bounding box to include all no-fly zones
    for (const zone of noFlyZones) {
      const {
        minLat: zoneMinLat,
        maxLat: zoneMaxLat,
        minLong: zoneMinLong,
        maxLong: zoneMaxLong,
      } = getShapeBounds(zone);
      minLat = Math.min(minLat, zoneMinLat);
      maxLat = Math.max(maxLat, zoneMaxLat);
      minLong = Math.min(minLong, zoneMinLong);
      maxLong = Math.max(maxLong, zoneMaxLong);
    }

    // Add offset to the bounding box for additional fallback paths (if possible)
    const offset = 0.0005;
    minLat -= offset;
    maxLat += offset;
    minLong -= offset;
    maxLong += offset;

    // Grid resolution (step size in degrees)
    const step = 0.0001;

    // Create a grid representing the bounding box
    const rows = Math.ceil((maxLat - minLat) / step) + 1;
    const cols = Math.ceil((maxLong - minLong) / step) + 1;
    const grid: number[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(0)
    );

    // Function to map a latitude/longitude to grid indices
    const toGridIndex = (point: Point) => ({
      x: Math.round((point.longitude - minLong) / step),
      y: Math.round((point.latitude - minLat) / step),
    });

    // Mark no-fly zones on the grid
    const markGrid = (grid: number[][], shape: Shape) => {
      for (let lon = minLong; lon <= maxLong; lon += step) {
        for (let lat = minLat; lat <= maxLat; lat += step) {
          const point = { latitude: lat, longitude: lon };
          if (isPointInZone(point, shape)) {
            const { x, y } = toGridIndex(point);
            grid[y][x] = 1; // Mark as unwalkable
          }
        }
      }
    };

    for (const zone of noFlyZones) {
      markGrid(grid, zone);
    }

    // Map start and end points to grid indices
    const startIndex = toGridIndex(start);
    const endIndex = toGridIndex(end);

    // Print the grid in console
    console.log("INPUT:");
    console.log(
      grid
        .map((row) => row.join(" "))
        .reverse()
        .join("\n")
    );

    // Run Dijkstra's algorithm
    const pathIndices = dijkstra(grid, startIndex, endIndex);

    // Print the path indices in console
    console.log("OUTPUT:");
    console.log(
      grid
        .map((row, y) =>
          row
            .map((cell, x) =>
              pathIndices.some(({ x: px, y: py }) => px === x && py === y)
                ? "*"
                : cell
            )
            .join(" ")
        )
        .reverse()
        .join("\n")
    );

    // Convert grid indices back to real-world coordinates
    const path = pathIndices.map(({ x, y }: { x: number; y: number }) => ({
      latitude: minLat + y * step,
      longitude: minLong + x * step,
    }));

    setPathfind(path);
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

    const [centerLat, centerLon] = zone.points[0]; // Get the center of the zone (first point in the list)

    // Calculate the distance between the point and the zone center
    const distance = calculateDistance(point, {
      latitude: centerLat,
      longitude: centerLon,
    });

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

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c; // Distance in meters
  };

  // Polygon check: Ray-casting algorithm to check if point is inside polygon
  const isPointInPolygon = (point: Point, zone: Shape): boolean => {
    const polygon = zone.points.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    }));
    let inside = false;
    let x = point.longitude,
      y = point.latitude;
    let j = polygon.length - 1;
    for (let i = 0; i < polygon.length; i++) {
      const { latitude: xi, longitude: yi } = polygon[i];
      const { latitude: xj, longitude: yj } = polygon[j];
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
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

    return (
      point.longitude >= minLon &&
      point.longitude <= maxLon &&
      point.latitude >= minLat &&
      point.latitude <= maxLat
    );
  };

  const handlePathfind = () => {
    pathfind(dronePosition, currentDestination, zones);
  };

  return (
    <div>
      {zones.length > 0 && currentDestination && (
        <>
          <h1 className="my-1">Pathfinding</h1>
          <ButtonComponent onClick={handlePathfind}>Pathfind</ButtonComponent>
        </>
      )}
    </div>
  );
};

export default PathfindingComponent;
