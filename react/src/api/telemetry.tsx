import { useEffect, useState } from "react"
import { Socket } from "socket.io-client";
import { Point } from "../app";

interface TelemetryProps {
    socket: Socket | null;
    setDronePosition: (position: Point) => void;
}

const Telemetry = ({ socket, setDronePosition }: TelemetryProps) => {
    const [telemetry, setTelemetry] = useState<any>(null);

    useEffect(() => {
        if (socket) {
            socket.on('telemetry', (data: any) => {
                console.log(data);
                setTelemetry(data);
                if (data.lat && data.lon) {
                    setDronePosition({ latitude: data.lat, longitude: data.lon });
                }
            });
        }
    })

    return (
        <div>
            <h1>Telemetry</h1>
            <div>
                {telemetry ? (
                    <ul>
                        {Object.entries(telemetry).map(([key, value]) => (
                            <li key={key}>
                                {key}: {(value as string)}
                            </li>
                        ))}
                    </ul>
                ) : "No telemetry data"}
            </div>
        </div>
    )
}

export default Telemetry;