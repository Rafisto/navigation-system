import { useState } from "react";
import { Socket } from "socket.io-client";
import MapComponent from "./map";
import TravelPoints from "./components/travelPoints";
import MAVLinkConnection from "./connection";
import Telemetry from "./api/telemetry";
import Manual from "./api/manual";

type Point = {
    longitude: number;
    latitude: number;
}

const App = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionAvailable, setConnectionAvailable] = useState<boolean>(false);

    // map params
    const [dronePosition, setDronePosition] = useState<Point>({ latitude: 0, longitude: 0 });
    const [droneRotation, setDroneRotation] = useState<number>(0);
    const [points, setPoints] = useState<Point[]>([]);

    return <div className="w-screen h-screen flex flex-col">
        <div>
            <h1 className="text-lg">Drone Navigation System</h1>
        </div>
        <div className="grid grid-cols-4 h-full">
            <div className="col-span-3 h-full">
                <MapComponent drone={dronePosition} points={points} setPoints={setPoints} />
            </div>
            <div className="col-span-1 flex flex-col">
                <MAVLinkConnection socket={socket} setSocket={setSocket} connected={connectionAvailable} setConnected={setConnectionAvailable} />
                {connectionAvailable && <Telemetry socket={socket} setDronePosition={setDronePosition} setDroneRotation={setDroneRotation} />}
                {connectionAvailable && <Manual socket={socket} rotation={droneRotation} />}
                <TravelPoints points={points} setPoints={setPoints} />

            </div>
        </div>
    </div>
}

export default App;
export type { Point };