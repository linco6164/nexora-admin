import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PermissionRoute({
  children,
  permission,
}) {
  const {
    isAuthenticated,
    loadingUser,
    isAdmin,
    isFinance,
    isIT,
    isLogistics,
    isModerator,
    isSupportAgent,
    isSupportManager,
  } = useAuth();

  if (loadingUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Se verifică permisiunile...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * ADMIN
   */
  if (permission === "admin") {
    return isAdmin
      ? children
      : <Navigate to="/" replace />;
  }

  /*
   * SUPPORT
   *
   * Toți utilizatorii staff au acces la Support.
   */
  if (permission === "support") {
    const hasSupportAccess =
      isAdmin ||
      isFinance ||
      isIT ||
      isLogistics ||
      isModerator ||
      isSupportAgent ||
      isSupportManager;

    return hasSupportAccess
      ? children
      : <Navigate to="/" replace />;
  }

  /*
   * FINANCE / PAYMENTS
   */
  if (permission === "finance") {
    return isAdmin || isFinance
      ? children
      : <Navigate to="/" replace />;
  }

  /*
   * IT
   */
  if (permission === "it") {
    return isAdmin || isIT
      ? children
      : <Navigate to="/" replace />;
  }

  /*
   * LOGISTICS
   */
  if (permission === "logistics") {
    return isAdmin || isLogistics
      ? children
      : <Navigate to="/" replace />;
  }

  /*
   * MODERATION
   */
  if (permission === "moderation") {
    return isAdmin || isModerator
      ? children
      : <Navigate to="/" replace />;
  }

  /*
   * STAFF
   *
   * Orice rol de staff.
   */
  if (permission === "staff") {
    const isStaff =
      isAdmin ||
      isFinance ||
      isIT ||
      isLogistics ||
      isModerator ||
      isSupportAgent ||
      isSupportManager;

    return isStaff
      ? children
      : <Navigate to="/" replace />;
  }

  return <Navigate to="/" replace />;
}