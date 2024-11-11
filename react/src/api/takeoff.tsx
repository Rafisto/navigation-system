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
        <h1>Takeoff</h1>
        <div className="w-full flex flex-row gap-1">
            <ButtonComponent
                className="w-full"
                onClick={armDrone}
            >
                Arm Drone
            </ButtonComponent>
            <InputComponent
                type="number"
                value={takeoffAltitude}
                onChange={(e) => setTakeoffAltitude(Number(e.target.value))}
                placeholder="Altitude"
            />
            <ButtonComponent
                className="w-full"
                onClick={takeoffDrone}
            >
                Takeoff
            </ButtonComponent>

        </div>
    </div>
}

export default Takeoff;