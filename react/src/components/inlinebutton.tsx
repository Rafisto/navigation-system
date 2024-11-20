import Loading from "./loading";

interface ButtonComponentProps {
    className?: string;
    children: JSX.Element | string;
    onClick?: () => void;
    disabled?: boolean;
    loadingMessage?: string;
    onPointerUp?: () => void;
    onPointerDown?: () => void;
    onPointerLeave?: () => void;
}

const InlineButtonComponent = (props: ButtonComponentProps) => {
    return (
        <button
            onClick={props.onClick}
            className={`inline-flex items-center px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-green-600 ${props.className}`}
            disabled={props.disabled}
            style={{ fontSize: '0.75rem' }}
            onPointerUp={props.onPointerUp}
            onPointerDown={props.onPointerDown}
            onPointerLeave={props.onPointerLeave}
        >
            {props.disabled ? (
                <span className="flex items-center space-x-1">
                    <Loading />
                    <span>{props.loadingMessage || "Loading..."}</span>
                </span>
            ) : (
                <span>{props.children}</span>
            )}
        </button>
    );
}

export default InlineButtonComponent;
