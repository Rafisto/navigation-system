import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import SimulationAddress from './components/address';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/16/solid';
import ButtonComponent from './components/button';
import InputComponent from './components/input';

interface ServerResponse {
    status: "connected" | "disconnected" | "error";
    message: string;
}

interface MAVLinkConnectionProps {
    socket: Socket | null;
    setSocket: (socket: Socket) => void;
    connected: boolean;
    setConnected: (connected: boolean) => void;
}

const MODE_MAP = {
    stabilize: 0,
    guided: 4,
    rtl: 6,
};

function MAVLinkConnection({ socket, setSocket, connected, setConnected }: MAVLinkConnectionProps) {
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    // inputs, todo: move to another modules
    const [altitude, setAltitude] = useState<number>(10);
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [flightMode, setFlightMode] = useState<keyof typeof MODE_MAP>("stabilize");

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connection_response', (response: ServerResponse) => {
            setIsConnecting(false);
            if (response.status === "connected") {
                setConnected(true);
            }
            else if (response.status === "disconnected") {
                setConnected(false);
            }
            else {
                setConnected(false);
                console.error("error" + response.message);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const CreateConnection = (address: string) => {
        setIsConnecting(true);
        if (socket) {
            socket.emit('create_connection', JSON.stringify({ "address": address }));
        }
    };

    const CloseConnection = () => {
        if (socket) {
            socket.emit('close_connection');
        }
    };

    // controller commands

    const switchMode = (modeValue: number) => {
        if (socket && connected) {
            socket.emit('set_mode', { mode: modeValue });
        }
    };

    const armDrone = () => {
        if (socket && connected) {
            socket.emit('arm');
        }
    };

    const takeoffDrone = () => {
        if (socket && connected) {
            socket.emit('takeoff', { altitude });
        }
    };

    const repositionDrone = () => {
        if (socket && connected) {
            socket.emit('reposition', { latitude, longitude, altitude });
        }
    };

    return (
        <div>
            <p className="flex">
                Status:
                {connected ?
                    <>
                        <CheckCircleIcon color="green" width="15px" />
                        <span style={{ color: "green" }}>Connected</span>
                    </> :
                    <>
                        <XCircleIcon color="red" width="15px" />
                        <span style={{ color: "red" }}>Disconnected</span>
                    </>
                }
            </p>
            <SimulationAddress loading={isConnecting} loadingMessage={"Connecting..."} connected={connected} connectHandler={CreateConnection} disconnectHandler={CloseConnection} />
            {connected &&
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <ButtonComponent
                            onClick={() => {
                                setFlightMode("stabilize");
                                switchMode(MODE_MAP["stabilize"]);
                            }}
                            disabled={!connected}
                            className={flightMode === "stabilize" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}
                        >
                            Stabilize
                        </ButtonComponent>

                        <ButtonComponent
                            onClick={() => {
                                setFlightMode("guided");
                                switchMode(MODE_MAP["guided"]);
                            }}
                            disabled={!connected}
                            className={flightMode === "guided" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}
                        >
                            Guided
                        </ButtonComponent>

                        <ButtonComponent
                            onClick={() => {
                                setFlightMode("rtl");
                                switchMode(MODE_MAP["rtl"]);
                            }}
                            disabled={!connected}
                            className={flightMode === "rtl" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}
                        >
                            RTL
                        </ButtonComponent>
                    </div>
                    <ButtonComponent
                        onClick={armDrone}
                    >
                        Arm Drone
                    </ButtonComponent>

                    <div className="w-auto flex gap-1">
                        <InputComponent
                            className="flex-grow"
                            type="number"
                            value={altitude}
                            onChange={(e) => setAltitude(Number(e.target.value))}
                            placeholder="Altitude"
                        />
                        <ButtonComponent
                            onClick={takeoffDrone}
                        >
                            Takeoff
                        </ButtonComponent>
                    </div>

                    <div className="w-auto flex gap-1">
                        <InputComponent
                            className="flex-grow"
                            type="number"
                            value={latitude}
                            onChange={(e) => setLatitude(Number(e.target.value))}
                            placeholder="Latitude"
                        />
                        <InputComponent
                            className="flex-grow"
                            type="number"
                            value={longitude}
                            onChange={(e) => setLongitude(Number(e.target.value))}
                            placeholder="Longitude"
                        />
                        <ButtonComponent
                            onClick={repositionDrone}
                        >
                            Reposition
                        </ButtonComponent>
                    </div>
                </div>
            }
        </div>
    );
}

export default MAVLinkConnection;