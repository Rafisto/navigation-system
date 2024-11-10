import { Socket } from "socket.io-client";
import { Point } from "../app";
import ButtonComponent from "../components/button";

interface ManaulProps {
    socket: Socket | null;
    position: Point;
    points: Point[];
    setPoints: (points: Point[]) => void;
    setMissionPoints: (points: Point[]) => void;
}

const Mission = ({ socket, position, points, setPoints, setMissionPoints }: ManaulProps) => {

    const performMission = () => {
        if (socket) {
            console.info(position);
            let missionPoints = [position, ...points];
            socket.emit('mission', { 'mission': missionPoints.map(point => ({ lat: point.latitude, lon: point.longitude, alt: 15 })) });
            setMissionPoints(missionPoints);
            setPoints([]);
        }
    };


    return <div className="space-y-2">
        <ButtonComponent
            onClick={performMission}
        >
            <>
                Perfom Mission {points && points.length.toString()}
            </>
        </ButtonComponent>
    </div>
}

export default Mission;