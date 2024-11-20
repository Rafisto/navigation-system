import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Rotation } from '../app';
import InputComponent from '../components/input';
import InlineButtonComponent from '../components/inlinebutton';
import { PlusIcon, MinusIcon, ArrowPathIcon } from '@heroicons/react/16/solid';
import ButtonComponent from '../components/button';

interface ManaulProps {
    socket: Socket | null;
    rotation: Rotation;
}

function Manual({ socket, rotation }: ManaulProps) {
    const [yaw, setYaw] = useState<number>(0);

    const rotate = () => {
        if (socket) {
            socket.emit('rotate', { yaw: yaw });
        }
    };

    const rotateStep = (axis: string, step: number) => {
        if (socket) {
            switch (axis) {
                case 'yaw':
                    socket.emit('rotate', { yaw: rotation.yaw + step });
                    break;
                default:
                    break;
            }
        }
    }

    return (
        <div className="flex flex-col">
            {/* <span>XYZ</span> */}
            <span>Yaw</span>
            <div className="flex flex-row items-center space-x-2">
                <InlineButtonComponent
                    onClick={() => rotateStep('yaw', Math.PI / 8)}
                    className="bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <div className="flex flex-row">
                        R
                        <PlusIcon className="h-5 w-5" />

                    </div>
                </InlineButtonComponent>
                <InlineButtonComponent
                    onClick={() => rotateStep('yaw', -1 * Math.PI / 8)}
                    className="bg-red-500 text-white rounded hover:bg-red-600"
                >
                    <div className="flex flex-row">

                        <MinusIcon className="h-5 w-5" />
                        L
                    </div>
                </InlineButtonComponent>
                <InputComponent
                    type="number"
                    value={yaw}
                    onChange={(e) => setYaw(Number(e.target.value))}
                    placeholder="Yaw"
                    className="border border-gray-300 rounded text-center w-full"
                />
                <ButtonComponent
                    onClick={rotate}
                    className="flex items-center bg-green-500 text-white rounded hover:bg-green-600"
                >

                    <div className="flex flex-row">
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Rotate</span>
                    </div>
                </ButtonComponent>
            </div>
        </div>
    );
}

export default Manual;
