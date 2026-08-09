interface AvatarProps {
  name: string;
  image?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-14 w-14 text-lg",
};

const colors = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-sky-500",
  "bg-violet-500",
];

export default function Avatar({
  name,
  image,
  size = "md",
}: AvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  const parts = name.trim().split(" ");

  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`
      : parts[0][0];

  const color =
    colors[
      name.length % colors.length
    ];

  return (
    <div
      className={`${sizes[size]} ${color}
      flex items-center justify-center
      rounded-full font-bold text-white`}
    >
      {initials.toUpperCase()}
    </div>
  );
}