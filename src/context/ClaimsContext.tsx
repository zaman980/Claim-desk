import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { mockClaims } from "../data/mockData";
import type { Claim, ClaimStatus } from "../types";

interface ClaimsState {
  claims: Claim[];
  status: "idle" | "loading" | "loaded";
}

type ClaimsAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: Claim[] }
  | { type: "UPDATE_STATUS"; payload: { id: string; status: ClaimStatus; amountApproved?: number } }
  | { type: "ADD_CLAIM"; payload: Claim }
  | {
      type: "UPDATE_CLAIM";
      payload: {
        id: string;
        patch: Partial<
          Pick<Claim, "claimantName" | "type" | "amountRequested" | "description">
        >;
      };
    }
  | { type: "DELETE_CLAIM"; payload: { id: string } };

function claimsReducer(state: ClaimsState, action: ClaimsAction): ClaimsState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading" };
    case "LOAD_SUCCESS":
      return { claims: action.payload, status: "loaded" };
    case "UPDATE_STATUS":
      return {
        ...state,
        claims: state.claims.map((c) =>
          c.id === action.payload.id
            ? {
                ...c,
                status: action.payload.status,
                amountApproved: action.payload.amountApproved ?? c.amountApproved,
                updatedOn: new Date().toISOString(),
              }
            : c
        ),
      };
    case "ADD_CLAIM":
      return { ...state, claims: [action.payload, ...state.claims] };
    case "UPDATE_CLAIM":
      return {
        ...state,
        claims: state.claims.map((c) =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.patch, updatedOn: new Date().toISOString() }
            : c
        ),
      };
    case "DELETE_CLAIM":
      return {
        ...state,
        claims: state.claims.filter((c) => c.id !== action.payload.id),
      };
    default:
      return state;
  }
}

interface ClaimsContextValue {
  claims: Claim[];
  status: ClaimsState["status"];
  updateClaimStatus: (id: string, status: ClaimStatus, amountApproved?: number) => void;
  addClaim: (claim: Claim) => void;
  updateClaim: (
    id: string,
    patch: Partial<
      Pick<Claim, "claimantName" | "type" | "amountRequested" | "description">
    >
  ) => void;
  deleteClaim: (id: string) => void;
}

const ClaimsContext = createContext<ClaimsContextValue | undefined>(undefined);

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(claimsReducer, {
    claims: [],
    status: "idle",
  });

  useEffect(() => {

    dispatch({ type: "LOAD_START" });
    const timer = setTimeout(() => {
      dispatch({ type: "LOAD_SUCCESS", payload: mockClaims });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  function updateClaimStatus(
    id: string,
    status: ClaimStatus,
    amountApproved?: number
  ) {
    dispatch({ type: "UPDATE_STATUS", payload: { id, status, amountApproved } });
  }

  function addClaim(claim: Claim) {
    dispatch({ type: "ADD_CLAIM", payload: claim });
  }

  function updateClaim(
    id: string,
    patch: Partial<
      Pick<Claim, "claimantName" | "type" | "amountRequested" | "description">
    >
  ) {
    dispatch({ type: "UPDATE_CLAIM", payload: { id, patch } });
  }

  function deleteClaim(id: string) {
    dispatch({ type: "DELETE_CLAIM", payload: { id } });
  }

  return (
    <ClaimsContext.Provider
      value={{
        claims: state.claims,
        status: state.status,
        updateClaimStatus,
        addClaim,
        updateClaim,
        deleteClaim,
      }}
    >
      {children}
    </ClaimsContext.Provider>
  );
}

export function useClaims() {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used within ClaimsProvider");
  return ctx;
}
