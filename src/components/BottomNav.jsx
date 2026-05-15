import { NavLink } from "react-router-dom";
import { LayoutDashboard, Camera, Utensils, Flame, UserRound } from "lucide-react";

export default function BottomNav() {
  const items = [
    { to: "/dashboard", label: "Inicio", Icon: LayoutDashboard },
    { to: "/foto-comida", label: "Scan", Icon: Camera },
    { to: "/comidas", label: "Comidas", Icon: Utensils },
    { to: "/plan-comidas", label: "Plan", Icon: Flame },
    { to: "/perfil", label: "Perfil", Icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+8px)] left-1/2 z-50 w-[90%] max-w-[430px] -translate-x-1/2 rounded-[1.4rem] border border-white/10 bg-[#03100a]/80 p-1.5 shadow-[0_14px_45px_rgba(16,185,129,0.14)] backdrop-blur-2xl">
      <div className="grid grid-cols-5 gap-1">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `group relative flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-[1rem] px-1.5 py-1.5 text-[10px] font-black uppercase tracking-wide transition-all duration-300 ${
                isActive
                  ? "bg-[#10b981] text-[#03100a] shadow-[0_0_22px_rgba(16,185,129,0.28)]"
                  : "text-slate-300/80 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`grid h-6 w-6 place-items-center rounded-lg transition ${
                    isActive
                      ? "bg-black/10"
                      : "bg-white/[0.06] text-slate-200/80 group-hover:bg-[#10b981]/10 group-hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                </div>

                <span>{label}</span>

                {isActive && (
                  <span className="absolute -bottom-0.5 h-0.5 w-6 rounded-full bg-white/80" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
