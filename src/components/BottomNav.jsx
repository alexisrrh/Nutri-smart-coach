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
    <nav className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-3xl border border-white/10 bg-[#03100a]/75 p-2 shadow-[0_18px_70px_rgba(16,185,129,0.18)] backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-1.5">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `group relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-black uppercase tracking-wide transition-all duration-300 ${
                isActive
                  ? "bg-[#10b981] text-[#03100a] shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                    isActive
                      ? "bg-black/10"
                      : "bg-white/[0.03] group-hover:bg-[#10b981]/10"
                  }`}
                >
                  <Icon size={19} />
                </div>

                <span>{label}</span>

                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-8 rounded-full bg-white/80" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}