from flask import Flask, jsonify
from flask_cors import CORS
from pymavlink import mavutil
from pymavlink.dialects.v20 import ardupilotmega as messages
import time

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

connection = mavutil.mavlink_connection("127.0.0.1:14550") # default ardupilot port
connection.wait_heartbeat()

@app.get('/api/')
def home():
    return jsonify(message="Welcome to the System")

@app.get('/api/takeoff')
def takeoff():
    # mavlink based on https://mavlink.io/en/messages/common.html
    # copter modes flight modes https://ardupilot.org/copter/docs/flight-modes.html
    msg = messages.MAVLink_command_long_message(
        # ground listed from 255
        # drone (device) listed from 0
        connection.target_system, # which drone
        connection.target_component, # which component
        messages.MAV_CMD_DO_SET_MODE, # command
        0, # confirmation
        1, # mode (nothing changes)
        4, # GUIDED, see FLTMODE at https://ardupilot.org/copter/docs/parameters.html#fldmode1
        0,
        0,
        0,
        0,
        0
    )

    connection.mav.send(msg)

    msg = messages.MAVLink_command_long_message(
        # ground listed from 255
        # drone (device) listed from 0
        connection.target_system, # which drone
        connection.target_component, # which component
        messages.MAV_CMD_COMPONENT_ARM_DISARM, # command
        0, # confirmation
        1, # 1 - ARM, 0 - DISARM
        0, 
        0,
        0,
        0,
        0,
        0
    )

    connection.mav.send(msg)

    time.sleep(5)

    msg = messages.MAVLink_command_long_message(
        # ground listed from 255
        # drone (device) listed from 0
        connection.target_system, # which drone
        connection.target_component, # which component
        messages.MAV_CMD_NAV_TAKEOFF, # command
        0, # confirmation
        0, # pitch
        0, # roll
        0, # yaw
        0, # latitude
        0, # longitude
        0,
        10 # altitude
    )
    
    connection.mav.send(msg)
    
    return jsonify({"message": "Takeoff successful"}), 200
    

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)