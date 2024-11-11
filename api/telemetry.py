import time

TELEMETRY_POOLING_TIME = 0.1


def telemetry_background_task(running, mavconnection, socketio):
    """
    Telemetry dispatcher
    """
    while running:
        telemetry_data = generate_telemetry_data(mavconnection)
        socketio.emit('telemetry', telemetry_data)
        time.sleep(TELEMETRY_POOLING_TIME)


def generate_telemetry_data(mavconnection):
    """
    Telemetry data extractor
    """
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
