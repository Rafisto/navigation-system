import { APITakeoff } from "./api/takeoff";
import ButtonComponent from "./components/button";
import MapComponent from "./map";

const Layout = () => {
    const TakeoffRequest = async () => {
        APITakeoff().then((data) => {
            console.log(data);
        });
    }

    return <div className="w-screen h-screen flex flex-col">
        <div>
            <h1 className="text-lg">Drone Navigation System</h1>
        </div>
        <div className="grid grid-cols-5 gap-1 h-full">
            <div className="col-span-4 h-full">
                <MapComponent />
            </div>
            <div className="col-span-1">
                Sidebar
                <ButtonComponent onClick={TakeoffRequest}>Takeoff</ButtonComponent>
            </div>
        </div>
    </div>
}

export default Layout;