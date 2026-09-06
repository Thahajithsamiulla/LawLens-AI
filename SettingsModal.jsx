import React from 'react';
import { X, Settings, ShieldCheck, Server, Key, Terminal, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, backendStatus }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <Settings size={20} className="modal-icon" />
            <h3>LawLens AI — System Configuration</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Architecture Status */}
          <div className="config-card">
            <div className="card-header">
              <Server size={16} className="card-icon" />
              <span>Backend Architecture Status</span>
            </div>
            <div className="config-grid">
              <div className="config-item">
                <span className="item-label">API Gateway Base URL</span>
                <span className="item-val mono">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</span>
              </div>
              <div className="config-item">
                <span className="item-label">Health Check Status</span>
                <span className={`item-val ${backendStatus.online ? 'text-success' : 'text-warning'}`}>
                  {backendStatus.online ? '✓ GET /api/health OK' : '⚠ Disconnected / Standby'}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Key Policy */}
          <div className="config-card">
            <div className="card-header">
              <ShieldCheck size={16} className="card-icon" />
              <span>Security & Key Isolation Policy</span>
            </div>
            <ul className="security-list">
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>Zero Client-Side API Keys: React bundle contains no Gemini or Groq secrets.</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>Backend Isolated: Key references managed via FastAPI <code>backend/.env</code>.</span>
              </li>
              <li>
                <CheckCircle2 size={14} className="check-icon" />
                <span>Modular Service Architecture: Clean stubs ready for RAG, MongoDB & Vector search.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>Done</button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 20px;
        }

        .modal-content {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          width: 100%;
          max-width: 540px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-icon {
          color: var(--accent-gold);
        }

        .modal-header h3 {
          font-size: 1.05rem;
          color: var(--text-primary);
        }

        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .modal-close:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface-hover);
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .config-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .card-icon {
          color: var(--accent-cyan);
        }

        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .config-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-label {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .item-val {
          font-size: 0.83rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .mono {
          font-family: var(--font-mono);
          font-size: 0.78rem;
        }

        .text-success {
          color: var(--status-success);
        }

        .text-warning {
          color: var(--status-warning);
        }

        .security-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .security-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .check-icon {
          color: var(--status-success);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .modal-footer {
          padding: 14px 24px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
          background-color: var(--bg-primary);
        }

        .close-btn {
          padding: 8px 18px;
          border-radius: 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background-color: var(--bg-surface-hover);
          border-color: var(--accent-gold);
        }
      `}</style>
    </div>
  );
}
