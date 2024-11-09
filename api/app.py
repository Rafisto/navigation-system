from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from pymavlink import mavutil
from pymavlink.dialects.v20 import ardupilotmega as messages

from threading import Thread

import time
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

telemetry_thread = None
mavconnection = None
telemetry = None


def generate_telemetry_data():
    global mavconnection
    if mavconnection is None:
        return {}
    local_position_ned = mavconnection.recv_match(
        type='LOCAL_POSITION_NED', blocking=True).to_dict()
    gps_raw_int = mavconnection.recv_match(
        type='GPS_RAW_INT', blocking=True).to_dict()
    return {'x': local_position_ned.get('x'),
            'y': local_position_ned.get('y'),
            'z': local_position_ned.get('z'),
            'lat': gps_raw_int.get('lat') * 10**(-7),
            'lon': gps_raw_int.get('lon') * 10**(-7)}


def telemetry_background_task():
    while True:
        telemetry_data = generate_telemetry_data()
        socketio.emit('telemetry', telemetry_data)
        time.sleep(0.1)


@socketio.on('create_connection')
def create_connection(data):
    global mavconnection
    data = json.loads(data)
    address = data.get('address')

    if not address:
        emit('connection_response', {
             'status': "error",
             'message': "'address' parameter is missing"}, broadcast=False)
        return

    global telemetry_thread
    if telemetry_thread is None:
        telemetry_thread = Thread(target=telemetry_background_task)
        telemetry_thread.start()

    try:
        mavconnection = mavutil.mavlink_connection(address)
        mavconnection.wait_heartbeat()

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
    global mavconnection

    if mavconnection:
        mavconnection.close()
        emit('connection_response', {
            'status': "disconnected",
             'message': "Connection closed"}, broadcast=False)
        mavconnection = None
        telemetry_thread = None

    else:
        emit('connection_response', {
            'status': "error",
             'message': "Connection not found"}, broadcast=False)


if __name__ == '__main__':
    socketio.run(app=app, host="0.0.0.0", port=5000, debug=True)
