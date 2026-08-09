interface Props {
  children: React.ReactNode;
}

export default function Card({
  children,
}: Props) {
  return (
    <div
      className={
        `w-full max-w-full min-w-0 rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg break-words`
      }
    >
      {children}
    </div>
  );
}