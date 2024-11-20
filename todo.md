Wymagania systemu: 
- [x] Automatyczne latanie po zadanej ścieżce
- [x] Obracanie drona na zadane kąty 
- [x] Możliwość nadpisania ścieżki drona w każdym momencie 
- [x] Możliwość w miarę ręcznego sterowania dronem 
- [ ] No fly zoney w kształtach koła, prostokątu, 9-kąta wypukłego 

My take:
- Two-tier architecture (frontend-backend)
- Map, starting procedure

For 22-11-2024:
- [x] UI: create a textfield for specifying connection baud rate (default=115200) near the address field
- [x] Display telemetry:
  - [x] Information whether the drone is armed (can possibly be done by checking the heartbeat)
  - [x] v_xyz telemetry via GLOBAL_POSITION_INT docs below:
```
vx    int16_t    cm/s    Ground X Speed (Latitude, positive north)
vy    int16_t    cm/s    Ground Y Speed (Longitude, positive east)
vz    int16_t    cm/s    Ground Z Speed (Altitude, positive down)
```
- [ ] manual control (yaw ok), X+-, Y+-, Z+-, virtual joystick or/and keyboard (WASD) or/and real joystick
  - [x] manual rotation: can only modify yaw, because roll and pitch is used by the drone to move 
  - [ ] position: possible via invoking MAV_FRAME_LOCAL_OFFSET_NED
- create rectangular, circular and n-gonal no-fly-zones (can all be done on the frontend)
  - the no-fly zones are defined by the user on the map
  - static route recalculation, when the waypoint goes through the no-fly zone
  - no snap on no-fly zone, when the waypoint is close to the no-fly zone, it must be at least 2 meters away
- (optional) (offline) osm map download