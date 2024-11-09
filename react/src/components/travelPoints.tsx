import { useState } from "react";
import ButtonComponent from "./button.tsx"
import { Point } from "../app.tsx";

const inputStyle = {
    padding: '10px 15px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    width: '100%',
    color: "black"
};

interface TravelPointsProps {
    points: Point[];
    setPoints: (points: Point[]) => void;
}

const TravelPoints = ({ points, setPoints }: TravelPointsProps) => {
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");

    const saveCords = () => {
        if (longitude && latitude) {
            setPoints([...points, { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }]);
            setLatitude("");
            setLongitude("");
        }
    };

    return (
        <>
            <div style={{
                width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                margin: "auto"
            }}>
                <ul style={{ width: "90%", margin: "20px auto", padding: "10px", border: "2px solid gray", height: "20vh", color: "white", fontSize: "20px", borderRadius: "5px", overflowY: "auto" }}>
                    {points.map((point, index) =>
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

                <div>
                    <input
                        type="text"
                        value={latitude}
                        style={inputStyle}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Latitude"
                    />
                </div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input
                        type="text"
                        value={longitude}
                        style={inputStyle}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Longitude"
                    />
                </div>
                <ButtonComponent onClick={saveCords}>Add</ButtonComponent>

            </div>
        </>

    );
}

export default TravelPoints;