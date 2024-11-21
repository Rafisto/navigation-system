import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import SimulationAddress from './components/address';

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

    // controller commands

   
    return (
        <SimulationAddress loading={isConnecting} loadingMessage={"Connecting..."} connected={connected} connectHandler={CreateConnection} disconnectHandler={CloseConnection} />
    );
}

export default MAVLinkConnection;