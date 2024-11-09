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
                    <svg
                        className="animate-spin h-5 w-5 mr-3 ..."
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
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