import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Bell,
  LogOut,
  Wallet,
  MessageCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const {
    user,
    isAdmin,
    isFinance,
    isIT,
    isLogistics,
    isModerator,
    isSupportAgent,
    isSupportManager,
    logout,
  } = useAuth();

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    color: isActive ? "#50C878" : "#333",
    textDecoration: "none",
    background: isActive
      ? "#f0fdf4"
      : "transparent",
    borderRadius: 8,
    margin: "4px 12px",
  });

  return (
    <div
      style={{
        width: 240,
        background: "white",
        borderRight: "1px solid #eee",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          padding: "24px 20px",
          color: "#50C878",
        }}
      >
        Nexora Admin
      </h2>

      {/* USER INFO */}
      {user && (
        <div
          style={{
            padding: "0 20px 16px",
            borderBottom: "1px solid #eee",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111",
            }}
          >
            {user.role}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#888",
              marginTop: 3,
            }}
          >
            {user.department}
          </div>
        </div>
      )}

      {/* DASHBOARD - TOȚI STAFF */}
      <NavLink
        to="/"
        style={linkStyle}
        end
      >
        <LayoutDashboard size={20} />
        Dashboard
      </NavLink>

      {/* ADMIN ONLY */}
      {(isAdmin || isFinance ) && (
        <>
          <NavLink
            to="/users"
            style={linkStyle}
          >
            <Users size={20} />
            Useri
          </NavLink>

          <NavLink
            to="/listings"
            style={linkStyle}
          >
            <Package size={20} />
            Anunțuri
          </NavLink>

          <NavLink
            to="/broadcast"
            style={linkStyle}
          >
            <Bell size={20} />
            Notificări
          </NavLink>
        </>
      )}

      {/* FINANCE */}
      {(isAdmin || isFinance) && (
        <NavLink
          to="/withdrawals"
          style={linkStyle}
        >
          <Wallet size={20} />
          Retrageri
        </NavLink>
      )}

      {/* SUPPORT */}
      {(isAdmin ||
        isSupportAgent ||
        isSupportManager ||
        isFinance) && (
        <NavLink
          to="/support"
          style={linkStyle}
        >
          <MessageCircle size={20} />
          Suport
        </NavLink>
      )}

      {/* IT */}
      {isIT && (
        <NavLink
          to="/it"
          style={linkStyle}
        >
          <Package size={20} />
          IT
        </NavLink>
      )}

      {/* LOGISTICS */}
      {isLogistics && (
        <NavLink
          to="/logistics"
          style={linkStyle}
        >
          <Package size={20} />
          Logistică
        </NavLink>
      )}

      {/* MODERATION */}
      {isModerator && (
        <NavLink
          to="/moderation"
          style={linkStyle}
        >
          <Package size={20} />
          Moderare
        </NavLink>
      )}

      <button
        onClick={logout}
        style={{
          marginTop: "auto",
          margin: 20,
          padding: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "none",
          background: "#fee2e2",
          color: "#dc2626",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        <LogOut size={18} />
        Deconectare
      </button>
    </div>
  );
}