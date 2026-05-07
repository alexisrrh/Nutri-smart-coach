import React from "react";

export function PrintablePlan({ plan }) {
  if (!plan || plan.length === 0) return null;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          .print-row {
            border-bottom: 1px solid #cbd5e1 !important;
            padding: 10px 0 !important;
            page-break-inside: avoid;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      <div className="print-only text-slate-900 bg-white p-2 uppercase text-xs font-sans">
        <div className="border-b-2 border-slate-900 pb-2 text-center">
          <h1 className="text-xl font-black tracking-wider">NUTRI SMART COACH</h1>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5">Plan Nutricional Semanal Personalizado</p>
        </div>

        {/* Menú impreso */}
        <div className="mt-6 space-y-4">
          {plan.map((dayData, idx) => (
            <div key={idx} className="print-row">
              <h3 className="font-black text-sm text-[#06140c] mb-2">{dayData.day}</h3>
              <div className="grid grid-cols-2 gap-4">
                {dayData.meals && Object.entries(dayData.meals).map(([type, meal]) => (
                  <div key={type} className="text-[11px]">
                    <span className="font-black text-slate-400 block text-[9px]">
                      {type === "breakfast" ? "Desayuno" : type === "lunch" ? "Almuerzo" : type === "snack" ? "Merienda" : "Cena"}
                    </span>
                    <span className="font-bold text-slate-900">{meal.name || meal.title}</span>
                    <p className="text-slate-600 text-[10px] font-medium leading-tight mt-0.5">
                      {meal.ingredients?.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lista de la compra en papel */}
        <div className="print-break mt-6">
          <h2 className="text-sm font-black border-b-2 border-slate-900 pb-1 mb-3">Lista de la Compra Semanal</h2>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-800">
            {Array.from(new Set(
              plan.flatMap(day => Object.values(day.meals || {}).flatMap(meal => meal.ingredients || []))
            )).map((ingredient, idx) => (
              <div key={idx} className="flex items-center gap-2 border-b border-slate-100 py-1">
                <div className="h-2.5 w-2.5 border border-slate-400 rounded-sm" />
                <span className="truncate font-medium">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
