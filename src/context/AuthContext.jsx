import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import client, { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("admin_token"),
  );

  const [user, setUser] = useState(null);

  const [loadingUser, setLoadingUser] = useState(
    !!localStorage.getItem("admin_token"),
  );

  const [error, setError] = useState(null);

  async function loadUser() {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoadingUser(false);
      return;
    }

    try {
      setLoadingUser(true);

      const response = await client.get(
        "/support/staff/info",
      );

      console.log(
        "SUPPORT STAFF INFO:",
        response.data,
      );

      /*
       * Acceptăm ambele variante:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * sau
       *
       * {
       *   id: "...",
       *   role: "...",
       *   department: "...",
       *   departments: [...]
       * }
       */
      const staff =
        response.data?.data ||
        response.data?.staff ||
        response.data;

      if (!staff?.role) {
        throw new Error(
          "Nu s-au putut încărca permisiunile contului.",
        );
      }

      setUser(staff);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(
        "LOAD USER ERROR:",
        err,
      );

      /*
       * Nu ștergem tokenul pentru orice eroare.
       *
       * Tokenul se șterge doar când serverul spune
       * că autentificarea nu mai este validă.
       */
      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem(
          "admin_token",
        );

        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);

    try {
      const { data } = await authApi.login(
        email,
        password,
      );

      console.log(
        "LOGIN RESPONSE:",
        data,
      );

      if (data.requiresTwoFactor) {
        throw new Error(
          "Contul necesită 2FA — momentan nesuportat în acest panou",
        );
      }

      if (!data.token) {
        throw new Error(
          "Serverul nu a returnat tokenul de autentificare.",
        );
      }

      localStorage.setItem(
        "admin_token",
        data.token,
      );

      setIsAuthenticated(true);

      /*
       * Obținem role + department.
       */
      const response = await client.get(
        "/support/staff/info",
      );

      console.log(
        "STAFF INFO AFTER LOGIN:",
        response.data,
      );

      const staff =
        response.data?.data ||
        response.data?.staff ||
        response.data;

      if (!staff?.role) {
        throw new Error(
          "Nu s-au putut încărca permisiunile contului.",
        );
      }

      setUser(staff);

      return true;
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err,
      );

      /*
       * Dacă autentificarea chiar a eșuat,
       * eliminăm tokenul.
       */
      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem(
          "admin_token",
        );
      }

      setIsAuthenticated(
        !!localStorage.getItem(
          "admin_token",
        ),
      );

      setUser(null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Eroare de autentificare",
      );

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(
      "admin_token",
    );

    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const isAdmin =
    user?.role === "admin";

  const isFinance =
    user?.role === "finance_agent" &&
    user?.department === "payments";

  const isIT =
    user?.role === "it_agent" &&
    user?.department === "it";

  const isLogistics =
    user?.role === "logistics_agent" &&
    user?.department === "logistics";

  const isModerator =
    user?.role === "moderator" &&
    user?.department === "moderation";

  const isSupportAgent =
    user?.role === "support_agent" &&
    user?.department === "call_center";

  const isSupportManager =
    user?.role === "support_manager";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loadingUser,
        error,

        isAdmin,
        isFinance,
        isIT,
        isLogistics,
        isModerator,
        isSupportAgent,
        isSupportManager,

        login,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);