import React, { forwardRef, useMemo } from 'react';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEAL_TYPES = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Merienda', 'Cena'];

// Diccionario para normalizar los nombres de los días que vienen del backend
const NORMALIZE_DAYS = {
  'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles', 'miércoles': 'Miércoles',
  'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'sábado': 'Sábado', 'domingo': 'Domingo'
};

// Diccionario para mapear los tipos de comida al horario estándar de la rejilla
const NORMALIZE_MEALS = {
  'desayuno': 'Desayuno',
  'mediamanaña': 'Media Mañana', 'mediamanana': 'Media Mañana', 'media mañana': 'Media Mañana',
  'almuerzo': 'Almuerzo',
  'merienda': 'Merienda',
  'cena': 'Cena'
};

/**
 * Limpia y parsea los ingredientes individuales para acumularlos en la lista de la compra.
 */
function parseIngredient(rawIngredient) {
  if (!rawIngredient) return null;
  const text = String(rawIngredient).trim();
  
  // Expresión regular corregida sin espacios que rompan la detección
  const match = text.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|unidad(?:es)?|huevo(?:s)?|pieza(?:s)?|rebanada(?:s)?|plátano(?:s)?|platano(?:s)?|banana(?:s)?|lata(?:s)?|plato(?:s)?|ración|raciones)?\s*(?:de)?\s*(.*)$/i);
  
  if (!match) return { name: text, value: 1, unit: 'unidades' };

  const valueStr = match[1].replace(',', '.');
  const value = parseFloat(valueStr);
  const rawUnit = match[2] ? match[2].toLowerCase() : 'unidades';
  const name = match[3] ? match[3].trim() : text;

  let unit = 'unidades';
  if (rawUnit.includes('kg')) unit = 'kg';
  else if (rawUnit.includes('g')) unit = 'g';
  else if (rawUnit.includes('ml')) unit = 'ml';
  else if (rawUnit.includes('l')) unit = 'l';
  else if (rawUnit.includes('huevo')) unit = 'huevos';
  else if (rawUnit.includes('pieza')) unit = 'piezas';
  else if (rawUnit.includes('rebanada')) unit = 'rebanadas';
  
  return { name: name || text, value: isNaN(value) ? 1 : value, unit };
}

const PrintablePlan = forwardRef(({ plan, macroAverages }, ref) => {

  // 1. CONVERTIR LA ESTRUCTURA DE MEALPLAN.JSX (DAYS Y MEALS) A MATRIZ HORIZONTAL
  const indexedPlan = useMemo(() => {
    const matrix = {};
    DAYS_OF_WEEK.forEach(d => { matrix[d] = {}; });

    if (!plan) return matrix;

    try {
      // Si el plan viene empaquetado como objeto que contiene el array (ej: plan.days o plan.plan)
      const rawDays = Array.isArray(plan) 
        ? plan 
        : (plan.days || plan.plan || Object.values(plan));

      if (Array.isArray(rawDays)) {
        rawDays.forEach(dayObj => {
          if (!dayObj) return;

          // Obtener el nombre del día y normalizarlo
          const rawDayName = (dayObj.day || dayObj.dia || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const cleanDay = NORMALIZE_DAYS[rawDayName];
          if (!cleanDay) return;

          // Tu estructura guarda las comidas en un array interno llamado '.meals'
          const mealsArray = dayObj.meals || [];
          if (Array.isArray(mealsArray)) {
            mealsArray.forEach(mealObj => {
              if (!mealObj) return;

              const rawMealType = (mealObj.mealType || mealObj.meal_type || mealObj.type || '').toLowerCase();
              const cleanMeal = NORMALIZE_MEALS[rawMealType];

              if (cleanMeal) {
                // Guardamos el objeto entero de la comida en la coordenada [Día][Comida]
                matrix[cleanDay][cleanMeal] = mealObj;
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("Error indexando la estructura en PrintablePlan:", error);
    }

    return matrix;
  }, [plan]);

  // 2. CONSTRUIR LISTA DE LA COMPRA EXTRAYENDO DE LOS INGREDIENTES Y DETALLES
  const shoppingList = useMemo(() => {
    const totals = {};
    
    Object.values(indexedPlan).forEach(dayData => {
      Object.values(dayData).forEach(mealData => {
        if (!mealData) return;

        // Buscar ingredientes en '.ingredients', '.ingredientes' o parsear desde '.details'
        const rawIngs = mealData.ingredients || mealData.ingredientes || mealData.details;
        if (!rawIngs) return;

        const ingredientsArray = Array.isArray(rawIngs)
          ? rawIngs
          : typeof rawIngs === 'string'
          ? rawIngs.split(/[\n,]+/) // Rompe por saltos de línea o comas
          : [];

        ingredientsArray.forEach(rawIng => {
          if (!rawIng || String(rawIng).trim() === '') return;
          const parsed = parseIngredient(rawIng);
          if (!parsed) return;

          let category = 'Otros';
          const lowerName = parsed.name.toLowerCase();
          if (/pollo|pavo|ternera|cerdo|carne|lomo|jamon/i.test(lowerName)) category = 'Carnicería';
          else if (/pescado|salmon|atun|merluza|bacalao/i.test(lowerName)) category = 'Pescadería';
          else if (/lechuga|tomate|cebolla|fruta|platano|aguacate|espinaca|verdura|limon/i.test(lowerName)) category = 'Frutería';
          else if (/leche|queso|yogur|crema|mantequilla/i.test(lowerName)) category = 'Lácteos';
          else if (/arroz|pasta|pan|harina|avena|cereal|aceite/i.test(lowerName)) category = 'Despensa';

          if (!totals[category]) totals[category] = {};
          const key = `${parsed.name}_${parsed.unit}`;
          if (!totals[category][key]) totals[category][key] = { name: parsed.name, value: 0, unit: parsed.unit };
          totals[category][key].value += parsed.value;
        });
      });
    });

    const formattedList = {};
    Object.keys(totals).forEach(cat => {
      formattedList[cat] = Object.values(totals[cat]).map(item => ({
        name: item.name,
        amount: item.value % 1 === 0 ? item.value : item.value.toFixed(1),
        unit: item.unit
      }));
    });
    return formattedList;
  }, [indexedPlan]);

  if (!plan) return null;

  return (
    <div ref={ref} className="pdf-printable-root">
      {/* ESTILOS INYECTADOS MODERNOS CON GRID DE 8 COLUMNAS INDESTRUCTIBLE */}
      <style>{`
        .pdf-printable-root {
          display: none !important;
        }

        @media print {
          .pdf-printable-root {
            display: block !important;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1a202c;
            background: #ffffff;
            width: 297mm;
            min-height: 210mm;
            box-sizing: border-box;
            padding: 8mm;
          }

          @page {
            size: A4 landscape !important;
            margin: 0 !important;
          }

          .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2b6cb0;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }

          .pdf-header h1 {
            font-size: 20px;
            margin: 0;
            color: #2b6cb0;
          }

          .pdf-macros {
            display: flex;
            gap: 8px;
          }

          .pdf-macro-pill {
            background: #f7fafc !important;
            border: 1px solid #e2e8f0;
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 11px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* REJILLA GRID HORIZONTAL */
          .pdf-calendar-grid {
            display: grid;
            grid-template-columns: 95px repeat(7, 1fr);
            gap: 1px;
            background: #cbd5e0;
            border: 1px solid #cbd5e0;
            margin-bottom: 20px;
          }

          .pdf-grid-header {
            background: #edf2f7 !important;
            color: #4a5568;
            font-weight: bold;
            text-align: center;
            padding: 6px 4px;
            font-size: 11px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-grid-meal-label {
            background: #f7fafc !important;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            text-align: center;
            padding: 5px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-grid-cell {
            background: #ffffff !important;
            padding: 6px;
            min-height: 95px;
            box-sizing: border-box;
          }

          .pdf-meal-time {
            font-size: 9px;
            color: #2b6cb0;
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
          }

          .pdf-meal-name {
            font-size: 10.5px;
            font-weight: 700;
            margin: 0 0 4px 0;
            line-height: 1.2;
            color: #1a202c;
          }

          .pdf-recipe-box {
            margin-top: 4px;
            border-top: 1px dashed #e2e8f0;
            padding-top: 4px;
          }

          .pdf-recipe-title {
            font-size: 8px;
            text-transform: uppercase;
            color: #718096;
            font-weight: bold;
            margin: 0 0 2px 0;
          }

          .pdf-recipe-text {
            font-size: 8.5px;
            color: #4a5568;
            line-height: 1.2;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .pdf-empty-cell {
            color: #cbd5e0;
            text-align: center;
            font-size: 12px;
            display: block;
            margin-top: 25px;
          }

          .pdf-page-break {
            page-break-before: always;
            break-before: page;
          }

          .pdf-shop-title {
            font-size: 15px;
            color: #2d3748;
            margin: 0 0 10px 0;
          }

          .pdf-shop-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
          }

          .pdf-shop-card {
            border: 1px solid #cbd5e0;
            border-radius: 6px;
            padding: 8px;
            background: #f7fafc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-shop-card h3 {
            margin: 0 0 4px 0;
            font-size: 11px;
            color: #2b6cb0;
            border-bottom: 1px solid #cbd5e0;
            padding-bottom: 2px;
            text-transform: uppercase;
          }

          .pdf-shop-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .pdf-shop-card li {
            font-size: 10px;
            margin-bottom: 3px;
            display: flex;
            align-items: center;
            gap: 5px;
          }
        }
      `}</style>

      {/* CABECERA DEL DOCUMENTO */}
      <header className="pdf-header">
        <h1>Tu Plan Nutricional Semanal + Recetas IA</h1>
        {macroAverages && (
          <div className="pdf-macros">
            <span className="pdf-macro-pill">🔥 {macroAverages.calories || 0} kcal</span>
            <span className="pdf-macro-pill">🥩 P: {macroAverages.protein || 0}g</span>
            <span className="pdf-macro-pill">🍞 C: {macroAverages.carbs || 0}g</span>
            <span className="pdf-macro-pill">🥑 G: {macroAverages.fats || 0}g</span>
          </div>
        )}
      </header>

      {/* REJILLA DEL CALENDARIO HORIZONTAL */}
      <div className="pdf-calendar-grid">
        <div className="pdf-grid-header">Horario</div>
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="pdf-grid-header">{day}</div>
        ))}

        {MEAL_TYPES.map(meal => (
          <React.Fragment key={meal}>
            {/* Fila lateral de comidas */}
            <div className="pdf-grid-meal-label">{meal}</div>
            
            {DAYS_OF_WEEK.map(day => {
              // Extraer la comida mapeada desde la matriz de días
              const mealData = indexedPlan[day][meal] || null;

              // Tu frontend mapea los platos bajo el parámetro '.food' o '.title'
              const foodName = mealData?.food || mealData?.title || mealData?.name || '';
              const time = mealData?.time || '';
              const recipeText = mealData?.details || '';

              return (
                <div key={day} className="pdf-grid-cell">
                  {mealData && foodName ? (
                    <div>
                      {/* Horario de la Comida */}
                      {time && <span className="pdf-meal-time">🕒 {time}</span>}
                      
                      {/* Nombre del plato */}
                      <p className="pdf-meal-name">{foodName}</p>
                      
                      {/* Receta generada por la IA */}
                      {recipeText && (
                        <div className="pdf-recipe-box">
                          <p className="pdf-recipe-title">Receta IA:</p>
                          <p className="pdf-recipe-text">{recipeText}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="pdf-empty-cell">-</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* SALTO DE HOJA AUTOMÁTICO */}
      <div className="pdf-page-break"></div>

      {/* SECCIÓN DE LA LISTA DE LA COMPRA */}
      {shoppingList && Object.keys(shoppingList).length > 0 && (
        <section style={{ marginTop: '10px' }}>
          <h2 className="pdf-shop-title">🛒 Lista de la Compra Semanal</h2>
          <div className="pdf-shop-grid">
            {Object.entries(shoppingList).map(([category, items]) => (
              <div key={category} className="pdf-shop-card">
                <h3>{category}</h3>
                <ul>
                  {items.map((item, idx) => (
                    <li key={idx}>
                      <input type="checkbox" style={{ margin: 0, width: '10px', height: '10px' }} readOnly />
                      <span>{item.name} ({item.amount} {item.unit})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

PrintablePlan.displayName = 'PrintablePlan';

// Doble exportación compatible con Named y Default Imports para evitar bloqueos en Vite
export { PrintablePlan };
export default PrintablePlan;
