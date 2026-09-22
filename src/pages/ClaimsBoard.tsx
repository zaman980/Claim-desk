import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  X,
  Search,
  Sparkles,
  Pencil,
  Trash2,
} from "lucide-react";
import { useClaims } from "../context/ClaimsContext";
import EditClaimModal from "../components/EditClaimModal";
import { formatCurrency, formatDate } from "../utils/format";
import type { Claim, ClaimStatus, ClaimType } from "../types";

const columns: Array<{ status: ClaimStatus; label: string; accent: string }> = [
  { status: "submitted", label: "Submitted", accent: "border-t-gray-400" },
  { status: "in-review", label: "In Review", accent: "border-t-azure-600" },
  { status: "approved", label: "Approved", accent: "border-t-emerald-600" },
  { status: "rejected", label: "Rejected", accent: "border-t-crimson-600" },
];

const nextStatus: Partial<Record<ClaimStatus, ClaimStatus>> = {
  submitted: "in-review",
};

export default function ClaimsBoard() {
  const { claims, status, updateClaimStatus, addClaim, deleteClaim } =
    useClaims();
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [claimantName, setClaimantName] = useState("");
  const [type, setType] = useState<ClaimType>("auto");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);

  async function handlePolish() {
    if (!description.trim() || isPolishing) return;
    setIsPolishing(true);
    setPolishError(null);

    try {
      const res = await fetch("/api/polish-claim-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, claimType: type }),
      });

      let data: { polished?: string; error?: string };
      try {
        data = await res.json();
      } catch {

        throw new Error(
          "AI assistant isn't responding. If you're running locally, make sure " +
            "GEMINI_API_KEY is set in .env.local and restart the dev server."
        );
      }

      if (!res.ok) {
        throw new Error(data.error ?? "The AI assistant is unavailable right now.");
      }
      setDescription(data.polished ?? description);
    } catch (err) {
      setPolishError(
        err instanceof Error
          ? err.message
          : "The AI assistant is unavailable right now."
      );
    } finally {
      setIsPolishing(false);
    }
  }

  const claimsByColumn = useMemo(() => {
    const filtered = claims.filter(
      (c) =>
        c.claimantName.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
    );
    const grouped: Record<ClaimStatus, Claim[]> = {
      submitted: [],
      "in-review": [],
      approved: [],
      rejected: [],
    };
    for (const c of filtered) {
      grouped[c.status].push(c);
    }
    return grouped;
  }, [claims, search]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!claimantName.trim() || !amount) return;

    const newClaim: Claim = {
      id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      claimantName: claimantName.trim(),
      type,
      status: "submitted",
      amountRequested: Math.round(parseFloat(amount) * 100),
      submittedOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
      description: description.trim() || "No description provided.",
      policyNumber: `POL-${type.slice(0, 2).toUpperCase()}-${Math.floor(
        4000 + Math.random() * 999
      )}`,
    };

    addClaim(newClaim);
    setShowForm(false);
    setClaimantName("");
    setAmount("");
    setDescription("");
    setPolishError(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Claims Board</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track claims as they move through the pipeline.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-azure-600 hover:bg-azure-600/90 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} />
          New claim
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Claimant name
            </label>
            <input
              type="text"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Claim type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ClaimType)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="auto">Auto</option>
              <option value="health">Health</option>
              <option value="property">Property</option>
              <option value="travel">Travel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Amount requested (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <button
                type="button"
                onClick={handlePolish}
                disabled={!description.trim() || isPolishing}
                className="flex items-center gap-1.5 text-xs font-medium text-azure-600 hover:text-azure-600/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles size={13} className={isPolishing ? "animate-pulse" : ""} />
                {isPolishing ? "Polishing…" : "Polish with AI"}
              </button>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setPolishError(null);
              }}
              placeholder="Brief description of the incident"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            />
            {polishError && (
              <p className="text-xs text-crimson-600 mt-1.5">{polishError}</p>
            )}
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-azure-600 hover:bg-azure-600/90 text-white rounded-md transition-colors"
            >
              Submit claim
            </button>
          </div>
        </form>
      )}

      <div className="relative mb-5 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by claimant or claim ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-azure-600/30 focus:border-azure-600"
        />
      </div>

      {status !== "loaded" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.status}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="skeleton h-4 w-20 rounded" />
              </div>
              <div className={`space-y-3 border-t-2 ${col.accent} pt-3`}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.status}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold text-gray-800">
                  {col.label}
                </h2>
                <span className="text-xs font-medium text-gray-400">
                  {claimsByColumn[col.status].length}
                </span>
              </div>
              <div
                className={`space-y-3 border-t-2 ${col.accent} pt-3 min-h-[100px]`}
              >
                {claimsByColumn[col.status].map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <Link to={`/claims/${claim.id}`} className="block">
                      <p className="text-xs text-gray-400 mb-1">{claim.id}</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {claim.claimantName}
                      </p>
                      <p className="text-xs text-gray-400 capitalize mb-2">
                        {claim.type} claim · {formatDate(claim.submittedOn)}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatCurrency(claim.amountRequested)}
                      </p>
                    </Link>

                    {claim.status === "submitted" && (
                      <button
                        onClick={() =>
                          updateClaimStatus(claim.id, nextStatus.submitted!)
                        }
                        className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-azure-600 border border-azure-600/30 rounded-md py-1.5 hover:bg-azure-100 transition-colors"
                      >
                        Move to review
                        <ArrowRight size={13} />
                      </button>
                    )}

                    {claim.status === "in-review" && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            updateClaimStatus(
                              claim.id,
                              "approved",
                              claim.amountRequested
                            )
                          }
                          className="flex-1 text-xs font-medium text-emerald-600 border border-emerald-600/30 rounded-md py-1.5 hover:bg-emerald-100 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateClaimStatus(claim.id, "rejected")}
                          className="flex-1 text-xs font-medium text-crimson-600 border border-crimson-600/30 rounded-md py-1.5 hover:bg-crimson-100 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() => setEditingClaim(claim)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete claim ${claim.id}? This cannot be undone.`
                            )
                          ) {
                            deleteClaim(claim.id);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-crimson-600 border border-crimson-600/30 rounded-md py-1.5 hover:bg-crimson-100 transition-colors"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {claimsByColumn[col.status].length === 0 && (
                  <p className="text-xs text-gray-400 px-1">No claims here.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingClaim && (
        <EditClaimModal
          claim={editingClaim}
          onClose={() => setEditingClaim(null)}
        />
      )}
    </div>
  );
}
