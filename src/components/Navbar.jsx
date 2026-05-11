import {
  Apple,
  Home,
  LayoutDashboard,
  Calculator,
  Flame,
  LineChart,
  Utensils,
  BarChart,
  Camera,
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
    "flex items-center gap-2 text-sm text-white/70 transition hover:text-white";

  const activeClass = "text-emerald-300";

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#07130d]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <span className="rounded-xl bg-emerald-400 p-2 text-black">
            <Apple size={20} />
          </span>
          NutriCoach IA
        </Link>

        <div className="hidden gap-6 md:flex">
          <NavItem to="/" icon={<Home size={16} />} label="Home" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/resumen" icon={<BarChart size={16} />} label="Resumen" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/calculadora" icon={<Calculator size={16} />} label="Calculadora" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/plan-comidas" icon={<Flame size={16} />} label="Plan" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/comidas" icon={<Utensils size={16} />} label="Comidas" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/foto-comida" icon={<Camera size={16} />} label="Foto IA" linkClass={linkClass} activeClass={activeClass} />
          <NavItem to="/progreso" icon={<LineChart size={16} />} label="Progreso" linkClass={linkClass} activeClass={activeClass} />
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
        >
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