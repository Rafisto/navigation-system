interface ButtonComponentProps {
    children: JSX.Element | string;
    onClick: () => void;
}

const ButtonComponent = (props: ButtonComponentProps) => {
    return (
        <button
            onClick={props.onClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
            {props.children}
        </button>
    );
}

export default ButtonComponent;