import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw, Wallet } from "lucide-react";

import { adminApi } from "../api/client";
import "./css/WithdrawalsPage.css";

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const res = await adminApi.getWithdrawals(page, status);

      setWithdrawals(res.data.data || []);
      setPages(res.data.pages || 1);
    } catch (error) {
      console.error("Eroare la încărcarea retragerilor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status]);

  const handleApprove = async (id) => {
    if (!confirm("Sigur vrei să aprobi această retragere?")) {
      return;
    }

    try {
      setProcessing(id);

      await adminApi.approveWithdrawal(id);

      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Eroare la aprobarea retragerii.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    if (
      !confirm(
        "Sigur vrei să respingi această retragere? Banii vor fi returnați utilizatorului.",
      )
    ) {
      return;
    }

    try {
      setProcessing(id);

      await adminApi.rejectWithdrawal(id);

      await load();
    } catch (error) {
      alert(
        error.response?.data?.message || "Eroare la respingerea retragerii.",
      );
    } finally {
      setProcessing(null);
    }
  };

  const formatMoney = (amount) => `${Number(amount || 0).toFixed(2)} RON`;

  const formatDate = (date) =>
    new Date(date).toLocaleString("ro-RO", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const statusLabel = {
    pending: "În așteptare",
    completed: "Finalizată",
    rejected: "Respinsă",
    failed: "Eșuată",
  };

  const statusClass = {
    pending: "withdrawal-status pending",
    completed: "withdrawal-status completed",
    rejected: "withdrawal-status rejected",
    failed: "withdrawal-status failed",
  };

  return (
    <div className="withdrawals-page">
      <div className="withdrawals-header">
        <div className="withdrawals-header-left">
          <h1>Retrageri</h1>

          <p>Gestionează cererile de retragere ale utilizatorilor.</p>
        </div>

        <button
          className="withdrawals-refresh"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "withdrawals-spin" : ""} />
          Reîmprospătează
        </button>
      </div>

      <div className="withdrawals-tabs">
        <button
          className={`withdrawals-tab ${status === "pending" ? "active" : ""}`}
          onClick={() => {
            setStatus("pending");
            setPage(1);
          }}
        >
          <Clock size={17} />
          În așteptare
        </button>

        <button
          className={`withdrawals-tab ${
            status === "completed" ? "active" : ""
          }`}
          onClick={() => {
            setStatus("completed");
            setPage(1);
          }}
        >
          <CheckCircle size={17} />
          Aprobate
        </button>

        <button
          className={`withdrawals-tab ${status === "rejected" ? "active" : ""}`}
          onClick={() => {
            setStatus("rejected");
            setPage(1);
          }}
        >
          <XCircle size={17} />
          Respinse
        </button>
      </div>

      <div className="withdrawals-card">
        {loading ? (
          <div className="withdrawals-empty">
            <div className="withdrawals-empty-icon">
              <RefreshCw size={28} className="withdrawals-spin" />
            </div>

            <div className="withdrawals-empty-title">
              Se încarcă retragerile...
            </div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="withdrawals-empty">
            <div className="withdrawals-empty-icon">
              <Wallet size={30} />
            </div>

            <div className="withdrawals-empty-title">Nu există retrageri</div>

            <div className="withdrawals-empty-text">
              Nu există cereri cu statusul selectat.
            </div>
          </div>
        ) : (
          <>
            <div className="withdrawals-table-header">
              <div>Utilizator</div>
              <div>Sumă</div>
              <div>IBAN</div>
              <div>Data</div>
              <div>Status</div>
              <div />
            </div>

            {withdrawals.map((withdrawal) => {
              const user = withdrawal.user;

              const iban = withdrawal.withdrawal?.iban || "Nespecificat";

              return (
                <div className="withdrawal-row" key={withdrawal._id}>
                  <div className="withdrawal-user">
                    <div className="withdrawal-avatar">
                      {(user?.username || user?.email || "?")[0].toUpperCase()}
                    </div>

                    <div className="withdrawal-user-info">
                      <div className="withdrawal-user-name">
                        {user?.username || "Utilizator necunoscut"}
                      </div>

                      <div className="withdrawal-user-email">
                        {user?.email || "Fără email"}
                      </div>
                    </div>
                  </div>

                  <div className="withdrawal-meta">
                    <span className="withdrawal-label">Sumă</span>

                    <span className="withdrawal-amount">
                      {formatMoney(withdrawal.amount)}
                    </span>
                  </div>

                  <div className="withdrawal-meta">
                    <span className="withdrawal-label">IBAN</span>

                    <span className="withdrawal-value withdrawal-iban">
                      {iban}
                    </span>
                  </div>

                  <div className="withdrawal-meta">
                    <span className="withdrawal-label">Data</span>

                    <span className="withdrawal-value">
                      {formatDate(withdrawal.createdAt)}
                    </span>
                  </div>

                  <div>
                    <span className={`withdrawal-status ${withdrawal.status}`}>
                      {statusLabel[withdrawal.status] || withdrawal.status}
                    </span>
                  </div>

                  <div className="withdrawal-actions">
                    {withdrawal.status === "pending" && (
                      <>
                        <button
                          className="withdrawal-action reject"
                          disabled={processing === withdrawal._id}
                          onClick={() => handleReject(withdrawal._id)}
                        >
                          <XCircle size={16} />
                          Respinge
                        </button>

                        <button
                          className="withdrawal-action approve"
                          disabled={processing === withdrawal._id}
                          onClick={() => handleApprove(withdrawal._id)}
                        >
                          <CheckCircle size={16} />
                          Aprobă
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {pages > 1 && (
        <div className="withdrawals-pagination">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={`withdrawals-page-button ${
                page === i + 1 ? "active" : ""
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
