import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Rotation } from "../app";
import InputComponent from "../components/input";
import InlineButtonComponent from "../components/inlinebutton";
import { PlusIcon, MinusIcon, ArrowPathIcon } from "@heroicons/react/16/solid";
import ButtonComponent from "../components/button";
import Joystick from "../components/joystick2D";
import Joystick1DV from "../components/joystick1DV";

interface ManaulProps {
  socket: Socket | null;
  rotation: Rotation;
}

function Manual({ socket, rotation }: ManaulProps) {
  const [yaw, setYaw] = useState<string>("");
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [z, setZ] = useState<number>(0);

  const rotate = () => {
    let yw = parseFloat(yaw);
    if (isNaN(yw)) {
      setYaw("");
      return;
    }
    if (socket) {
      socket.emit("rotate", { yaw: yw });
    }
  };

  const rotateStep = (axis: string, step: number) => {
    if (socket) {
      switch (axis) {
        case "yaw":
          socket.emit("rotate", { yaw: rotation.yaw + step });
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (position.x !== 0 || position.y !== 0) {
        if (socket) {
          socket.emit("move", { x: -1 * position.y, y: position.x });
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [position, socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (z !== 0) {
        if (socket) {
          socket.emit("move", { z: -1 * z });
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [z, socket]);

  return (
    <div>
      <h1>Manual</h1>
      <div className="grid grid-cols-2 gap-6 mt-2">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-col items-center">
            <span className="mb-2">XY</span>
            <Joystick position={position} setPosition={setPosition} />
          </div>
          <div className="flex flex-col items-center">
            <span className="mb-2">Z</span>
            <Joystick1DV position={z} setPosition={setZ} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="mb-2 self-center">Yaw</span>
          <div className="flex flex-row align-center justify-center space-x-2">
            <InlineButtonComponent
              onClick={() => rotateStep("yaw", Math.PI / 8)}
              className="bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <div className="flex flex-row">
                R
                <PlusIcon className="h-5 w-5" />
              </div>
            </InlineButtonComponent>
            <InlineButtonComponent
              onClick={() => rotateStep("yaw", (-1 * Math.PI) / 8)}
              className="bg-red-500 text-white rounded hover:bg-red-600"
            >
              <div className="flex flex-row">
                <MinusIcon className="h-5 w-5" />L
              </div>
            </InlineButtonComponent>
          </div>
          <InputComponent
            type="text"
            value={yaw}
            onChange={(e) => setYaw(e.target.value)}
            placeholder="Yaw"
            className="border border-gray-300 rounded text-center"
          />
          <ButtonComponent
            onClick={rotate}
            className="flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <div className="flex flex-row">
              <ArrowPathIcon className="h-5 w-5" />
              <span>Rotate</span>
            </div>
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
}

export default Manual;
