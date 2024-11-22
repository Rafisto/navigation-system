import { Socket } from "socket.io-client";
import { Point, Shape } from "../app";
import ButtonComponent from "../components/button";

interface ManaulProps {
  socket: Socket | null;
  position: Point;
  points: Point[];
  setPoints: (points: Point[]) => void;
  setMissionPoints: (points: Point[]) => void;
  zones: Shape[];
  path: Point[];
}

const Mission = ({
  socket,
  position,
  points,
  setPoints,
  setMissionPoints,
  zones,
  path,
}: ManaulProps) => {
  const performMission = (path?: Point[]) => {
    if (socket) {
      let missionPoints = path ? path : [position, ...points];
      socket.emit("mission", {
        mission: missionPoints.map((point) => ({
          lat: point.latitude,
          lon: point.longitude,
          alt: 15,
        })),
      });
      setMissionPoints(missionPoints);
      setPoints([]);
    }
  };

  if (points.length > 0 && zones.length == 0) {
    return (
      <div className="space-y-2">
        <h1>Mission</h1>
        <ButtonComponent onClick={performMission}>
          <>Perfom Mission {points && points.length.toString()}</>
        </ButtonComponent>
      </div>
    );
  } else if (points.length > 0 && zones.length > 0 && path.length == 0) {
    return (
      <div className="space-y-2">
        <h1>Mission</h1>
        <p>
          <>Zones detected. Must pathfind first.</>
        </p>
      </div>
    );
  } else if (points.length > 0 && zones.length > 0 && path.length > 0) {
    return (
      <div className="space-y-2">
        <h1>Mission</h1>
        <ButtonComponent onClick={() => performMission(path)}>
          <>Perfom Mission via Pathfind</>
        </ButtonComponent>
      </div>
    );
  } else {
    return <div className="space-y-2"></div>;
  }
};

export default Mission;
