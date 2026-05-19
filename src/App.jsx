import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./context/useAuth";
import SplashScreen from "./components/SplashScreen";

const Home = lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home }))
);

const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login }))
);

const Register = lazy(() =>
  import("./pages/Register").then((module) => ({ default: module.Register }))
);

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);

const ProfileSetup = lazy(() =>
  import("./pages/ProfileSetup").then((module) => ({
    default: module.ProfileSetup,
  }))
);

const Calculator = lazy(() =>
  import("./pages/Calculator").then((module) => ({
    default: module.Calculator,
  }))
);

const MealPlan = lazy(() =>
  import("./pages/MealPlan").then((module) => ({ default: module.MealPlan }))
);

const Progress = lazy(() =>
  import("./pages/Progress").then((module) => ({ default: module.Progress }))
);

const Meals = lazy(() =>
  import("./pages/Meals").then((module) => ({ default: module.Meals }))
);

const Daily = lazy(() =>
  import("./pages/Daily").then((module) => ({ default: module.Daily }))
);

const CheckIn = lazy(() =>
  import("./pages/CheckIn").then((module) => ({ default: module.CheckIn }))
);

const FoodPhoto = lazy(() => import("./pages/FoodPhoto"));

const BodyScaner = lazy(() =>
  import("./components/Home/BodyScaner").then((module) => ({
    default: module.BodyScaner,
  }))
);

const Progreso = lazy(() =>
  import("./components/Home/Progreso").then((module) => ({
    default: module.Progreso,
  }))
);

const Dietas = lazy(() =>
  import("./components/Home/Dietas").then((module) => ({
    default: module.Dietas,
  }))
);

function AppLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06110e] text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-3xl border border-emerald-400/30 bg-emerald-400/10" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
          Cargando...
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <AppLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes({ splashVisible }) {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (splashVisible || loadingAuth) return;

    const pathname = location.pathname;
    const isPublicEntry =
      pathname === "/" || pathname === "/login" || pathname === "/registro";

    if (user && isPublicEntry) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, loadingAuth, navigate, splashVisible, user]);

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/foto-comida"
          element={
            <ProtectedRoute>
              <FoodPhoto />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumen"
          element={
            <ProtectedRoute>
              <Daily />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkin"
          element={
            <ProtectedRoute>
              <CheckIn />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calculadora"
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/plan-comidas"
          element={
            <ProtectedRoute>
              <MealPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progreso"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comidas"
          element={
            <ProtectedRoute>
              <Meals />
            </ProtectedRoute>
          }
        />

        <Route path="/bodyscannerhome" element={<BodyScaner />} />

        <Route path="/progresohome" element={<Progreso />} />

        <Route path="/dietahome" element={<Dietas />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppBootstrap() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashMounted, setSplashMounted] = useState(true);

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setSplashVisible(false);
    }, 2500);

    const unmountTimer = window.setTimeout(() => {
      setSplashMounted(false);
    }, 3000);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  return (
    <>
      <AppRoutes splashVisible={splashVisible} />
      {splashMounted ? <SplashScreen visible={splashVisible} /> : null}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBootstrap />
    </BrowserRouter>
  );
}
