import type { Claim, ClaimStatus, ClaimType } from "../types";

const claimants = [
  "Bilal Ahmed", "Sara Malik", "Hassan Raza", "Fatima Iqbal", "Usman Tariq",
  "Hira Sheikh", "Omar Farooq", "Zainab Aslam", "Ali Hamza", "Mahnoor Siddiqui",
  "Danish Javed", "Rabia Naveed", "Faisal Mehmood", "Amina Yousaf", "Talha Nadeem",
  "Sana Ejaz", "Waqas Anwar", "Noor Fatima",
];

const types: ClaimType[] = ["auto", "health", "property", "travel"];
const statuses: ClaimStatus[] = ["submitted", "in-review", "approved", "rejected"];

const descriptionsByType: Record<ClaimType, string[]> = {
  auto: ["Rear-end collision on Main Ave", "Windshield damage from hailstorm", "Parking lot fender bender"],
  health: ["Emergency room visit", "Outpatient surgery reimbursement", "Prescription cost claim"],
  property: ["Water damage from burst pipe", "Storm damage to roof", "Burglary — stolen electronics"],
  travel: ["Flight cancellation reimbursement", "Lost luggage claim", "Trip medical emergency"],
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function generateClaims(): Claim[] {
  const claims: Claim[] = [];

  for (let i = 0; i < 28; i++) {
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    const claimant = claimants[i % claimants.length];
    const submittedDay = (i % 25) + 1;
    const submittedOn = `2026-0${((i % 3) + 6)}-${pad(submittedDay)}`;
    const updatedOn = `2026-0${((i % 3) + 6)}-${pad(Math.min(28, submittedDay + 3))}`;
    const amountRequested = Math.round((300 + Math.random() * 4500) * 100);

    claims.push({
      id: `CLM-${1000 + i}`,
      claimantName: claimant,
      type,
      status,
      amountRequested,
      amountApproved:
        status === "approved"
          ? Math.round(amountRequested * (0.7 + Math.random() * 0.3))
          : undefined,
      submittedOn,
      updatedOn,
      description:
        descriptionsByType[type][i % descriptionsByType[type].length],
      policyNumber: `POL-${type.slice(0, 2).toUpperCase()}-${4000 + i}`,
    });
  }

  return claims;
}

export const mockClaims: Claim[] = generateClaims();
