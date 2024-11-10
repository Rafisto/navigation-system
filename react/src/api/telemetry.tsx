import { useEffect, useState } from "react"
import { Socket } from "socket.io-client";
import { Point } from "../app";
import { ArrowPathIcon, CursorArrowRippleIcon, GlobeAltIcon } from "@heroicons/react/16/solid";

interface TelemetryProps {
    socket: Socket | null;
    setDronePosition: (position: Point) => void;
    setDroneRotation: (rotation: number) => void;
}

const Telemetry = ({ socket, setDronePosition, setDroneRotation }: TelemetryProps) => {
    const [telemetry, setTelemetry] = useState<any>(null);

    useEffect(() => {
        if (socket) {
            socket.on('telemetry', (data: any) => {
                console.log(data);
                setTelemetry(data);
                if (data.lat && data.lon) {
                    setDronePosition({ latitude: data.lat, longitude: data.lon });
                    setDroneRotation(data.yaw);
                }
            });
        }
    })

    return (
        <div>
            <h1>Telemetry</h1>
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Telemetry</h1>
                <div>
                    {telemetry ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(telemetry).map(([key, value]) => (
                                <div key={key} className="flex items-center p-4 bg-gray-100 rounded-lg shadow-md">
                                    <TelemetryIcon keyName={key} />
                                    <span className="ml-2 font-medium text-gray-700 capitalize">{key}</span>
                                    <span className="ml-auto font-semibold text-gray-900">{(Math.round(value as number * 100)/100).toString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No telemetry data</p>
                    )}
                </div>
            </div>
        </div>
    )
}

const TelemetryIcon = ({ keyName }: { keyName: string }) => {
    switch (keyName) {
        case 'x': return <GlobeAltIcon className="h-6 w-6 text-blue-500" title="X Position" />;
        case 'y': return <GlobeAltIcon className="h-6 w-6 text-blue-500" title="Y Position" />;
        case 'z': return <GlobeAltIcon className="h-6 w-6 text-blue-500" title="Altitude (Z)" />;
        case 'lat': return <CursorArrowRippleIcon className="h-6 w-6 text-green-500" title="Latitude" />;
        case 'lon': return <CursorArrowRippleIcon className="h-6 w-6 text-green-500" title="Longitude" />;
        case 'roll': return <ArrowPathIcon className="h-6 w-6 text-purple-500" title="Roll" />;
        case 'pitch': return <ArrowPathIcon className="h-6 w-6 text-purple-500" title="Pitch" />;
        case 'yaw': return <ArrowPathIcon className="h-6 w-6 text-purple-500" title="Yaw" />;
        default: return <GlobeAltIcon className="h-6 w-6 text-gray-500" title={keyName} />;
    }
}

export default Telemetry;