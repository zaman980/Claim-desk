import type { ClaimStatus } from "../types";

const statusStyles: Record<ClaimStatus, string> = {
  submitted: "bg-gray-100 text-gray-600",
  "in-review": "bg-azure-100 text-azure-600",
  approved: "bg-emerald-100 text-emerald-600",
  rejected: "bg-crimson-100 text-crimson-600",
};

const statusLabels: Record<ClaimStatus, string> = {
  submitted: "Submitted",
  "in-review": "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-1 rounded ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
