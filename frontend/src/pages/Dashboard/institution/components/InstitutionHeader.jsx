import { Avatar } from "../utils/constants";

export function InstitutionNav({ data, tab, setTab, pendingCount }) {
  const loc = data?.location || {};

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left – institution identity */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            url={data?.user?.avatar}
            name={data?.institutionName}
            size="w-8 h-8"
            textSize="text-xs"
            rounded="rounded-lg"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {data?.institutionName}
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {data?.institutionType} {loc.district ? `· ${loc.district}, ${loc.province}` : ""}
            </p>
          </div>
        </div>

        {/* Compact tab strip — mobile/tablet only */}
        <div className="flex lg:hidden gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
          {["scholarships", "courses", "applications"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize cursor-pointer ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
              {t === "applications" && pendingCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function InstitutionStats({
  scholarshipsCount,
  appTotal,
  pendingCount,
  approvedCount,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        {
          label: "Scholarships",
          value: scholarshipsCount,
          accent: true,
        },
        { label: "Applications", value: appTotal },
        { label: "Pending (page)", value: pendingCount },
        { label: "Approved (page)", value: approvedCount },
      ].map(({ label, value, accent }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
        >
          <p
            className={`text-2xl font-bold ${accent ? "text-blue-600" : "text-gray-800"}`}
          >
            {value}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function InstitutionHeader({
  data,
  tab,
  setTab,
  pendingCount,
  approvedCount,
  scholarshipsCount,
  appTotal,
}) {
  return (
    <>
      <InstitutionNav
        data={data}
        tab={tab}
        setTab={setTab}
        pendingCount={pendingCount}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full">
        <InstitutionStats
          scholarshipsCount={scholarshipsCount}
          appTotal={appTotal}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
        />
      </div>
    </>
  );
}
