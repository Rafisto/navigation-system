import { XCircleIcon } from "@heroicons/react/16/solid";
import { Shape } from "../app";

interface ZoneListProps {
    zones: Shape[];
    setZones: (zones: Shape[]) => void;
}

const ZoneList = (props: ZoneListProps) => {
    if (props.zones.length > 0) {
        return (
            <div className="p-1 rounded-sm bg-gray-800 bg-opacity-50">
                <ul>
                    {props.zones.map((zone, index) =>
                        <li key={index}>
                            <div className="flex flex-row justify-between">
                                <span className="px-2">({index + 1})t={zone.type} p={zone.points.length}</span>
                                {/* remove */}
                                <button onClick={() => props.setZones(props.zones.filter((_, i) => i !== index))}>
                                    <XCircleIcon color="red" width="15px" />
                                </button>
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

export default ZoneList;