import Loading from "./loading";

interface ButtonComponentProps {
    className?: string;
    children: JSX.Element | string;
    onClick: () => void;
    disabled?: boolean;
    loadingMessage?: string;
}

const ButtonComponent = (props: ButtonComponentProps) => {
    return (
        <button
            onClick={props.onClick}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${props.className}`}
            disabled={props.disabled}
        >
            {props.disabled ? (
                <span className="flex flex-row">
                    <Loading />
                    {props.loadingMessage || "Loading..."}
                </span>
            ) : (
                <span>
                    {props.children}
                </span>
            )}
        </button>
    );
}

export default ButtonComponent;