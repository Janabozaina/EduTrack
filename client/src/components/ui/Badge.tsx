interface Props {
  active: boolean;
}

export default function Badge({
  active,
}: Props) {
  return (
    <span
      className={`
      rounded-full
      px-3
      py-1
      text-xs
      font-semibold
      ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-600"
      }
      `}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}