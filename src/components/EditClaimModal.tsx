import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useClaims } from "../context/ClaimsContext";
import type { Claim, ClaimType } from "../types";

interface EditClaimModalProps {
  claim: Claim;
  onClose: () => void;
}

export default function EditClaimModal({ claim, onClose }: EditClaimModalProps) {
  const { updateClaim } = useClaims();
  const [claimantName, setClaimantName] = useState(claim.claimantName);
  const [type, setType] = useState<ClaimType>(claim.type);
  const [amount, setAmount] = useState((claim.amountRequested / 100).toString());
  const [description, setDescription] = useState(claim.description);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!claimantName.trim() || !amount) return;

    updateClaim(claim.id, {
      claimantName: claimantName.trim(),
      type,
      amountRequested: Math.round(parseFloat(amount) * 100),
      description: description.trim() || "No description provided.",
    });
    onClose();
  }

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400">{claim.id}</p>
            <h2 className="text-lg font-bold text-gray-800">Edit claim</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
          <div className="sm:col-span-2">
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
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-azure-600 hover:bg-azure-600/90 text-white rounded-md transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
