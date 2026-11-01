import { ENTRANCE_EXAMS } from "../../../../Components/scholarshipformwizard";

export const TYPE_COLORS = {
  merit: "bg-blue-50 text-blue-700",
  reservation: "bg-purple-50 text-purple-700",
  both: "bg-green-50 text-green-700",
  full_tuition: "bg-teal-50 text-teal-700",
  partial_tuition: "bg-cyan-50 text-cyan-700",
  merit_based: "bg-blue-50 text-blue-700",
  need_based: "bg-orange-50 text-orange-700",
  disability: "bg-purple-50 text-purple-700",
  gender: "bg-pink-50 text-pink-700",
  ethnic: "bg-yellow-50 text-yellow-700",
};

export const STATUS_COLORS = {
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  under_review: "bg-blue-50 text-blue-700",
  withdrawn: "bg-gray-100 text-gray-500",
  pending: "bg-yellow-50 text-yellow-700",
};

export const EMPTY_FORM = {
  scholarshipTitle: "",
  description: "",
  termsAndConditions: "",
  applicationDeadline: "",
  scholarshipType2: "",
  totalProgramFeeNpr: "",
  amountNpr: "",
  percentage: "",
  targetLevel: "",
  targetFaculty: "",
  degreeProgram: "",
  university: "",
  collegeType: "",
  subject: "",
  gender: "any",
  isNepali: true,
  hasDisability: false,
  ethnicCategory: "",
  minGPA: "",
  minPercentage: "",
  entranceExamName: "",
  entranceExamOther: "",
  minEntranceScore: "",
  additionalRequirements: "",
  requiredDocuments: [],
  totalSeats: "",
  remainingSeats: "",
  provinceName: "",
  districtName: "",
  municipalityName: "",
  __originalStatus: "",
};

export const EMPTY_APP_FILTERS = {
  scholarshipId: "",
  status: "",
  applicationType: "",
  gender: "",
  province: "",
  district: "",
  municipality: "",
  scholarshipType: "",
  minAmount: "",
  maxAmount: "",
  search: "",
};

export function scholarshipToForm(s) {
  const savedExamName = s.eligibilityCriteria?.entranceExamName || "";
  const examIsKnown = savedExamName === "" || ENTRANCE_EXAMS.includes(savedExamName);

  return {
    scholarshipTitle: s.scholarshipTitle || "",
    description: s.description || "",
    termsAndConditions: s.termsAndConditions || "",
    applicationDeadline: s.applicationDeadline
      ? new Date(s.applicationDeadline).toISOString().split("T")[0]
      : "",
    scholarshipType2: s.coverage?.scholarshipType2 || "",
    totalProgramFeeNpr:
      s.coverage?.totalProgramFeeNpr != null
        ? String(s.coverage.totalProgramFeeNpr)
        : "",
    amountNpr:
      s.coverage?.amountNpr != null ? String(s.coverage.amountNpr) : "",
    percentage:
      s.coverage?.percentage != null ? String(s.coverage.percentage) : "",
    targetLevel: s.eligibilityCriteria?.targetLevel || "",
    targetFaculty: s.eligibilityCriteria?.targetFaculty || "",
    degreeProgram: s.eligibilityCriteria?.degreeProgram || "",
    university: s.eligibilityCriteria?.university || "",
    collegeType: s.eligibilityCriteria?.collegeType || "",
    subject: s.eligibilityCriteria?.subject || "",
    gender: s.eligibilityCriteria?.gender || "any",
    isNepali: s.eligibilityCriteria?.isNepali ?? true,
    hasDisability: s.eligibilityCriteria?.hasDisability ?? false,
    ethnicCategory: s.eligibilityCriteria?.ethnicCategory || "",
    minGPA: s.eligibilityCriteria?.minGPA != null ? String(s.eligibilityCriteria.minGPA) : "",
    minPercentage:
      s.eligibilityCriteria?.minPercentage != null
        ? String(s.eligibilityCriteria.minPercentage)
        : "",
    entranceExamName: examIsKnown ? savedExamName : "Other",
    entranceExamOther: examIsKnown ? "" : savedExamName,
    minEntranceScore:
      s.eligibilityCriteria?.minEntranceScore != null
        ? String(s.eligibilityCriteria.minEntranceScore)
        : "",
    additionalRequirements: s.eligibilityCriteria?.additionalRequirements || "",
    requiredDocuments: Array.isArray(s.eligibilityCriteria?.requiredDocuments)
      ? s.eligibilityCriteria.requiredDocuments
      : [],
    totalSeats: s.totalSeats != null ? String(s.totalSeats) : "",
    remainingSeats: s.remainingSeats != null ? String(s.remainingSeats) : "",
    provinceName: s.locationFilter?.province?.provinceName || "",
    districtName: s.locationFilter?.district?.districtName || "",
    municipalityName: s.locationFilter?.municipality?.municipalityName || "",
    __originalStatus: s.verification?.status || "",
  };
}

export function recalcCoverage({ totalProgramFeeNpr, amountNpr, percentage }) {
  const fee = totalProgramFeeNpr !== "" ? Number(totalProgramFeeNpr) : null;
  const amount = amountNpr !== "" ? Number(amountNpr) : null;
  const pct = percentage !== "" ? Number(percentage) : null;

  const hasFee = fee != null && !Number.isNaN(fee) && fee > 0;
  const hasAmount = amount != null && !Number.isNaN(amount);
  const hasPct = pct != null && !Number.isNaN(pct);

  let nextFee = totalProgramFeeNpr;
  let nextAmount = amountNpr;
  let nextPct = percentage;

  if (hasFee && hasPct && !hasAmount) {
    nextAmount = String(Math.round(fee * (pct / 100)));
  } else if (hasFee && hasAmount && !hasPct) {
    nextPct = String(Math.min(100, Math.round((amount / fee) * 10000) / 100));
  } else if (hasPct && hasAmount && !hasFee && pct > 0) {
    nextFee = String(Math.round(amount / (pct / 100)));
  }

  return {
    totalProgramFeeNpr: nextFee,
    amountNpr: nextAmount,
    percentage: nextPct,
  };
}

export function Avatar({ url, name, size = "w-14 h-14", textSize = "text-xl", rounded = "rounded-2xl" }) {
  const initials = (name || "IN")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${size} ${rounded} object-cover shrink-0 shadow-lg ring-4 ring-white/10`}
      />
    );
  }
  return (
    <div
      className={`${size} ${rounded} bg-red-500 flex items-center justify-center ${textSize} font-bold text-white shrink-0 shadow-lg ring-4 ring-white/10`}
    >
      {initials}
    </div>
  );
}

export function SeatsBar({ remaining, total }) {
  if (!total) return <span className="text-xs text-gray-400">—</span>;
  const pct = Math.round(((remaining ?? total) / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {remaining ?? total}/{total}
      </span>
    </div>
  );
}
