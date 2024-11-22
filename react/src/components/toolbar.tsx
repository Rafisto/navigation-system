interface MapToolbarProps {
  handleCreateShape: (shape: "circle" | "rectangle" | "polygon") => void;
  clearPaths: () => void;
}

const MapToolbar = ({ handleCreateShape, clearPaths }: MapToolbarProps) => {
  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-end items-center gap-4 py-4">
        <p>Draw Zones</p>
        <button
          onClick={() => handleCreateShape("circle")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Circle
        </button>
        <button
          onClick={() => handleCreateShape("rectangle")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Rectangle
        </button>
        <button
          onClick={() => handleCreateShape("polygon")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          N-Gon
        </button>
        <p>Actions</p>
        <button
          onClick={() => clearPaths()}
          className="px-4 py-2 rounded bg-red-500 hover:bg-red-700 hover:text-white"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default MapToolbar;
