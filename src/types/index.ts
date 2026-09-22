export type ClaimStatus = "submitted" | "in-review" | "approved" | "rejected";

export type ClaimType = "auto" | "health" | "property" | "travel";

export interface Claim {
  id: string;
  claimantName: string;
  type: ClaimType;
  status: ClaimStatus;
  amountRequested: number;
  amountApproved?: number;
  submittedOn: string;
  updatedOn: string;
  description: string;
  policyNumber: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "adjuster";
}
