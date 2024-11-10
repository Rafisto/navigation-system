import { Point } from "../app";

interface PointListProps {
    points: Point[];
    setPoints: (points: Point[]) => void;
}

const PointList = (props: PointListProps) => {
    return (
        <ul style={{ width: "90%", margin: "20px auto", padding: "10px", border: "2px solid gray", height: "20vh", color: "white", fontSize: "20px", borderRadius: "5px", overflowY: "auto" }}>
            {props.points.map((point, index) =>
                <li key={index} style={{ marginLeft: "5px", width: "100%" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 4fr 4fr 1fr", width: "100%", height: "30px", borderBottom: "1px solid gray", margin: 0, fontSize: "10px", alignContent: "center" }}>
                        <div>{index + 1}:</div>
                        <div>lat: {point.latitude}</div>
                        <div>lat: {point.longitude}</div>
                        <button>M</button>
                    </div>
                </li>
            )}
        </ul>
    )
}

export default PointList;