export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}) {
  return (
    <div className="group rounded-2xl bg-white border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-800">
            {value}
          </h2>

          <p className="mt-2 text-sm text-green-600">
            {subtitle}
          </p>

        </div>

        <div
          className={`h-16 w-16 rounded-2xl ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition`}
        >
          <Icon className="text-white" size={28} />
        </div>

      </div>
    </div>
  );
}