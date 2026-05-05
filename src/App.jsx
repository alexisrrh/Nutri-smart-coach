import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { CheckIn } from "./pages/CheckIn";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ProfileSetup } from "./pages/ProfileSetup";
import { Calculator } from "./pages/Calculator";
import { MealPlan } from "./pages/MealPlan";
import { Progress } from "./pages/Progress";
import { Meals } from "./pages/Meals";
import { Daily } from "./pages/Daily";
import  FoodPhoto  from "./pages/FoodPhoto";

function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07130d] text-white">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /> </ProtectedRoute>} />

        <Route path="/foto-comida" element={<ProtectedRoute> <FoodPhoto /> </ProtectedRoute>} />
        <Route path="/resumen" element={<ProtectedRoute><Daily /></ProtectedRoute> }/>
<Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute> <ProfileSetup /></ProtectedRoute>}/>

        <Route path="/calculadora" element={<ProtectedRoute><Calculator /></ProtectedRoute>}/>

        <Route path="/plan-comidas" element={<ProtectedRoute><MealPlan /></ProtectedRoute> } /> 
        <Route path="/progreso" element={<ProtectedRoute> <Progress /> </ProtectedRoute> }/>
        <Route path="/comidas" element={<ProtectedRoute> <Meals /> </ProtectedRoute> } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}