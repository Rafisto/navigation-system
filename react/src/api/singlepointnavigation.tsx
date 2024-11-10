import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Point } from "../app";

interface SinglePointNavigationProps {
    socket: Socket | null;
    points: Point[];
    setCurrentDestination: (destination: Point) => void;
}

const SinglePointNavigation = ({ socket, points, setCurrentDestination }: SinglePointNavigationProps) => {
    const [altitude, setAltitude] = useState<number>(10);
    const [selectedPoint, setSelectedPoint] = useState<number>(-1);
    // const [speed, setSpeed] = useState<number>(0);

    useEffect(() => {
        if (selectedPoint >= points.length) {
            setSelectedPoint(-1);
        }
    })

    const handleSend = () => {
        if (socket) {
            setCurrentDestination(points[selectedPoint]);
            socket.emit("move_to", {
                lat: points[selectedPoint].latitude,
                lon: points[selectedPoint].longitude,
                alt: altitude,
                // speed: speed
            });
        }
    }

    return <div className="flex flex-col">
        <h1>Single Point Navigation</h1>
        {points.length > 0 ?
            <>
                {selectedPoint >= 0 &&
                    <div>
                        <span> Selected Point: {selectedPoint} {points[selectedPoint].latitude} {points[selectedPoint].longitude}</span>
                    </div>
                }
                {points.map((point, index) => {
                    return <button key={index} onClick={() => setSelectedPoint(index)}>{point.latitude}, {point.longitude}</button>
                })}
            </>
            :
            <div>
                <span>Select a point from a map</span>
            </div>
        }
        <div className="flex flex-col">
            <label>Altitude</label>
            <input type="number" value={altitude} onChange={(e) => setAltitude(parseFloat(e.target.value))} />
        </div>
        {/* <div className="flex flex-col">
            <label>Speed</label>
            <input type="number" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
        </div> */}
        <button onClick={handleSend}>Send</button>
    </div>
}

export default SinglePointNavigation;