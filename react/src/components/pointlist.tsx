import { XCircleIcon } from "@heroicons/react/16/solid";
import { Point } from "../app";

interface PointListProps {
    points: Point[];
    setPoints: (points: Point[]) => void;
}

const PointList = (props: PointListProps) => {
    if (props.points.length > 0) {
        return (
            <div className="mx-2 p-1 rounded-sm bg-gray-800 bg-opacity-50">
                <ul>
                    {props.points.map((point, index) =>
                        <li key={index}>
                            <div className="flex flex-row justify-between">
                                <span className="px-1">({index + 1})lat={point.latitude} lat={point.longitude}</span>
                                {/* remove */}
                                <button onClick={() => props.setPoints(props.points.filter((_, i) => i !== index))}>
                                    <XCircleIcon color="red" width="15px" />
                                </button>
                            </div>
                            <div className="flex flex-row">


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