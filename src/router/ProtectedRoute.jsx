import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const homeByRole = {
  superadmin: "/superadmin",
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function RequireRole({ role, children }) {
  const { user, role: userRole, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  // Профиль ещё не создан (например, первый Google-вход) — на завершение профиля
  if (!userRole) return <Navigate to="/complete-profile" replace />;

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(userRole)) {
    return <Navigate to={homeByRole[userRole] || "/"} replace />;
  }
  return children;
}

export function RedirectIfAuthed({ children }) {
  const { user, role, universityId, loading } = useAuthStore();

  if (loading) return <AuthLoading />;
  if (user) {
    if (!role) return <Navigate to="/complete-profile" replace />;
    if (role === "student" && !universityId)
      return <Navigate to="/complete-profile" replace />;
    return <Navigate to={homeByRole[role] || "/"} replace />;
  }
  return children;
}
