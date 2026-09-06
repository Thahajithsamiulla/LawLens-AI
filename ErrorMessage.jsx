import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="message-row assistant-row animate-fade-in">
      <div className="avatar-wrapper">
        <div className="assistant-avatar error-avatar">
          <AlertTriangle size={18} />
        </div>
      </div>

      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="sender-name" style={{ color: 'var(--status-error)' }}>System Exception</span>
        </div>

        <div className="message-bubble assistant-bubble error-bubble">
          <div className="error-content">
            <h4 className="error-title">Unable to complete research query</h4>
            <p className="error-text">
              {message || 'The FastAPI backend service is offline or unreachable at http://localhost:8000.'}
            </p>
            {onRetry && (
              <button className="retry-btn" onClick={onRetry}>
                <RefreshCw size={14} />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .error-avatar {
          background: rgba(239, 68, 68, 0.15) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: var(--status-error) !important;
        }

        .error-bubble {
          border-color: rgba(239, 68, 68, 0.3) !important;
          background: rgba(239, 68, 68, 0.05) !important;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .error-title {
          font-size: 0.95rem;
          color: var(--status-error);
          font-weight: 600;
        }

        .error-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .retry-btn {
          align-self: flex-start;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          border-color: var(--status-error);
          color: var(--status-error);
        }
      `}</style>
    </div>
  );
}
