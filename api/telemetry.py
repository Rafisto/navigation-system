import time

TELEMETRY_POOLING_TIME = 0.01

def telemetry_background_task(running, mavconnection, socketio):
    """
    Telemetry dispatcher with caching for missing packets.
    """
    cache = {'local_position_ned': {}, 'global_position_int': {}, 'attitude': {}, 'mode': {}}

    while running:
        # Update telemetry data and emit it
        telemetry_data = generate_telemetry_data(mavconnection, cache)
        socketio.emit('telemetry', telemetry_data)
        time.sleep(TELEMETRY_POOLING_TIME)

def generate_telemetry_data(mavconnection, cache):
    """
    Telemetry data extractor and cache updater.
    
    :param mavconnection: MAVLink connection object.
    :param cache: Dictionary to cache previous packet data.
    :return: Dictionary containing telemetry data.
    """
    if mavconnection is None:
        return {}

    try:
        # Receive a packet of interest
        params = mavconnection.recv_match(
            type=['LOCAL_POSITION_NED', 'ATTITUDE', 'GLOBAL_POSITION_INT', 'HEARTBEAT'], blocking=True
        ).to_dict()

        packet_type = params.get('mavpackettype')

        # Update cache based on the packet type
        if packet_type == 'HEARTBEAT':
            cache['mode'] = params
        elif packet_type == 'LOCAL_POSITION_NED':
            cache['local_position_ned'] = params
        elif packet_type == 'GLOBAL_POSITION_INT':
            cache['global_position_int'] = params
        elif packet_type == 'ATTITUDE':
            cache['attitude'] = params

        print(f"Updated cache with packet type: {packet_type}")

    except OSError:
        print("generate_telemetry_data connection closed abruptly")
        return {}

    return {
        'x': cache['local_position_ned'].get('x'),
        'y': cache['local_position_ned'].get('y'),
        'z': cache['local_position_ned'].get('z'),
        'vx': cache['global_position_int'].get('vx', 0) * 10**(-2),
        'vy': cache['global_position_int'].get('vy', 0) * 10**(-2),
        'vz': cache['global_position_int'].get('vz', 0) * 10**(-2),
        'lat': cache['global_position_int'].get('lat', 0) * 10**(-7),
        'lon': cache['global_position_int'].get('lon', 0) * 10**(-7),
        'roll': cache['attitude'].get('roll'),
        'pitch': cache['attitude'].get('pitch'),
        'yaw': cache['attitude'].get('yaw'),
        'base': cache['mode'].get('base_mode'),
        'mode': cache['mode'].get('custom_mode')
    }
