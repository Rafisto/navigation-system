import L from 'leaflet';
import { CSSProperties } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { Point } from './app';

const COLORS = ['red', 'blue', 'green', 'gold', 'orange', 'violet', 'grey', 'black'];

const customIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const MapContainerStyle: CSSProperties = {
    height: "100%",
    width: "100%",
    cursor: "default"
}

interface MapComponentProps {
    drone: Point;
    points: Point[];
    setPoints: (points: Point[]) => void;
}

const MapComponent = ({ drone, points, setPoints }: MapComponentProps) => {
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

    return <MapContainer style={MapContainerStyle} center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClick />
        {
            points.map((point, idx) => (
                <div key={`marker-${idx}`} style={{ padding: '5px' }}>
                    <Marker position={[point.latitude, point.longitude]} icon={customIcon("red")} eventHandlers={{ click: () => MarkerClick(idx) }} />
                </div>
            ))
        }
        <div key={`marker-drone`} style={{ padding: '5px' }}>
            <Marker position={[drone.latitude, drone.longitude]} icon={customIcon("blue")} />
        </div>
    </MapContainer>

}

export default MapComponent;