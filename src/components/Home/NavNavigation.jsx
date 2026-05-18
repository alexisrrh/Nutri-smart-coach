import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, ShieldCheck, Utensils, LineChart } from "lucide-react";

// Definimos el DashboardTab aquí mismo para que no tengas que buscar archivos externos
const DashboardTab = ({ to, icon, title, active }) => {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center py-3 transition-all duration-300 ${
        active 
          ? "text-emerald-400 bg-white/[0.08]" 
          : "text-zinc-500 hover:text-white"
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? "scale-110" : "scale-100"}`}>
        {icon}
      </div>
      <span className={`mt-1 text-[10px] font-bold uppercase tracking-tighter transition-opacity ${active ? "opacity-100" : "opacity-70"}`}>
        {title}
      </span>
      
      {/* Rayita verde inferior opcional para el estilo activo */}
      {active && (
        <div className="absolute bottom-0 h-0.5 w-8 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]" />
      )}
    </Link>
  );
};

export const NavNavigation = () => {
  const location = useLocation();

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50">
      <div className="grid grid-cols-4 overflow-hidden rounded-2xl border border-white/10 bg-[#091814]/90 shadow-2xl backdrop-blur-xl">
        <DashboardTab 
          to="/" 
          icon={<Camera size={16} />} 
          title="Analizar" 
          active={location.pathname === "/"}
        />
        <DashboardTab 
          to="/bodyscannerhome" 
          icon={<ShieldCheck size={16} />} 
          title="Check-in foto" 
          active={location.pathname === "/bodyscannerhome"}
        />
        <DashboardTab 
          to="/dietahome" 
          icon={<Utensils size={16} />} 
          title="Dietas" 
          active={location.pathname === "/dietahome"}
        />
        <DashboardTab 
          to="/progresohome" 
          icon={<LineChart size={16} />} 
          title="Peso/medidas" 
          active={location.pathname === "/progresohome"}
        />
      </div>
    </div>
  );
};