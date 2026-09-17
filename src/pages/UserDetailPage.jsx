import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../api/client";

import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Ban,
  Unlock,
  Save,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import "./css/UserDetailPage.css";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);

  const load = () => {
    adminApi.getUserDetails(id).then((res) => {
      setUser(res.data.data);
      setNewEmail(res.data.data.email);
    });
  };

  useEffect(load, [id]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleResetPassword = async (generateRandom) => {
    try {
      const { data } = await adminApi.resetUserPassword(
        id,
        generateRandom ? null : newPassword,
      );
      if (data.temporaryPassword) {
        showMessage(
          `Parolă nouă generată: ${data.temporaryPassword} (transmite-o userului!)`,
        );
      } else {
        showMessage("Parola a fost resetată cu succes");
      }
      setNewPassword("");
    } catch (err) {
      showMessage(err.response?.data?.message || "Eroare", "error");
    }
  };

  const handleUpdateEmail = async () => {
    try {
      await adminApi.updateUserEmail(id, newEmail);
      showMessage("Email actualizat cu succes");
      load();
    } catch (err) {
      showMessage(err.response?.data?.message || "Eroare", "error");
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Sigur dezactivezi 2FA pentru acest cont?")) return;
    try {
      await adminApi.disableUserTwoFactor(id);
      showMessage("2FA dezactivat");
      load();
    } catch (err) {
      showMessage(err.response?.data?.message || "Eroare", "error");
    }
  };

  const handleToggleBan = async () => {
    await adminApi.toggleBanUser(id);
    load();
  };

  const handleDelete = async () => {
    if (!confirm("ȘTERGERE PERMANENTĂ a contului. Continui?")) return;
    await adminApi.deleteUser(id);
    navigate("/users");
  };

  if (!user) {
    return (
      <div className="user-detail-loading">Se încarcă utilizatorul...</div>
    );
  }

  const initial = (user.username || user.email || "?")[0].toUpperCase();

  return (
    <div className="user-detail-page">
      <div className="user-detail-container">
        <button className="user-detail-back" onClick={() => navigate("/users")}>
          <ArrowLeft size={16} />
          Înapoi la useri
        </button>

        {message && (
          <div className={`user-detail-message ${message.type}`}>
            {message.type === "error" ? (
              <AlertTriangle size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}

            <span>{message.text}</span>
          </div>
        )}

        <div className="user-detail-header">
          <div className="user-detail-profile">
            <div className="user-detail-avatar">
              {user.avatar ? <img src={user.avatar} alt="" /> : initial}
            </div>

            <div className="user-detail-heading">
              <h1>{user.username}</h1>

              <div className="user-detail-email">{user.email}</div>

              {user.provider && (
                <div className="user-detail-provider">Cont {user.provider}</div>
              )}
            </div>
          </div>

          <div className="user-detail-actions">
            <button className="user-detail-top-action" onClick={load}>
              <RefreshCw size={15} />
              Actualizează
            </button>

            <button
              className="user-detail-top-action"
              onClick={handleToggleBan}
            >
              {user.banned ? (
                <>
                  <Unlock size={15} />
                  Deblochează
                </>
              ) : (
                <>
                  <Ban size={15} />
                  Blochează
                </>
              )}
            </button>
          </div>
        </div>

        <div className="user-detail-grid">
          <div className="user-detail-column">
            <section className="user-detail-section">
              <div className="user-detail-section-header">
                <div className="user-detail-section-icon">
                  <User size={19} />
                </div>

                <div>
                  <h2>Informații cont</h2>
                  <p>Date generale despre utilizator</p>
                </div>
              </div>

              <div className="user-detail-info">
                <div className="user-detail-row">
                  <span className="user-detail-row-label">Username</span>

                  <span className="user-detail-row-value">
                    {user.username || "—"}
                  </span>
                </div>

                <div className="user-detail-row">
                  <span className="user-detail-row-label">Email</span>

                  <span className="user-detail-row-value">
                    {user.email || "—"}
                  </span>
                </div>

                <div className="user-detail-row">
                  <span className="user-detail-row-label">Rol</span>

                  <span className="user-detail-row-value">
                    {user.role || "user"}
                  </span>
                </div>

                <div className="user-detail-row">
                  <span className="user-detail-row-label">Status</span>

                  <span
                    className={`user-detail-status ${
                      user.banned ? "banned" : "active"
                    }`}
                  >
                    {user.banned ? "Blocat" : "Activ"}
                  </span>
                </div>

                <div className="user-detail-row">
                  <span className="user-detail-row-label">
                    Autentificare 2FA
                  </span>

                  <span
                    className={`user-detail-status ${
                      user.twoFactorEnabled ? "enabled" : "disabled"
                    }`}
                  >
                    {user.twoFactorEnabled ? "Activat" : "Dezactivat"}
                  </span>
                </div>

                <div className="user-detail-row">
                  <span className="user-detail-row-label">Cont creat</span>

                  <span className="user-detail-row-value">
                    {new Date(user.createdAt).toLocaleDateString("ro-RO")}
                  </span>
                </div>
              </div>
            </section>

            <section className="user-detail-section">
              <div className="user-detail-section-header">
                <div className="user-detail-section-icon">
                  <Mail size={19} />
                </div>

                <div>
                  <h2>Adresa de email</h2>
                  <p>Modifică adresa asociată contului</p>
                </div>
              </div>

              <div className="user-detail-form">
                <div className="user-detail-field">
                  <label>Email nou</label>

                  <div className="user-detail-form-row">
                    <input
                      className="user-detail-input"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />

                    <button
                      className="user-detail-button"
                      onClick={handleUpdateEmail}
                    >
                      <Save size={15} />
                      Salvează
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="user-detail-section">
              <div className="user-detail-section-header">
                <div className="user-detail-section-icon">
                  <Lock size={19} />
                </div>

                <div>
                  <h2>Parolă</h2>
                  <p>Resetează parola utilizatorului</p>
                </div>
              </div>

              <div className="user-detail-form">
                <div className="user-detail-field">
                  <label>Setează o parolă nouă</label>

                  <div className="user-detail-form-row">
                    <input
                      className="user-detail-input"
                      type="password"
                      placeholder="Parolă nouă"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <button
                      className="user-detail-button"
                      disabled={!newPassword}
                      onClick={() => handleResetPassword(false)}
                    >
                      Setează
                    </button>
                  </div>
                </div>

                <button
                  className="user-detail-button secondary"
                  onClick={() => handleResetPassword(true)}
                >
                  <RefreshCw size={15} />
                  Generează parolă aleatorie
                </button>
              </div>
            </section>
          </div>

          <div className="user-detail-column">
            {user.twoFactorEnabled && (
              <section className="user-detail-section">
                <div className="user-detail-section-header">
                  <div className="user-detail-section-icon">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h2>Autentificare în 2 pași</h2>
                    <p>Securitatea contului</p>
                  </div>
                </div>

                <p className="user-detail-danger-text">
                  Dezactivează 2FA doar dacă utilizatorul și-a pierdut accesul
                  la aplicația de autentificare.
                </p>

                <button
                  className="user-detail-button warning full"
                  onClick={handleDisable2FA}
                >
                  Dezactivează 2FA
                </button>
              </section>
            )}

            <section className="user-detail-section">
              <div className="user-detail-section-header">
                <div className="user-detail-section-icon">
                  <User size={19} />
                </div>

                <div>
                  <h2>Acțiuni cont</h2>
                  <p>Administrare rapidă</p>
                </div>
              </div>

              <button
                className={`user-detail-button ${
                  user.banned ? "" : "warning"
                } full`}
                onClick={handleToggleBan}
              >
                {user.banned ? (
                  <>
                    <Unlock size={16} />
                    Deblochează contul
                  </>
                ) : (
                  <>
                    <Ban size={16} />
                    Blochează contul
                  </>
                )}
              </button>
            </section>

            <section className="user-detail-section user-detail-danger-section">
              <div className="user-detail-section-header">
                <div className="user-detail-section-icon">
                  <Trash2 size={19} />
                </div>

                <div>
                  <h2>Zonă periculoasă</h2>
                  <p>Acțiuni ireversibile</p>
                </div>
              </div>

              <p className="user-detail-danger-text">
                Ștergerea contului este permanentă și nu poate fi anulată.
              </p>

              <button
                className="user-detail-button danger full"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Șterge contul permanent
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
