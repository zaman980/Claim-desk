import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClaimsBoard = lazy(() => import("./pages/ClaimsBoard"));
const ClaimDetail = lazy(() => import("./pages/ClaimDetail"));

function PageFallback() {
  return <p className="text-sm text-gray-400">Loading…</p>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims"
          element={
            <ProtectedRoute>
              <ClaimsBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id"
          element={
            <ProtectedRoute>
              <ClaimDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
