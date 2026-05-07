import { NavLink } from "react-router-dom";
import { BarChart3, Camera, History, UserRound } from "lucide-react";

export default function BottomNav() {
  const items = [
    {
      to: "/dashboard",
      label: "Inicio",
      icon: <BarChart3 size={22} />,
    },
    {
      to: "/foto-comida",
      label: "Analizar",
      icon: <Camera size={22} />,
    },
    {
      to: "/comidas",
      label: "Historial",
      icon: <History size={22} />,
    },
    {
      to: "/perfil",
      label: "Perfil",
      icon: <UserRound size={22} />,
    },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2  border border-white/10 bg-[#081a12]/90 p-2 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1  px-3 py-3 text-xs font-black transition ${
                isActive
                  ? "bg-emerald-500 text-white"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}