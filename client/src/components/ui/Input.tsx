import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  const { className = "", ...rest } = props;

  return (
    <input
      {...rest}
      className={`
        w-full
        rounded-xl
        bg-slate-50
        px-4
        py-3
        text-slate-800
        placeholder:text-slate-500
        outline-none
        transition-all
        focus:ring-2
        focus:ring-indigo-500
        ${className}
      `}
    />
  );
}

