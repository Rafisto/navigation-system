import time
from pymavlink import mavutil
from pymavlink.dialects.v20 import ardupilotmega as messages


class DroneController:
    def __init__(self, connection: mavutil.mavlink_connection):
        self.connection = connection
        self.connection.wait_heartbeat()
        print("Connected to drone")

    def set_mode(self, mode: int = 4):
        """Set drone flight mode, default is GUIDED mode (4)."""
        msg = messages.MAVLink_command_long_message(
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_CMD_DO_SET_MODE,
            0,
            1,
            mode,
            0, 0, 0, 0, 0
        )
        self.connection.mav.send(msg)
        print(f"Set mode to {mode}")

    def arm(self):
        """Arm the drone."""
        msg = messages.MAVLink_command_long_message(
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_CMD_COMPONENT_ARM_DISARM,
            0,
            1,
            0, 0, 0, 0, 0, 0
        )
        self.connection.mav.send(msg)
        print("Drone armed")

    def takeoff(self, altitude: float = 10.0):
        """Make the drone take off to a specified altitude."""
        msg = messages.MAVLink_command_long_message(
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_CMD_NAV_TAKEOFF,
            0,
            0, 0, 0, 0, 0, 0, altitude
        )
        self.connection.mav.send(msg)
        print(f"Takeoff initiated to altitude {altitude} meters")

    def reposition(self, latitude: float, longitude: float, altitude: float = 10.0):
        """Reposition the drone to a specified location and altitude."""
        lat = int(latitude * 1e7)
        lon = int(longitude * 1e7)
        msg = messages.MAVLink_command_int_message(
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_FRAME_GLOBAL_RELATIVE_ALT,
            messages.MAV_CMD_DO_REPOSITION,
            0,
            0, 0, 0, 0, 0, 0, lat, lon, altitude
        )
        self.connection.mav.send(msg)
        print(f"Repositioning to lat: {latitude}, lon: {
              longitude}, alt: {altitude}")

    def move(self, x: float = 0, y: float = 0, z: float = 0):
        """Move the drone in local NED frame based on x, y, and z offsets."""
        msg = messages.MAVLink_set_position_target_local_ned_message(
            0,  # time_boot_ms
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_FRAME_LOCAL_NED,
            3576,  # Position control mask
            x, y, z,
            0, 0, 0,  # velocity (ignored here)
            0, 0, 0,  # acceleration (ignored here)
            0, 0  # yaw (ignored here)
        )
        self.connection.mav.send(msg)
        print(f"Moving to offset x: {x}, y: {y}, z: {z}")

    def rotate(self, yaw: float):
        """Rotate the drone to a specified yaw angle."""
        msg = messages.MAVLink_set_position_target_local_ned_message(
            0,  # time_boot_ms
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_FRAME_LOCAL_NED,
            2503,  # Yaw control mask
            0, 0, 0,  # position (ignored here)
            0, 0, 0,  # velocity (ignored here)
            0, 0, 0,  # acceleration (ignored here)
            yaw, 0  # yaw, yaw_rate
        )
        self.connection.mav.send(msg)
        print(f"Rotating to yaw: {yaw}")
