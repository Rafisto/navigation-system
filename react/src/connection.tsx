import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import SimulationAddress from './components/address';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/16/solid';

interface ServerResponse {
    status: "connected" | "disconnected" | "error";
    message: string;
}

interface MAVLinkConnectionProps {
    socket: Socket | null;
    setSocket: (socket: Socket) => void;
    connected: boolean;
    setConnected: (connected: boolean) => void;
}

function MAVLinkConnection({ socket, setSocket, connected, setConnected }: MAVLinkConnectionProps) {
    const [isConnecting, setIsConnecting] = useState<boolean>(false);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connection_response', (response: ServerResponse) => {
            setIsConnecting(false);
            if (response.status === "connected") {
                setConnected(true);
            }
            else if (response.status === "disconnected") {
                setConnected(false);
            }
            else {
                setConnected(false);
                console.error("error" + response.message);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const CreateConnection = (address: string) => {
        setIsConnecting(true);
        if (socket) {
            socket.emit('create_connection', JSON.stringify({ "address": address }));
        }
    };

    const CloseConnection = () => {
        if (socket) {
            socket.emit('close_connection');
        }
    };

    return (
        <div>
            <p className="flex">
                Status: 
                {connected ?
                    <>
                        <CheckCircleIcon color="green" width="15px" />
                        <span style={{ color: "green" }}>Connected</span>
                    </> :
                    <>
                        <XCircleIcon color="red" width="15px" />
                        <span style={{ color: "red" }}>Disconnected</span>
                    </>
                }
            </p>
            <SimulationAddress loading={isConnecting} loadingMessage={"Connecting..."} connected={connected} connectHandler={CreateConnection} disconnectHandler={CloseConnection} />
        </div>
    );
}

export default MAVLinkConnection;