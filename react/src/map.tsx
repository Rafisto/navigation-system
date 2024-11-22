import L from 'leaflet';
import { CSSProperties } from 'react';
import { MapContainer, Marker, TileLayer, useMap, Polyline, Circle, Rectangle, Polygon } from 'react-leaflet';
import { Point, Rotation, Shape } from './app';
import MapToolbar from './components/toolbar';

// const COLORS = ['red', 'blue', 'green', 'gold', 'orange', 'violet', 'grey', 'black'];

const customIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const droneIcon = (color: string, yaw: number) => {
    return L.divIcon({
        className: '',
        html: `
            <div style="transform: rotate(${yaw}deg);">
                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png" 
                     style="width: 25px; height: 41px;" />
            </div>
        `,
        iconSize: [25, 41],
        iconAnchor: [12, 24], // Adjust anchor point to center the image
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
    });
};

const radiansToDegrees = (radians: number) => 180 + radians * 180 / Math.PI;

const ContainerStyle: CSSProperties = {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
};

const MapContainerStyle: CSSProperties = {
    height: "100%",
    width: "100%",
    cursor: "default",
    zIndex: 1,
}

interface MapComponentProps {
    dronePosition: Point;
    droneRotation: Rotation;
    points: Point[];
    missionPoints?: Point[];
    currentDestination?: Point;
    setPoints: (points: Point[]) => void;
    zones: Shape[];
    setZones: (zones: Shape[]) => void;
    pathfind?: Point[];
    clearPaths: () => void;
}

const MapComponent = ({ dronePosition, droneRotation, points, setPoints, currentDestination, missionPoints, zones, setZones, pathfind, clearPaths }: MapComponentProps) => {
    const MapClick = () => {
        const map = useMap();
        map.on('click', (e) => {
            setPoints([...points, { latitude: e.latlng.lat, longitude: e.latlng.lng }]);
        });
        return null;
    };

    const MarkerClick = (index: number) => {
        const updatedMarkers = [...points];
        updatedMarkers.splice(index, 1);
        setPoints(updatedMarkers);
    };

    const handleCreateShape = (shape: "circle" | "rectangle" | "polygon") => {
        switch (shape) {
            case "circle":
                if (points.length < 1) {
                    return;
                }

                let circle: Shape = {
                    type: "circle",
                    points: [[points[0].latitude, points[0].longitude]],
                    radius: 50
                }
                setZones([...zones, circle]);
                setPoints([]);
                break;
            case "rectangle":
                if (points.length < 2) {
                    return;
                }

                let rectangle: Shape = {
                    type: "rectangle",
                    points: [[points[0].latitude, points[0].longitude], [points[1].latitude, points[1].longitude]]
                }
                setZones([...zones, rectangle]);
                setPoints([]);
                break;
            case "polygon":
                if (points.length < 3) {
                    return;
                }

                let polygon: Shape = {
                    type: "polygon",
                    points: points.map(point => [point.latitude, point.longitude])
                }
                setZones([...zones, polygon]);
                setPoints([]);
                break;
            default:
                break;
        }
    }

    return (
        <div style={ContainerStyle}>
            <MapContainer style={MapContainerStyle} center={[-35.3632621, 149.1652374]} zoom={13} scrollWheelZoom={true} attributionControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClick />
                {points.map((point, idx) => (
                    <div key={`marker-${idx}`} style={{ padding: '5px' }}>
                        <Marker position={[point.latitude, point.longitude]} icon={customIcon("red")} eventHandlers={{ click: () => MarkerClick(idx) }} />
                    </div>
                ))}
                {/* DRONE MARKER */}
                <Marker position={[dronePosition.latitude, dronePosition.longitude]} icon={droneIcon("blue", radiansToDegrees(droneRotation.yaw))} />

                {/* MISSION MARKER */}
                <Polyline
                    positions={points.map(point => [point.latitude, point.longitude])}
                    color="red"
                />
                {
                    missionPoints &&
                    <Polyline
                        positions={missionPoints.map(point => [point.latitude, point.longitude])}
                        color="yellow"
                    />
                }

                {/* CURRENT DESTINATION MARKER */}
                {currentDestination &&
                    <>
                        <Polyline
                            positions={[[dronePosition.latitude, dronePosition.longitude], [currentDestination.latitude, currentDestination.longitude]]}
                            color="yellow"
                        />
                        {/* <Marker position={[currentDestination.latitude, currentDestination.longitude]} icon={customIcon("yellow")} /> */}
                    </>
                }

                {/* (NO-FLY) ZONES */}
                {zones.map((zone, idx) => {
                    switch (zone.type) {
                        case "circle":
                            return (
                                <Circle
                                    key={`zone-${idx}`}
                                    center={[zone.points[0][0], zone.points[0][1]] as [number, number]}
                                    radius={zone.radius!}
                                    color="gray"
                                />
                            );
                        case "rectangle":
                            return (
                                <Rectangle
                                    key={`zone-${idx}`}
                                    bounds={zone.points.map(point => [point[0], point[1]] as [number, number])}
                                    color="gray"
                                />
                            );
                        case "polygon":
                            return (
                                <Polygon
                                    key={`zone-${idx}`}
                                    positions={zone.points.map(point => [point[0], point[1]] as [number, number])}
                                    color="gray"
                                />
                            );
                        default:
                            return null;
                    }
                })}

                {/* PATHFINDING RECOMMENDATION */}
                {pathfind &&
                    pathfind.map((point, idx) => (
                        // circle of radius 1m
                        <Circle
                            key={`pathfind-${idx}`}
                            center={[point.latitude, point.longitude]}
                            radius={1}
                            color="blue"
                        />
                    ))
                }
                    {/* <Polyline
                        positions={pathfind.map(point => [point.latitude, point.longitude])}
                        color="blue"
                     /> */}
            </MapContainer>
            <MapToolbar handleCreateShape={handleCreateShape} clearPaths={clearPaths} />
        </div>
    );
}

export default MapComponent;
