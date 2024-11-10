import { useState } from "react";
import { Socket } from "socket.io-client";
import ButtonComponent from "../components/button";
import InputComponent from "../components/input";

interface TakeoffProps {
    socket: Socket | null;
}

const Takeoff = ({ socket }: TakeoffProps) => {
    const [takeoffAltitude, setTakeoffAltitude] = useState<number>(10);

    const armDrone = () => {
        if (socket) {
            socket.emit('arm');
        }
    };

    const takeoffDrone = () => {
        if (socket) {
            socket.emit('takeoff', { altitude: takeoffAltitude });
        }
    };


    return <div>
        <h1 className="my-1">Takeoff</h1>
        <div className="space-y-2">
            <ButtonComponent
                onClick={armDrone}
            >
                Arm Drone
            </ButtonComponent>

            <div className="w-auto flex gap-1">
                <InputComponent
                    className="flex-grow"
                    type="number"
                    value={takeoffAltitude}
                    onChange={(e) => setTakeoffAltitude(Number(e.target.value))}
                    placeholder="Altitude"
                />
                <ButtonComponent
                    onClick={takeoffDrone}
                >
                    Takeoff
                </ButtonComponent>
            </div>
        </div>
    </div>
}

export default Takeoff;