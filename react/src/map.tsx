import L from 'leaflet';
import { CSSProperties } from 'react';
import { MapContainer, Marker, TileLayer, useMap, Polyline } from 'react-leaflet';
import { Point, Rotation } from './app';

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
}

const MapComponent = ({ dronePosition, droneRotation, points, setPoints, currentDestination, missionPoints }: MapComponentProps) => {
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

    return (
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
            <Marker position={[dronePosition.latitude, dronePosition.longitude]} icon={droneIcon("blue", radiansToDegrees(droneRotation.yaw))} />
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
            {currentDestination &&
                <><Polyline
                    positions={[[dronePosition.latitude, dronePosition.longitude], [currentDestination.latitude, currentDestination.longitude]]}
                    color="yellow"
                />
                    {/* <Marker position={[currentDestination.latitude, currentDestination.longitude]} icon={customIcon("yellow")} /> */}
                </>}

        </MapContainer>
    );
}

export default MapComponent;
