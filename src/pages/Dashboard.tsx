import { useMemo, useState } from "react";
import { FileText, Clock, CheckCircle2, DollarSign } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useClaims } from "../context/ClaimsContext";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../utils/format";
import { Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  Submitted: "#8A96A3",
  "In Review": "#3B6EA5",
  Approved: "#2F8F5B",
  Rejected: "#C0392B",
};

type SortOption = "newest" | "oldest" | "amount-desc" | "amount-asc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "amount-desc": "Amount: high to low",
  "amount-asc": "Amount: low to high",
};

function StatCard({
  label,
  value,
  icon: Icon,
  loading = false,
}: {
  label: string;
  value: string | number;
  icon: typeof FileText;
  loading?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <Icon size={18} className="text-gray-400" />
      </div>
      {loading ? (
        <div className="skeleton h-7 w-16 rounded" />
      ) : (
        <p className="font-display text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { claims, status } = useClaims();
  const isLoading = status !== "loaded";
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const pending = claims.filter(
    (c) => c.status === "submitted" || c.status === "in-review"
  ).length;
  const approved = claims.filter((c) => c.status === "approved");
  const totalPayout = approved.reduce(
    (sum, c) => sum + (c.amountApproved ?? 0),
    0
  );

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Submitted: 0,
      "In Review": 0,
      Approved: 0,
      Rejected: 0,
    };
    const labelMap: Record<string, string> = {
      submitted: "Submitted",
      "in-review": "In Review",
      approved: "Approved",
      rejected: "Rejected",
    };
    for (const c of claims) {
      counts[labelMap[c.status]] += 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [claims]);

  const recentClaims = useMemo(() => {
    const sorted = [...claims].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.submittedOn.localeCompare(b.submittedOn);
        case "amount-desc":
          return b.amountRequested - a.amountRequested;
        case "amount-asc":
          return a.amountRequested - b.amountRequested;
        default:
          return b.submittedOn.localeCompare(a.submittedOn);
      }
    });
    return sorted.slice(0, 6);
  }, [claims, sortBy]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Overview</h1>
        <p className="text-sm text-gray-600 mt-1">
          Claims pipeline at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total claims"
          value={claims.length}
          icon={FileText}
          loading={isLoading}
        />
        <StatCard
          label="Awaiting decision"
          value={pending}
          icon={Clock}
          loading={isLoading}
        />
        <StatCard
          label="Approved"
          value={approved.length}
          icon={CheckCircle2}
          loading={isLoading}
        />
        <StatCard
          label="Total payout"
          value={formatCurrency(totalPayout)}
          icon={DollarSign}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Claims by status
          </h2>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center text-sm text-gray-400">
              Loading chart…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Recent claims
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-azure-600/30 focus:border-azure-600"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <ul className="space-y-3">
              {recentClaims.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/claims/${c.id}`}
                    className="flex items-center justify-between py-1.5 hover:opacity-70 transition-opacity"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {c.claimantName} · {c.id}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(c.submittedOn)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(c.amountRequested)}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
