import { useState } from "react";
import { Socket } from "socket.io-client";
import { Point } from "../app";
import ButtonComponent from "../components/button";

interface SinglePointNavigationProps {
    socket: Socket | null;
    points: Point[];
    setCurrentDestination: (destination: Point) => void;
    setPoints: (points: Point[]) => void;
}

const Single = ({ socket, points, setCurrentDestination, setPoints }: SinglePointNavigationProps) => {
    const [altitude, _] = useState<number>(15);
    // const [speed, setSpeed] = useState<number>(0);


    const handleSend = () => {
        if (socket) {
            setCurrentDestination(points[0]);
            setPoints([]);
            socket.emit("move_to", {
                lat: points[0].latitude,
                lon: points[0].longitude,
                alt: altitude,
            });
        }
    }

    return <div className="flex flex-col">
        {
            (points.length > 0)
                ?
                <>
                    <h1>Single Point Navigation</h1>
                    <ButtonComponent onClick={handleSend}><>Single Navigation to point 0</></ButtonComponent>
                </>
                :
                <>
                </>
        }
    </div>
}

export default Single;