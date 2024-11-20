import { useEffect, useState } from "react"
import { Socket } from "socket.io-client";
import { Point, Rotation } from "../app";
import { ArrowPathIcon, ChartBarIcon, CursorArrowRippleIcon, GlobeAltIcon } from "@heroicons/react/16/solid";
import Loading from "../components/loading";

interface TelemetryProps {
    socket: Socket | null;
    setDronePosition: (position: Point) => void;
    setDroneRotation: (rotation: Rotation) => void;
}

interface TelemetryData {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    lat: number;
    lon: number;
    roll: number;
    pitch: number;
    yaw: number;
    base: number;
    mode: number;
}

const Telemetry = ({ socket, setDronePosition, setDroneRotation }: TelemetryProps) => {
    const [telemetry, setTelemetry] = useState<TelemetryData>();

    useEffect(() => {
        if (socket) {
            socket.on('telemetry', (data: any) => {
                console.log(data);
                setTelemetry(data);
                if (data.lat && data.lon) {
                    setDronePosition({
                        latitude: data.lat,
                        longitude: data.lon
                    });
                    setDroneRotation({
                        roll: (data.roll as number),
                        pitch: (data.pitch as number),
                        yaw: (data.yaw as number),
                    });
                }
            });
        }
    })

    const simpleRound = (value: number) => {
        return Math.round(value * 100) / 100;
    }

    const interpretBase = (base: number): string => {
        const isArmed = (base & 128) === 128;

        return isArmed
            ? "armed"
            : "not armed";
    };

    const customMode = (mode: number): string => {
        console.log(mode);
        switch (mode) {
            case 0:
                return "Stabilize";
            case 3:
                return "Mission";
            case 4:
                return "Guided";
            case 6:
                return "RTL";
            default:
                return "Unknown";
        }
    }

    return (
        <div>
            <h1 className="my-1">
                Telemetry
                {telemetry && telemetry.base && <span> ({interpretBase(telemetry.base)}) ({customMode(telemetry.mode)})</span>}
            </h1>
            {telemetry ? (
                <div className="flex flex-col gap-1">
                    <div className="flex flex-row">
                        <CursorArrowRippleIcon className="h-6 w-6 text-green-500" title="Latitude" />
                        <span className="font-medium capitalize">Local</span>
                        <span className="ml-auto font-semibold"><span className="text-red-800">X </span>{simpleRound(telemetry.x)}</span>
                        <span className="ml-auto font-semibold"><span className="text-green-800">Y </span>{simpleRound(telemetry.y)}</span>
                        <span className="ml-auto font-semibold"><span className="text-blue-800">Z </span>{simpleRound(-1 * telemetry.z)}</span>
                    </div>
                    <div className="flex flex-row">
                        <ChartBarIcon className="h-6 w-6 text-red-500" title="Velocity" />
                        <span className="font-medium capitalize">Velocity</span>
                        <span className="ml-auto font-semibold"><span className="text-red-800">VX </span>{simpleRound(telemetry.vx)}</span>
                        <span className="ml-auto font-semibold"><span className="text-green-800">VY </span>{simpleRound(telemetry.vy)}</span>
                        <span className="ml-auto font-semibold"><span className="text-blue-800">VZ </span>{simpleRound(-1 * telemetry.vz)}</span>
                    </div>
                    <div className="flex flex-row">
                        <GlobeAltIcon className="h-6 w-6 text-blue-500" title="Position" />
                        <span className="font-medium capitalize">GPS</span>
                        <span className="ml-auto font-semibold"><span className="text-red-800">LAT </span>{simpleRound(telemetry.lat)}</span>
                        <span className="ml-auto font-semibold"><span className="text-blue-800">LON </span>{simpleRound(telemetry.lon)}</span>
                        <span className="ml-auto font-semibold"></span>
                    </div>
                    <div className="flex flex-row">
                        <ArrowPathIcon className="h-6 w-6 text-purple-500" title="Rotation" />
                        <span className="font-medium capitalize">Rotation</span>
                        <span className="ml-auto font-semibold"><span className="text-red-800">Roll </span>{simpleRound(telemetry.roll)}</span>
                        <span className="ml-auto font-semibold"><span className="text-green-800">Pitch </span>{simpleRound(telemetry.pitch)}</span>
                        <span className="ml-auto font-semibold"><span className="text-blue-800">Yaw </span>{simpleRound(telemetry.yaw)}</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row">
                    <Loading />
                    <span>Loading telemetry...</span>
                </div>
            )}
        </div>
    )
}

export default Telemetry;