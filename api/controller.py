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
