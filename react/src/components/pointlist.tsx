import { Point } from "../app";

interface PointListProps {
    points: Point[];
    setPoints: (points: Point[]) => void;
}

const PointList = (props: PointListProps) => {
    if (props.points.length > 0) {
        return (
            <div style={{ backgroundColor: "#121212" }} className="p-1 rounded-sm">
                <ul>
                    {props.points.map((point, index) =>
                        <li key={index}>
                            <div className="flex flex-row">
                                <span>{index + 1}:</span>
                                <span>lat: {point.latitude}</span>
                                <span>lat: {point.longitude}</span>
                                <button>M</button>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    return (
        <></>
    )
}

export default PointList;