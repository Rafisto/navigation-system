interface InputProps {
    className?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputComponent = (props: InputProps) => {
    return (
        <input
            className={`px-4 border bg-slate-900 border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className}`}
            type={props.type || "text"}
            placeholder={props.placeholder || ""}
            value={props.value}
            onChange={props.onChange}
        />
    );
}

export default InputComponent;
