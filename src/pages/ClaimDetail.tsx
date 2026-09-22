import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  Hash,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import EditClaimModal from "../components/EditClaimModal";
import { useClaims } from "../context/ClaimsContext";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../utils/format";

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { claims, status, updateClaimStatus, deleteClaim } = useClaims();
  const [isEditing, setIsEditing] = useState(false);

  if (status !== "loaded") {
    return <p className="text-sm text-gray-400">Loading claim…</p>;
  }

  const claim = claims.find((c) => c.id === id);

  if (!claim) {
    return (
      <div>
        <p className="text-sm text-gray-600">Claim not found.</p>
        <Link to="/claims" className="text-sm text-azure-600 mt-2 inline-block">
          Back to claims board
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/claims"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={15} />
        Back to claims board
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">{claim.id}</p>
            <h1 className="text-xl font-bold text-gray-800">
              {claim.claimantName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-100 transition-colors"
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
                  navigate("/claims");
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-crimson-600 border border-crimson-600/30 rounded-md px-3 py-1.5 hover:bg-crimson-100 transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <StatusBadge status={claim.status} />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">{claim.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
              <FileText size={13} /> Type
            </p>
            <p className="text-sm font-medium text-gray-800 capitalize">
              {claim.type}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
              <Hash size={13} /> Policy
            </p>
            <p className="text-sm font-medium text-gray-800">
              {claim.policyNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
              <Calendar size={13} /> Submitted
            </p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(claim.submittedOn)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
              <User size={13} /> Last updated
            </p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(claim.updatedOn)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-sm text-gray-600 mb-1">Amount requested</p>
          <p className="font-display text-2xl font-bold text-gray-800">
            {formatCurrency(claim.amountRequested)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-sm text-gray-600 mb-1">Amount approved</p>
          <p className="font-display text-2xl font-bold text-gray-800">
            {claim.amountApproved ? formatCurrency(claim.amountApproved) : "—"}
          </p>
        </div>
      </div>

      {claim.status === "in-review" && (
        <div className="flex gap-3">
          <button
            onClick={() =>
              updateClaimStatus(claim.id, "approved", claim.amountRequested)
            }
            className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-600/90 text-white rounded-md transition-colors"
          >
            Approve claim
          </button>
          <button
            onClick={() => updateClaimStatus(claim.id, "rejected")}
            className="px-4 py-2 text-sm font-medium bg-crimson-600 hover:bg-crimson-600/90 text-white rounded-md transition-colors"
          >
            Reject claim
          </button>
        </div>
      )}

      {claim.status === "submitted" && (
        <button
          onClick={() => updateClaimStatus(claim.id, "in-review")}
          className="px-4 py-2 text-sm font-medium bg-azure-600 hover:bg-azure-600/90 text-white rounded-md transition-colors"
        >
          Move to review
        </button>
      )}

      {isEditing && (
        <EditClaimModal claim={claim} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
}
