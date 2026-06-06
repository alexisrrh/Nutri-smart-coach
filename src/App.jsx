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
import { ToastProvider } from "./components/ui";

const Home = lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home }))
);

const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login }))
);

const Register = lazy(() =>
  import("./pages/Register").then((module) => ({ default: module.Register }))
);

const ResetPassword = lazy(() =>
  import("./pages/ResetPassword").then((module) => ({
    default: module.ResetPassword,
  }))
);

const PrivacyPolicy = lazy(() =>
  import("./pages/legal/PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  }))
);

const TermsOfService = lazy(() =>
  import("./pages/legal/TermsOfService").then((module) => ({
    default: module.TermsOfService,
  }))
);

const CreatorTerms = lazy(() =>
  import("./pages/legal/CreatorTerms").then((module) => ({
    default: module.CreatorTerms,
  }))
);

const DeleteAccount = lazy(() =>
  import("./pages/legal/DeleteAccount").then((module) => ({
    default: module.DeleteAccount,
  }))
);

const Premium = lazy(() =>
  import("./pages/Premium").then((module) => ({ default: module.Premium }))
);

const SettingsProfile = lazy(() =>
  import("./pages/settings/SettingsProfile").then((module) => ({
    default: module.SettingsProfile,
  }))
);

const SettingsTheme = lazy(() =>
  import("./pages/settings/SettingsTheme").then((module) => ({
    default: module.SettingsTheme,
  }))
);

const SettingsAi = lazy(() =>
  import("./pages/settings/SettingsAi").then((module) => ({
    default: module.SettingsAi,
  }))
);

const SettingsLegal = lazy(() =>
  import("./pages/settings/SettingsLegal").then((module) => ({
    default: module.SettingsLegal,
  }))
);

const SettingsSecurity = lazy(() =>
  import("./pages/settings/SettingsSecurity").then((module) => ({
    default: module.SettingsSecurity,
  }))
);

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);

const ProfileSetup = lazy(() =>
  import("./pages/ProfileSetup").then((module) => ({
    default: module.ProfileSetup,
  }))
);

const CreatorPanel = lazy(() =>
  import("./pages/CreatorPanel").then((module) => ({
    default: module.CreatorPanel,
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

const ProgressHub = lazy(() =>
  import("./pages/ProgressHub").then((module) => ({
    default: module.ProgressHub,
  }))
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

const WorkoutRoutines = lazy(() =>
  import("./pages/WorkoutRoutines").then((module) => ({
    default: module.WorkoutRoutines,
  }))
);

const ExercisesLibrary = lazy(() =>
  import("./pages/ExercisesLibrary").then((module) => ({
    default: module.ExercisesLibrary,
  }))
);
const CreateRoutine = lazy(() =>
  import("./pages/CreateRoutine").then((module) => ({
    default: module.CreateRoutine,
  }))
);

const SharedRoutine = lazy(() =>
  import("./pages/SharedRoutine").then((module) => ({
    default: module.default,
  }))
);

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-surface)] text-[var(--app-text)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-3xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] shadow-[0_0_28px_var(--app-glow)]" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--app-primary)]">
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
      <Routes key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/creator-terms" element={<CreatorTerms />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <Premium />
            </ProtectedRoute>
          }
        />

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
          path="/creator-panel"
          element={
            <ProtectedRoute>
              <CreatorPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creadores"
          element={
            <ProtectedRoute>
              <CreatorPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <SettingsProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/theme"
          element={
            <ProtectedRoute>
              <SettingsTheme />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/ai"
          element={
            <ProtectedRoute>
              <SettingsAi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/legal"
          element={
            <ProtectedRoute>
              <SettingsLegal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <SettingsSecurity />
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
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressHub />
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

        <Route
          path="/rutinas"
          element={
            <ProtectedRoute>
              <WorkoutRoutines />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editar-rutina/:id"
          element={
            <ProtectedRoute>
              <CreateRoutine />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ejercicios"
          element={
            <ProtectedRoute>
              <ExercisesLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-rutina"
          element={
            <ProtectedRoute>
              <CreateRoutine />
            </ProtectedRoute>
          }
        />
        <Route path="/rutina/:shareId" element={<SharedRoutine />} />
        <Route path="/rutinas/semana/:shareId" element={<SharedRoutine />} />
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
      <ToastProvider>
        <AppBootstrap />
      </ToastProvider>
    </BrowserRouter>
  );
}
