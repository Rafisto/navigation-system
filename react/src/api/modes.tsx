import { useState } from "react";
import { Socket } from "socket.io-client";
import InlineButtonComponent from "../components/inlinebutton";

interface ModesProps {
    socket: Socket | null;
}

const MODE_MAP = {
    "stabilize": 0,
    "guided": 4,
    "rtl": 6,
    "auto": 10,
};

const Modes = ({ socket }: ModesProps) => {
    const [flightMode, setFlightMode] = useState<keyof typeof MODE_MAP>("stabilize");

    const switchMode = (modeValue: number) => {
        if (socket) {
            socket.emit('set_mode', { mode: modeValue });
        }
    };

    return <div>
        <h1 className="my-1">Modes</h1>
        <div className="flex gap-2">
            <InlineButtonComponent
                onClick={() => {
                    setFlightMode("stabilize");
                    switchMode(MODE_MAP["stabilize"]);
                }}
                className={flightMode === "stabilize" ? "bg-green-700 text-white" : "bg-gray-800 text-gray-700"}
            >
                Stabilize
            </InlineButtonComponent>

            <InlineButtonComponent
                onClick={() => {
                    setFlightMode("guided");
                    switchMode(MODE_MAP["guided"]);
                }}
                className={flightMode === "guided" ? "bg-green-800 text-white" : "bg-gray-800 text-gray-700"}
            >
                Guided
            </InlineButtonComponent>

            <InlineButtonComponent
                onClick={() => {
                    setFlightMode("rtl");
                    switchMode(MODE_MAP["rtl"]);
                }}
                className={flightMode === "rtl" ? "bg-green-800 text-white" : "bg-gray-800 text-gray-700"}
            >
                RTL
            </InlineButtonComponent>

            <InlineButtonComponent
                onClick={() => {
                    setFlightMode("auto");
                    switchMode(MODE_MAP["auto"]);
                }}
                className={flightMode === "auto" ? "bg-green-800 text-white" : "bg-gray-800 text-gray-700"}
            >
                Auto
            </InlineButtonComponent>
        </div>
    </div>
}

export default Modes;