import { useState } from "react"
import ButtonComponent from "./button";
import InputComponent from "./input";

interface SimulationAddressProps {
    connected: boolean;
    connectHandler: (address: string) => void;
    disconnectHandler: () => void;
    loading?: boolean;
    loadingMessage?: string;
}

const SimulationAddress = (s: SimulationAddressProps) => {
    const [address, setAddress] = useState<string>("127.0.0.1:14550");
    const [baudRate, setBaudRate] = useState<string>("115200");

    return (
        <div className="w-full flex gap-1">
            <InputComponent className="w-full" placeholder="Drone address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            <InputComponent className="w-full" placeholder="Baudrate" type="text" value={baudRate} onChange={(e) => setBaudRate(e.target.value)} />
            {s.connected
                ?
                <ButtonComponent className="" onClick={() => s.disconnectHandler()}>Disconnect</ButtonComponent>
                :
                <ButtonComponent disabled={s.loading} loadingMessage={s.loadingMessage} className="" onClick={() => s.connectHandler(address)}>Connect</ButtonComponent>
            }
        </div>
    )
}

export default SimulationAddress;