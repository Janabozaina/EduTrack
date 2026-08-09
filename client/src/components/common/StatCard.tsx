interface Props {
  title: string;
  value: number | string;
}

export default function StatCard({
  title,
  value,
}: Props) {
  return (
    <div className="rounded-xl bg-white shadow p-6">
      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}