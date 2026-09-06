import React from 'react';
import { Menu, BookOpen, Activity, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Header({ 
  onToggleMobileSidebar, 
  onToggleEvidence, 
  isEvidenceOpen, 
  backendStatus,
  onRefreshHealth 
}) {
  return (
    <header className="main-header">
      <div className="header-left">
        <button 
          className="icon-btn mobile-menu-btn" 
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-wrapper">
          <h1 className="header-title">LawLens AI</h1>
          <span className="header-tag">Step 1 Research Interface</span>
        </div>
      </div>

      <div className="header-right">
        {/* Backend Connection Status Badge */}
        <button 
          className={`status-pill ${backendStatus.online ? (backendStatus.ready ? 'online' : 'ready-warning') : 'connecting'}`}
          onClick={onRefreshHealth}
          title="Click to re-check FastAPI Backend Connection and dependencies status"
        >
          <span className="status-dot"></span>
          <span className="status-text">
            {backendStatus.loading 
              ? 'Connecting...' 
              : backendStatus.online 
                ? (backendStatus.ready ? 'Research Services Ready' : 'Backend Online — Services Standby')
                : 'Backend Offline'}
          </span>
          <Activity size={13} className="status-icon" />
        </button>

        {/* Evidence Panel Toggle Button */}
        <button 
          className={`evidence-toggle-btn ${isEvidenceOpen ? 'active' : ''}`}
          onClick={onToggleEvidence}
          title="Toggle Evidence & Sources View"
        >
          <BookOpen size={16} />
          <span className="evidence-btn-text">Evidence</span>
          <ShieldCheck size={14} className="evidence-check" />
        </button>
      </div>

      <style>{`
        .main-header {
          height: 60px;
          padding: 0 24px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
        }

        .mobile-menu-btn:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
        }

        .header-title-wrapper {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .header-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .header-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
          background-color: var(--bg-surface);
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .status-pill.online {
          background: rgba(16, 185, 129, 0.1);
          color: var(--status-success);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .status-pill.connecting {
          background: rgba(245, 158, 11, 0.1);
          color: var(--status-warning);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: currentColor;
          animation: pulseGlow 2s infinite ease-in-out;
        }

        .status-icon {
          opacity: 0.8;
        }

        .evidence-toggle-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .evidence-toggle-btn:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
          border-color: var(--accent-gold);
        }

        .evidence-toggle-btn.active {
          background: rgba(212, 175, 55, 0.12);
          color: var(--accent-gold);
          border-color: var(--border-accent);
        }

        .evidence-check {
          color: var(--accent-gold);
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }

          .header-tag {
            display: none;
          }

          .evidence-btn-text {
            display: none;
          }

          .status-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
