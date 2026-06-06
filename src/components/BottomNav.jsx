import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Utensils,
  UserRound,
  MonitorCheck,
  Dumbbell,
} from "lucide-react";

export default function BottomNav() {
  const items = [
    { to: "/dashboard", label: "Inicio", Icon: LayoutDashboard },
    { to: "/foto-comida", label: "Scan", Icon: Camera },
    { to: "/checkin", label: "Checkin", Icon:  MonitorCheck},
     { to: "/rutinas", label: "Rutinas", Icon: Dumbbell},
    { to: "/plan-comidas", label: "Dieta", Icon: Utensils},
    { to: "/perfil", label: "Perfil", Icon: UserRound },
    
  ];

  return (
    <nav
      data-bottom-nav="true"
      className="bottom-nav fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 z-50 w-[90%] max-w-[430px] -translate-x-1/2 rounded-[1.4rem] border p-1.5 shadow-[0_14px_45px_var(--app-glow)] backdrop-blur-2xl"
      style={{
        backgroundColor: "var(--app-surface)",
        borderColor: "var(--app-border)",
      }}
    >
      <div className="grid grid-cols-6 gap-1">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `group relative flex min-h-[40px] flex-col items-center justify-center gap-0.5 rounded-[1rem] px-1.5 py-1.5 text-[7px] font-black uppercase tracking-wide transition-all duration-300 ${
                isActive
                  ? "bg-[var(--app-primary)] text-[var(--app-surface)] shadow-[0_0_22px_var(--app-glow)]"
                  : "text-[var(--app-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-text)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`theme-icon-tile-muted grid h-11 w-15 place-items-center rounded-lg transition ${
                    isActive
                      ? "bg-[var(--app-primary-soft)]"
                      : "bg-[var(--app-primary-soft)] text-[var(--app-muted)] group-hover:bg-[var(--app-primary-soft)] group-hover:text-[var(--app-text)]"
                  }`}
                >
                  <Icon size={25} />
                </div>

                <span >{label}</span>

                {isActive && (
                  <span
                    className="absolute -bottom-0.5 h-0.5 w-6 rounded-full"
                    style={{ backgroundColor: "var(--app-text)" }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
