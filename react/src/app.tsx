import { useState } from "react";
import { Socket } from "socket.io-client";
import MapComponent from "./map";
import MAVLinkConnection from "./connection";
import Telemetry from "./api/telemetry";
// import Manual from "./api/manual";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import Modes from "./api/modes";
import Takeoff from "./api/takeoff";
import Mission from "./api/mission";
import PointList from "./components/pointlist";
import Single from "./api/single";
import Logs from "./api/logs";

type Point = {
    longitude: number;
    latitude: number;
}

type Rotation = {
    roll: number;
    pitch: number;
    yaw: number;
}

const App = () => {
    // connection params
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionAvailable, setConnectionAvailable] = useState<boolean>(false);

    // map params
    const [dronePosition, setDronePosition] = useState<Point>({ latitude: 0, longitude: 0 });
    const [droneRotation, setDroneRotation] = useState<Rotation>({ roll: 0, pitch: 0, yaw: 0 });
    const [points, setPoints] = useState<Point[]>([]);
    const [missionPoints, setMissionPoints] = useState<Point[]>([]);
    const [currentDestination, setCurrentDestination] = useState<Point>();

    return <div className="w-screen h-screen flex flex-col">
        <div className="grid grid-cols-4 h-full">
            <div className="col-span-3 h-full">
                <div className="col-span-3 h-full relative">
                    {connectionAvailable &&
                        <>
                            {/* PointList in the lower left corner */}
                            <div className="absolute bottom-0 left-0 m-4" style={{ zIndex: 100 }}>
                                <PointList points={points} setPoints={setPoints} />
                            </div>
                            <div className="absolute bottom-0 right-0 m-4" style={{ zIndex: 100 }}>
                                <Logs socket={socket} />
                            </div>
                            {/* Telemetry in the lower right corner */}
                            {/* <div className="absolute top-0 right-0 m-4 z-10">
                                <Telemetry socket={socket} setDronePosition={setDronePosition} setDroneRotation={setDroneRotation} />
                            </div> */}
                        </>
                    }
                    <MapComponent
                        drone={dronePosition}
                        droneRotation={droneRotation}
                        points={points}
                        setPoints={setPoints}
                        currentDestination={currentDestination}
                        missionPoints={missionPoints}
                    />
                </div>
            </div>
            <div className="col-span-1 flex flex-col px-2">
                <h1 className="text-center text-lg m-2">Drone Navigation System</h1>
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
                        <Single socket={socket} points={points} setPoints={setPoints} setCurrentDestination={setCurrentDestination} />
                        <Mission socket={socket} position={dronePosition} points={points} setPoints={setPoints} setMissionPoints={setMissionPoints} />
                        {/* <Manual socket={socket} rotation={droneRotation} /> */}
                    </>
                }
            </div>
        </div>
    </div>
}

export default App;
export type { Point, Rotation };