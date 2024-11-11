from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from pymavlink import mavutil
from pymavlink.dialects.v20 import ardupilotmega as messages

import time
import json

from connection import DroneConnection
from controller import DroneController

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

connection = DroneConnection(socket=socketio)


@socketio.on('create_connection')
def create_connection(data):
    data = json.loads(data)
    address = data.get('address')

    if not address:
        emit('connection_response', {
             'status': "error",
             'message': "'address' parameter is missing"}, broadcast=False)
        return

    res = connection.connect(address)
    if not res:
        emit('connection_response', {
            'status': "error",
            'message': f"Connection failed"}, broadcast=False)

    connection.create_controller()
    connection.create_telemetry_thread()

    emit('connection_response', {
        'status': "connected",
        'message': "Connection created"}, broadcast=False)

    return


@socketio.on('close_connection')
def close_connection():
    res = connection.disconnect()
    if not res:
        emit('connection_response', {
            'status': "error",
            'message': f"Disconnect failed"}, broadcast=False)


@socketio.on('arm')
def arm_drone():
    if connection.drone_controller:
        try:
            connection.drone_controller.arm()
            emit('logs', {'message': 'Arming requested'})
        except Exception as e:
            emit('logs', {'message': f'Error during arming: {str(e)}'})


@socketio.on('takeoff')
def takeoff_drone(data):
    altitude = data.get('altitude', 10.0)
    if connection.drone_controller:
        try:
            connection.drone_controller.takeoff(altitude)
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

    if connection.drone_controller:
        try:
            connection.drone_controller.reposition(
                latitude, longitude, altitude)
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
    if connection.drone_controller:
        try:
            connection.drone_controller.set_mode(mode)
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
        connection.drone_controller.move(z=-1)
    elif direction == 'down':
        connection.drone_controller.move(z=1)
    elif direction == 'forward':
        connection.drone_controller.move(x=x, y=y)
    emit('logs', {'message': f'Moved {direction}'})


@socketio.on('move_to')
def handle_move_to(data):
    lat = data.get('lat')
    lon = data.get('lon')
    alt = data.get('alt')
    connection.drone_controller.move_to(lat, lon, alt)
    emit('logs', {'message': f'Moved to {lat}, {lon}, {alt}'})


@socketio.on('mission')
def handle_mission(data):
    mission = data.get('mission')
    print(mission)
    connection.drone_controller.mission(mission)
    emit('logs', {'message': 'Mission requested'})


@socketio.on('rotate')
def handle_rotate(data):
    yaw = data.get('yaw')
    if not yaw:
        emit('logs', {'message': 'Yaw is required for rotation'})

    if not connection.drone_controller:
        emit('logs', {'message': 'Drone not connected'})
        return

    connection.drone_controller.rotate(yaw)
    emit('logs', {'message': f'Rotated to yaw = {yaw}'})


if __name__ == '__main__':
    socketio.run(app=app, host="0.0.0.0", port=5000, debug=True)
