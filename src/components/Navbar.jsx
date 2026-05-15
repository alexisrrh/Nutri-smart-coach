import {
  Home,
  LayoutDashboard,
  Calculator,
  Flame,
  LineChart,
  Utensils,
  BarChart,
  Camera,
  LogOut,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const linkClass =
    "flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-emerald-300";

  const activeClass = "text-emerald-300";

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-emerald-400/10 bg-[#06110e]/85 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 text-white">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="NutriSmart Coach"
            className="h-11 w-11 rounded-2xl object-cover shadow-[0_0_25px_rgba(16,185,129,0.35)]"
          />

          <div className="leading-none">
            <p className="text-lg font-black italic tracking-tight">
              Nutri<span className="text-emerald-300">Smart</span>
            </p>
            <p className="mt-1 text-[8px] font-black uppercase tracking-[0.28em] text-emerald-300/60">
              AI Active
            </p>
          </div>
        </Link>

        <div className="hidden gap-5 md:flex">
          <NavItem to="/" icon={<Home size={16} />} label="Home" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/resumen" icon={<BarChart size={16} />} label="Resumen" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/calculadora" icon={<Calculator size={16} />} label="Calculadora" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/plan-comidas" icon={<Flame size={16} />} label="Plan" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/comidas" icon={<Utensils size={16} />} label="Comidas" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/foto-comida" icon={<Camera size={16} />} label="Foto IA" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/progreso" icon={<LineChart size={16} />} label="Peso y medidas" linkClass={linkClass} activeClass={activeClass} />
        </div>

        <button
          onClick={handleLogout}
          className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-widest text-white/55 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300 md:flex"
        >
          <LogOut size={15} />
          Salir
        </button>
      </nav>
    </header>
  );
}

function NavItem({ to, icon, label, linkClass, activeClass }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkClass} ${isActive ? activeClass : ""}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
