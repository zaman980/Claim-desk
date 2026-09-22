import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("hassan.raza@claimdesk.demo");
  const [password, setPassword] = useState("demo1234");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-steel-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="text-azure-600" size={26} />
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            ClaimDesk
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-8 border border-steel-700"
        >
          <h1 className="text-lg font-semibold text-gray-800 mb-1">
            Adjuster sign in
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Demo build — any email and password will sign you in.
          </p>

          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-azure-600/30 focus:border-azure-600"
          />

          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-azure-600/30 focus:border-azure-600"
          />

          <button
            type="submit"
            className="w-full bg-azure-600 hover:bg-azure-600/90 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
