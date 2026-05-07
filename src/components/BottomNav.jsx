import { NavLink } from "react-router-dom";
import { LayoutDashboard, Camera, History, UserRound } from "lucide-react";

export default function BottomNav() {
  const items = [
    { to: "/dashboard", label: "Inicio", Icon: LayoutDashboard },
    { to: "/foto-comida", label: "Scan", Icon: Camera },
    { to: "/comidas", label: "Historial", Icon: History },
    { to: "/perfil", label: "Perfil", Icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 border border-white/10 bg-[#06110c]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex min-h-[58px] flex-col items-center justify-center gap-1 px-2 py-2 text-[9px] font-black uppercase tracking-wide transition ${
                isActive
                  ? "bg-[#10b981] text-[#06110c]"
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}