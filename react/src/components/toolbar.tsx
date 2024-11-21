interface MapToolbarProps {
    handleCreateShape: (shape: "circle" | "rectangle" | "polygon") => void;
}

const MapToolbar = ({handleCreateShape}: MapToolbarProps) => {
    return <div>
        {/* Toolbar */}
        <div className="flex justify-end items-center gap-4 py-4">
            <p>Draw Zones</p>
            <button
                onClick={() => handleCreateShape("circle")}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-blue-500 hover:text-white"
            >
                Circle
            </button>
            <button
                onClick={() => handleCreateShape("rectangle")}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-blue-500 hover:text-white"
            >
                Rectangle
            </button>
            <button
                onClick={() => handleCreateShape("polygon")}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-blue-500 hover:text-white"                
            >
                N-Gon
            </button>
        </div>
    </div>
}

export default MapToolbar;