import time
from pymavlink import mavutil
from pymavlink.dialects.v20 import ardupilotmega as messages

VELOCITY_CONST = 5

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

    def move(self, x: float = 0, y: float = 0, z: float = 0):
        """Move the drone in local NED frame based on x, y, and z offsets."""
        global VELOCITY_CONST
        msg = messages.MAVLink_set_position_target_local_ned_message(
            0,  # time_boot_ms
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_FRAME_LOCAL_OFFSET_NED,
            3576,  # Position control mask
            x * VELOCITY_CONST, y * VELOCITY_CONST, z,
            0, 0, 0,  # velocity (ignored here)
            0, 0, 0,  # acceleration (ignored here)
            0, 0  # yaw (ignored here)
        )
        self.connection.mav.send(msg)
        print(f"Moving to offset x: {x}, y: {y}, z: {z}")

    def move_to(self, latitude: float, longitude: float, altitude: float):
        """Move the drone to a specified global position."""
        lat = int(latitude * 1e7)
        lon = int(longitude * 1e7)
        msg = messages.MAVLink_command_int_message(
            # ground listed from 255
            # drone (device) listed from 0
            self.connection.target_system,  # which drone
            self.connection.target_component,  # which component
            messages.MAV_FRAME_GLOBAL_RELATIVE_ALT,  # frame
            messages.MAV_CMD_DO_REPOSITION,
            0, 0, 0, 0, 0, 0,
            lat,
            lon,
            altitude
        )
        self.connection.mav.send(msg)
        print(f"Moving to lat: {latitude}, lon: {longitude}, alt: {altitude}")

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

    def mission(self, waypoints):
        """Create a mission from a list of waypoints."""
        mission_items = []

        # Prepare the mission items
        for i, waypoint in enumerate(waypoints):
            lat = int(waypoint["lat"] * 10**7)  # Latitude as an integer
            lon = int(waypoint["lon"] * 10**7)  # Longitude as an integer
            alt = 10  # Altitude in meters
            print(f"Waypoint {i+1}: lat: {lat}, lon: {lon}, alt: {alt}")

            # Set 'current' to 1 for the first waypoint, 0 otherwise
            current = 1 if i == 0 else 0

            mission_item = messages.MAVLink_mission_item_int_message(
                self.connection.target_system,
                self.connection.target_component,
                i,
                messages.MAV_FRAME_GLOBAL_RELATIVE_ALT_INT,
                messages.MAV_CMD_NAV_WAYPOINT,
                current,  # Set current waypoint
                1,  # Autocontinue
                0, 0, 0, 0,
                lat, lon, alt
            )
            mission_items.append(mission_item)

        # Step 1: Send MISSION_COUNT
        self.connection.mav.mission_count_send(
            self.connection.target_system,
            self.connection.target_component,
            len(mission_items)
        )

        # Step 2: Wait for and respond to MISSION_REQUEST messages
        for mission_item in mission_items:
            # Wait for a MISSION_REQUEST for each item
            request = self.connection.recv_match(
                type='MISSION_REQUEST', blocking=True)
            if request and request.seq == mission_item.seq:
                # Send the requested mission item
                self.connection.mav.send(mission_item)
                print(f"Sent mission item {mission_item.seq}")

        # Step 3: Wait for MISSION_ACK
        # ack = self.connection.recv_match(type='MISSION_ACK', blocking=True)
        # print(f"Mission upload completed with result {ack}")

        time.sleep(1)
        print("Starting mission...")

        # Step 4: Start the mission
        self.connection.mav.command_long_send(
            self.connection.target_system,
            self.connection.target_component,
            messages.MAV_CMD_MISSION_START,
            0,  # Confirmation
            0,  # First waypoint
            0,  # Last waypoint
            0, 0, 0, 0, 0
        )

        print("Mission started")
