import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Users,
  Package,
  MessageSquare,
  Activity,
  ArrowUpRight,
  ArrowRight,
  UserPlus,
  Plus,
  Wallet,
  Bell,
  RefreshCw,
  CheckCircle2,
  CircleAlert,
  Clock3,
} from 'lucide-react';

import { adminApi } from '../api/client';
import './css/DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [statsRes, usersRes, listingsRes] =
        await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers(1, ''),
          adminApi.getListings(1),
        ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setListings(listingsRes.data.data || []);
    } catch (err) {
      console.error('Dashboard error:', err);

      setError(
        err.response?.data?.message ||
          'Nu am putut încărca dashboard-ul.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const activePercentage = useMemo(() => {
    if (
      !stats ||
      !stats.totalListings ||
      stats.totalListings <= 0
    ) {
      return 0;
    }

    return Math.round(
      (stats.activeListings /
        stats.totalListings) *
        100,
    );
  }, [stats]);

  const formatDate = (value) => {
    if (!value) return '—';

    return new Date(value).toLocaleDateString(
      'ro-RO',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  const formatPrice = (value, currency = 'RON') => {
    const amount = Number(value || 0);

    return `${amount.toLocaleString(
      'ro-RO',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )} ${currency}`;
  };

  const getInitial = (value) => {
    return (
      value?.toString()?.trim()?.[0] ||
      '?'
    ).toUpperCase();
  };

  const cards = stats
    ? [
        {
          label: 'Total utilizatori',
          value: stats.totalUsers,
          icon: Users,
          tone: 'green',
          description: 'Conturi înregistrate',
        },
        {
          label: 'Total anunțuri',
          value: stats.totalListings,
          icon: Package,
          tone: 'blue',
          description: 'Anunțuri din platformă',
        },
        {
          label: 'Anunțuri active',
          value: stats.activeListings,
          icon: Activity,
          tone: 'orange',
          description: `${activePercentage}% din total`,
        },
        {
          label: 'Conversații',
          value: stats.totalConversations,
          icon: MessageSquare,
          tone: 'purple',
          description: 'Conversații create',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <RefreshCw
            size={28}
            className="dashboard-spin"
          />
          <span>
            Se încarcă dashboard-ul...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            <CircleAlert size={26} />
          </div>

          <h2>
            Dashboard indisponibil
          </h2>

          <p>{error}</p>

          <button
            className="dashboard-primary-button"
            onClick={() =>
              loadDashboard()
            }
          >
            <RefreshCw size={17} />
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            NEXORA ADMIN
          </div>

          <h1>Dashboard</h1>

          <p>
            O privire de ansamblu asupra
            platformei tale.
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={() =>
            loadDashboard(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? 'dashboard-spin'
                : ''
            }
          />
          Actualizează
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="dashboard-stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="dashboard-stat-card"
              key={card.label}
            >
              <div className="dashboard-stat-top">
                <div
                  className={`dashboard-stat-icon ${card.tone}`}
                >
                  <Icon size={20} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="dashboard-stat-arrow"
                />
              </div>

              <div className="dashboard-stat-value">
                {Number(
                  card.value || 0,
                ).toLocaleString('ro-RO')}
              </div>

              <div className="dashboard-stat-label">
                {card.label}
              </div>

              <div className="dashboard-stat-description">
                {card.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="dashboard-main-grid">
        {/* PLATFORM OVERVIEW */}
        <section className="dashboard-panel overview-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>
                Activitatea platformei
              </h2>

              <p>
                Situația actuală a anunțurilor.
              </p>
            </div>

            <Activity
              size={20}
              className="dashboard-muted-icon"
            />
          </div>

          <div className="activity-content">
            <div className="activity-circle">
              <div className="activity-circle-inner">
                <strong>
                  {activePercentage}%
                </strong>
                <span>active</span>
              </div>
            </div>

            <div className="activity-details">
              <div className="activity-row">
                <div>
                  <span className="activity-dot green" />
                  Anunțuri active
                </div>

                <strong>
                  {Number(
                    stats.activeListings ||
                      0,
                  ).toLocaleString('ro-RO')}
                </strong>
              </div>

              <div className="activity-row">
                <div>
                  <span className="activity-dot gray" />
                  Alte anunțuri
                </div>

                <strong>
                  {Math.max(
                    0,
                    Number(
                      stats.totalListings ||
                        0,
                    ) -
                      Number(
                        stats.activeListings ||
                          0,
                      ),
                  ).toLocaleString('ro-RO')}
                </strong>
              </div>

              <div className="activity-row">
                <div>
                  <span className="activity-dot purple" />
                  Conversații
                </div>

                <strong>
                  {Number(
                    stats.totalConversations ||
                      0,
                  ).toLocaleString('ro-RO')}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Acțiuni rapide</h2>
              <p>
                Acces rapid la administrarea platformei.
              </p>
            </div>

            <ArrowRight
              size={20}
              className="dashboard-muted-icon"
            />
          </div>

          <div className="quick-actions">
            <button
              onClick={() =>
                navigate('/users')
              }
            >
              <span className="quick-action-icon green">
                <Users size={19} />
              </span>

              <span>
                <strong>
                  Utilizatori
                </strong>

                <small>
                  Gestionează conturile
                </small>
              </span>

              <ArrowRight size={17} />
            </button>

            <button
              onClick={() =>
                navigate('/listings')
              }
            >
              <span className="quick-action-icon blue">
                <Package size={19} />
              </span>

              <span>
                <strong>
                  Anunțuri
                </strong>

                <small>
                  Gestionează produsele
                </small>
              </span>

              <ArrowRight size={17} />
            </button>

            <button
              onClick={() =>
                navigate('/withdrawals')
              }
            >
              <span className="quick-action-icon orange">
                <Wallet size={19} />
              </span>

              <span>
                <strong>
                  Retrageri
                </strong>

                <small>
                  Verifică cererile
                </small>
              </span>

              <ArrowRight size={17} />
            </button>

            <button
              onClick={() =>
                navigate('/broadcast')
              }
            >
              <span className="quick-action-icon purple">
                <Bell size={19} />
              </span>

              <span>
                <strong>
                  Notificări
                </strong>

                <small>
                  Trimite broadcast
                </small>
              </span>

              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>

      {/* RECENT DATA */}
      <div className="dashboard-bottom-grid">
        {/* USERS */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>
                Utilizatori recenți
              </h2>

              <p>
                Ultimele conturi înregistrate.
              </p>
            </div>

            <button
              className="dashboard-link-button"
              onClick={() =>
                navigate('/users')
              }
            >
              Vezi toți
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="recent-list">
            {users.slice(0, 5).map((user) => (
              <button
                className="recent-item"
                key={user._id}
                onClick={() =>
                  navigate(
                    `/users/${user._id}`,
                  )
                }
              >
                <div className="recent-avatar">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                    />
                  ) : (
                    getInitial(
                      user.username ||
                        user.email,
                    )
                  )}
                </div>

                <div className="recent-main">
                  <strong>
                    {user.username ||
                      'Utilizator'}
                  </strong>

                  <span>
                    {user.email ||
                      'Fără email'}
                  </span>
                </div>

                <div className="recent-side">
                  <span className="recent-date">
                    {formatDate(
                      user.createdAt,
                    )}
                  </span>

                  <span
                    className={`recent-status ${
                      user.banned
                        ? 'danger'
                        : 'success'
                    }`}
                  >
                    {user.banned
                      ? 'Blocat'
                      : 'Activ'}
                  </span>
                </div>
              </button>
            ))}

            {users.length === 0 && (
              <div className="dashboard-empty">
                Nu există utilizatori.
              </div>
            )}
          </div>
        </section>

        {/* LISTINGS */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>
                Anunțuri recente
              </h2>

              <p>
                Ultimele produse publicate.
              </p>
            </div>

            <button
              className="dashboard-link-button"
              onClick={() =>
                navigate('/listings')
              }
            >
              Vezi toate
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="recent-list">
            {listings
              .slice(0, 5)
              .map((listing) => (
                <div
                  className="recent-item listing-item"
                  key={listing._id}
                >
                  <div className="recent-avatar listing">
                    <Package size={18} />
                  </div>

                  <div className="recent-main">
                    <strong>
                      {listing.title ||
                        'Fără titlu'}
                    </strong>

                    <span>
                      {listing.seller
                        ?.username ||
                        'Vânzător necunoscut'}
                    </span>
                  </div>

                  <div className="recent-side listing-side">
                    <strong className="listing-price">
                      {formatPrice(
                        listing.price,
                        listing.currency,
                      )}
                    </strong>

                    <span
                      className={`recent-status ${
                        listing.status ===
                        'active'
                          ? 'success'
                          : 'neutral'
                      }`}
                    >
                      {listing.status ||
                        'necunoscut'}
                    </span>
                  </div>
                </div>
              ))}

            {listings.length === 0 && (
              <div className="dashboard-empty">
                Nu există anunțuri.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER STATUS */}
      <div className="dashboard-footer-status">
        <div>
          <CheckCircle2 size={17} />
          Sistem operațional
        </div>

        <span>
          Actualizare automată la 30 secunde
        </span>

        <div>
          <Clock3 size={16} />
          Date live
        </div>
      </div>
    </div>
  );
}