import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Kanban, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/claims", label: "Claims Board", icon: Kanban },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:flex">
      {}
      <div className="sm:hidden flex items-center justify-between h-14 px-4 bg-steel-900 text-gray-100 sticky top-0 z-30">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 -ml-2 rounded-md text-gray-300 hover:bg-steel-800 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-azure-600" size={18} />
          <span className="font-display font-bold text-base tracking-tight">
            ClaimDesk
          </span>
        </div>
        <div className="w-9" />
      </div>

      {}
      {mobileNavOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 w-60 bg-steel-900 text-gray-100 flex flex-col shrink-0 transform transition-transform duration-200 sm:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-azure-600" size={22} />
            <span className="font-display font-bold text-lg tracking-tight">
              ClaimDesk
            </span>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="sm:hidden p-1 rounded-md text-gray-400 hover:bg-steel-800 transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-steel-700 text-white"
                    : "text-gray-400 hover:bg-steel-800 hover:text-gray-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <div className="px-3 py-3 mb-2 border-t border-steel-700 pt-4">
            <p className="text-sm font-medium text-gray-100">
              {currentUser?.name}
            </p>
            <p className="text-xs text-gray-400">Claims Adjuster</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-400 hover:bg-steel-800 hover:text-gray-100 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
