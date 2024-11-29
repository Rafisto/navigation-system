from threading import Thread

from pymavlink import mavutil
from pymavlink.dialects.v20 import ardupilotmega as messages

from controller import DroneController
from telemetry import telemetry_background_task

"""
DroneConnection is an object to store the connection data as well as running threads
"""
class DroneConnection(object):
    def __init__(self, socket):
        self.socket = socket
        self.mavconnection = None
        self.drone_controller = None
        self.telemetry_thread: Thread | None = None
        self.telemetry = None

    def is_available(self) -> bool:
        """
        Is the connection currently available
        """
        return self.mavconnection != None

    def connect(self, address="127.0.0.1:14550") -> bool:
        """
        Try to establish connection with the provided IP address combination
        """
        try:
            self.mavconnection = mavutil.mavlink_connection(address)
            self.mavconnection.wait_heartbeat()
            
            # Set telemetry rate for ATTITUDE (message ID 30) to 10 Hz (100,000 microseconds)
            message_id = 30  # Message ID for ATTITUDE
            rate_hz = 100  # Desired rate in Hz
            interval_us = int(1e6 / rate_hz)  # Convert Hz to microseconds

            # Send SET_MESSAGE_INTERVAL command
            self.mavconnection.mav.command_long_send(
                self.mavconnection.target_system,  # Target system ID
                self.mavconnection.target_component,  # Target component ID
                mavutil.mavlink.MAV_CMD_SET_MESSAGE_INTERVAL,  # Command
                0,  # Confirmation (0 = no confirmation)
                message_id,  # Message ID
                interval_us,  # Interval in microseconds
                0, 0, 0, 0, 0  # Unused parameters
            )
            print("Connected successfully")
            return True
        except:
            print("Unable to connect")
            return False

    def disconnect(self) -> None:
        """
        Disable telemetry thread and disconnect silently
        """
        self.telemetry_thread = Thread(
            target=telemetry_background_task,
            args=(False, self.mavconnection, self.socket)
        )

    def create_controller(self) -> None:
        """
        Create drone controller instance provided the mavconnection is available, throw otherwise
        """
        if self.mavconnection == None:
            raise ValueError("Mavlink connection has not been established.")
        
        self.drone_controller = DroneController(self.mavconnection)

        self.mavconnection.mav.param_request_list_send(
            self.mavconnection.target_system,
            self.mavconnection.target_component)

    def create_telemetry_thread(self) -> None:
        """
        Create a telemetry thread provided:
        - The Running State = True (the thread starts collecting telemetry immediately)
        - The current mavconnection - Where to collect the telemetry data from
        - The SocketIO socket - Forward the telemetry to frontend
        """
        running = True
        self.telemetry_thread = Thread(
            target=telemetry_background_task,
            args=(running, self.mavconnection, self.socket)
        )
        self.telemetry_thread.start()
