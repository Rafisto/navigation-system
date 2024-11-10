import { useState } from "react";
import { Socket } from "socket.io-client";
import MapComponent from "./map";
import MAVLinkConnection from "./connection";
import Telemetry from "./api/telemetry";
// import Manual from "./api/manual";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import Modes from "./api/modes";
import Takeoff from "./api/takeoff";
import SinglePointNavigation from "./api/singlepointnavigation";
import Mission from "./api/mission";
import Manual from "./api/manual";
import PointList from "./components/pointlist";

type Point = {
    longitude: number;
    latitude: number;
}

const App = () => {
    // connection params
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionAvailable, setConnectionAvailable] = useState<boolean>(false);

    // map params
    const [dronePosition, setDronePosition] = useState<Point>({ latitude: 0, longitude: 0 });
    const [droneRotation, setDroneRotation] = useState<number>(0);
    const [points, setPoints] = useState<Point[]>([]);
    const [missionPoints, setMissionPoints] = useState<Point[]>([]);
    const [currentDestination, setCurrentDestination] = useState<Point>();

    return <div className="w-screen h-screen flex flex-col">
        <div>
            <h1 className="text-lg">Drone Navigation System</h1>
        </div>
        <div className="grid grid-cols-4 h-full">
            <div className="col-span-3 h-full">
                <MapComponent drone={dronePosition} points={points} setPoints={setPoints} currentDestination={currentDestination} missionPoints={missionPoints} />
            </div>
            <div className="col-span-1 flex flex-col px-2">
                <div className="flex flex-row">
                    <h1>Controls</h1>
                    <span className="grow" />
                    <span className="flex">
                        {connectionAvailable ?
                            <>
                                <CheckCircleIcon color="green" width="15px" />
                                <span style={{ color: "green" }}>Connected</span>
                            </> :
                            <>
                                <XCircleIcon color="red" width="15px" />
                                <span style={{ color: "red" }}>Disconnected</span>
                            </>
                        }
                    </span>
                </div>
                <MAVLinkConnection socket={socket} setSocket={setSocket} connected={connectionAvailable} setConnected={setConnectionAvailable} />
                {connectionAvailable &&
                    <>
                        <Modes socket={socket} />
                        <Telemetry socket={socket} setDronePosition={setDronePosition} setDroneRotation={setDroneRotation} />
                        <Takeoff socket={socket} />
                        {/* <SinglePointNavigation socket={socket} points={points} setCurrentDestination={setCurrentDestination} /> */}
                        <PointList points={points} setPoints={setPoints} />
                        <Mission socket={socket} position={dronePosition} points={points} setPoints={setPoints} setMissionPoints={setMissionPoints} />
                        {/* <Manual socket={socket} rotation={droneRotation} /> */}
                    </>
                }
            </div>
        </div>
    </div>
}

export default App;
export type { Point };