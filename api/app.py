from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from pymavlink import mavutil
from pymavlink.dialects.v20 import ardupilotmega as messages

import time
import json

from thread import StoppableThread
from controller import DroneController

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

telemetry_thread = None
drone_controller = None
mavconnection = None
telemetry = None


def generate_telemetry_data():
    global mavconnection
    if mavconnection is None:
        return {}

    try:
        local_position_ned = mavconnection.recv_match(
            type='LOCAL_POSITION_NED', blocking=True).to_dict()
        gps_raw_int = mavconnection.recv_match(
            type='GPS_RAW_INT', blocking=True).to_dict()
        attitude = mavconnection.recv_match(
            type='ATTITUDE', blocking=True).to_dict()
    except OSError:
        print("generate_telemetry_data connection closed abruptly")
        return {}

    return {'x': local_position_ned.get('x'),
            'y': local_position_ned.get('y'),
            'z': local_position_ned.get('z'),
            'lat': gps_raw_int.get('lat') * 10**(-7),
            'lon': gps_raw_int.get('lon') * 10**(-7),
            'roll': attitude.get('roll'),
            'pitch': attitude.get('pitch'),
            'yaw': attitude.get('yaw')}


def telemetry_background_task():
    while True:
        telemetry_data = generate_telemetry_data()
        socketio.emit('telemetry', telemetry_data)
        time.sleep(0.1)


@socketio.on('create_connection')
def create_connection(data):
    global mavconnection, telemetry_thread, drone_controller
    data = json.loads(data)
    address = data.get('address')

    if not address:
        emit('connection_response', {
             'status': "error",
             'message': "'address' parameter is missing"}, broadcast=False)
        return

    if telemetry_thread is None:
        telemetry_thread = StoppableThread(target=telemetry_background_task)
        telemetry_thread.start()

    try:
        mavconnection = mavutil.mavlink_connection(address)
        mavconnection.wait_heartbeat()

        drone_controller = DroneController(mavconnection)

        mavconnection.mav.param_request_list_send(
            mavconnection.target_system,
            mavconnection.target_component)

        emit('connection_response', {
            'status': "connected",
             'message': "Connection created"}, broadcast=False)
    except Exception as e:
        emit('connection_response', {
            'status': "error",
             'message': f"Connection failed: {str(e)}"}, broadcast=False)


@socketio.on('close_connection')
def close_connection():
    global mavconnection, telemetry_thread

    if mavconnection:
        mavconnection.close()
        emit('connection_response', {
            'status': "disconnected",
             'message': "Connection closed"}, broadcast=False)
        mavconnection = None
        telemetry_thread.stop()
        telemetry_thread.join()
        telemetry_thread = None

    else:
        emit('connection_response', {
            'status': "error",
             'message': "Connection not found"}, broadcast=False)


@socketio.on('arm')
def arm_drone():
    if drone_controller:
        try:
            drone_controller.arm()
            emit('logs', {'message': 'Arming requested'})
        except Exception as e:
            emit('logs', {'message': f'Error during arming: {str(e)}'})


@socketio.on('takeoff')
def takeoff_drone(data):
    altitude = data.get('altitude', 10.0)
    if drone_controller:
        try:
            drone_controller.takeoff(altitude)
            emit('logs', {'message': f'Takeoff requested at {altitude}m'})
        except Exception as e:
            emit('logs', {'message': f'Error during takeoff: {str(e)}'})


@socketio.on('reposition')
def reposition_drone(data):
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    altitude = data.get('altitude', 10.0)

    if not latitude or not longitude:
        emit('logs', {
            'message': 'Latitude and Longitude are required for repositioning'
        })
        return

    if drone_controller:
        try:
            drone_controller.reposition(latitude, longitude, altitude)
            emit('logs', {
                'message': f'Repositioning to {latitude}, {longitude}, {altitude}m'
            })
        except Exception as e:
            emit('logs', {
                'message': f'Error during repositioning: {str(e)}'
            })


@socketio.on('set_mode')
def set_mode(data):
    mode = data.get('mode')
    if drone_controller:
        try:
            drone_controller.set_mode(mode)
            emit('logs', {'message': f'Set mode to {mode}'})
            print(f"Set mode to {mode}")
        except Exception as e:
            emit('logs', {'message': f'Error setting mode: {str(e)}'})
            print(f"Error setting mode: {str(e)}")
    else:
        print("Drone not connected")


@socketio.on('move')
def handle_move(data):
    direction = data.get('direction')
    mask = data.get('mask', 3576)
    x, y, z = data.get('x', 0), data.get('y', 0), data.get('z', 0)

    if direction == 'up':
        drone_controller.move(z=-1)
    elif direction == 'down':
        drone_controller.move(z=1)
    elif direction == 'forward':
        drone_controller.move(x=x, y=y)
    emit('logs', {'message': f'Moved {direction}'})


@socketio.on('move_to')
def handle_move_to(data):
    lat = data.get('lat')
    lon = data.get('lon')
    alt = data.get('alt')
    drone_controller.move_to(lat, lon, alt)
    emit('logs', {'message': f'Moved to {lat}, {lon}, {alt}'})


@socketio.on('mission')
def handle_mission(data):
    mission = data.get('mission')
    print(mission)
    drone_controller.mission(mission)
    emit('logs', {'message': 'Mission requested'})


@socketio.on('rotate')
def handle_rotate(data):
    yaw = data.get('yaw')
    drone_controller.rotate(yaw)
    emit('logs', {'message': f'Rotated {yaw} degrees'})


if __name__ == '__main__':
    socketio.run(app=app, host="0.0.0.0", port=5000, debug=True)
