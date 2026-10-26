import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import CompleteProfile from "../pages/public/CompleteProfile";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherTests from "../pages/teacher/TeacherTests";
import TeacherTestView from "../pages/teacher/TeacherTestView";
import TeacherRoomView from "../pages/teacher/TeacherRoomView";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentRoomView from "../pages/student/StudentRoomView";
import ChangePassword from "../pages/account/ChangePassword";
import { RequireRole, RedirectIfAuthed } from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- Публичные страницы ---------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuthed>
                <RegisterPage />
              </RedirectIfAuthed>
            }
          />
        </Route>

        {/* Завершение профиля после Google/Apple */}
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* ---------- Смена пароля (все роли) ---------- */}
        <Route
          path="/account/password"
          element={
            <RequireRole role={["superadmin", "admin", "teacher", "student"]}>
              <DashboardLayout>
                <ChangePassword />
              </DashboardLayout>
            </RequireRole>
          }
        />

        {/* ---------- Суперадмин ---------- */}
        <Route
          path="/superadmin"
          element={
            <RequireRole role="superadmin">
              <DashboardLayout>
                <SuperAdminDashboard />
              </DashboardLayout>
            </RequireRole>
          }
        />

        {/* ---------- Админ ---------- */}
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </RequireRole>
          }
        />

        {/* ---------- Учитель ---------- */}
        <Route
          path="/teacher"
          element={
            <RequireRole role="teacher">
              <DashboardLayout>
                <TeacherDashboard />
              </DashboardLayout>
            </RequireRole>
          }
        />
        <Route
          path="/teacher/tests"
          element={
            <RequireRole role="teacher">
              <DashboardLayout>
                <TeacherTests />
              </DashboardLayout>
            </RequireRole>
          }
        />
        <Route
          path="/teacher/tests/:testId"
          element={
            <RequireRole role="teacher">
              <DashboardLayout>
                <TeacherTestView />
              </DashboardLayout>
            </RequireRole>
          }
        />
        <Route
          path="/teacher/rooms/:roomId"
          element={
            <RequireRole role="teacher">
              <DashboardLayout>
                <TeacherRoomView />
              </DashboardLayout>
            </RequireRole>
          }
        />

        {/* ---------- Студент ---------- */}
        <Route
          path="/student"
          element={
            <RequireRole role="student">
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </RequireRole>
          }
        />
        <Route
          path="/student/room/:roomId"
          element={
            <RequireRole role="student">
              <DashboardLayout>
                <StudentRoomView />
              </DashboardLayout>
            </RequireRole>
          }
        />

        {/* ---------- Фолбэк ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
