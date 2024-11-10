import ButtonComponent from '../components/button';
import { Socket } from 'socket.io-client';

interface ManaulProps {
    socket: Socket | null;
    rotation: number;
}

function Manual({ socket, rotation }: ManaulProps) {

    const moveUp = () => {
        if (socket) {
            socket.emit('move', { direction: 'up', mask: 3576, z: -1 });
        }
    };

    const moveDown = () => {
        if (socket) {
            socket.emit('move', { direction: 'down', mask: 3576, z: -1 });
        }
    };

    const rotateLeft = () => {
        if (socket) {
            const newRotation = rotation - Math.PI / 8;
            socket.emit('rotate', { yaw: newRotation });
        }
    };

    const rotateRight = () => {
        if (socket) {
            const newRotation = rotation + Math.PI / 8;
            socket.emit('rotate', { yaw: newRotation });
        }
    };

    const flyForward = () => {
        if (socket) {
            socket.emit('move', { direction: 'forward', mask: 3576, x: Math.cos(rotation), y: Math.sin(rotation) });
        }
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            <ButtonComponent
                onClick={moveUp}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Move Up
            </ButtonComponent>
            <div className="flex space-x-2">
                <ButtonComponent
                    onClick={rotateLeft}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Rotate Left
                </ButtonComponent>
                <ButtonComponent
                    onClick={flyForward}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Fly Forward
                </ButtonComponent>
                <ButtonComponent
                    onClick={rotateRight}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Rotate Right
                </ButtonComponent>
            </div>
            <ButtonComponent
                onClick={moveDown}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Move Down
            </ButtonComponent>
        </div>
    );
}

export default Manual;
