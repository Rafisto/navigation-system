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

    return (
        <div className="w-full flex gap-1">
            <InputComponent className="flex-grow" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
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