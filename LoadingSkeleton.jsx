import React from 'react';
import { Scale, Sparkles } from 'lucide-react';

export default function LoadingSkeleton() {
  return (
    <div className="message-row assistant-row animate-fade-in">
      <div className="avatar-wrapper">
        <div className="assistant-avatar animate-pulse">
          <Scale size={18} />
        </div>
      </div>

      <div className="message-content-wrapper" style={{ width: '100%' }}>
        <div className="message-header">
          <span className="sender-name">LawLens AI</span>
          <span className="message-time">Analyzing statutory sources...</span>
        </div>

        <div className="message-bubble assistant-bubble loading-bubble">
          <div className="loading-status-bar">
            <Sparkles size={14} className="sparkle-spin" />
            <span>Retrieving ratio decidendi & precedents...</span>
          </div>

          <div className="skeleton-lines">
            <div className="skeleton-box" style={{ width: '45%', height: '18px', marginBottom: '12px' }}></div>
            <div className="skeleton-box" style={{ width: '92%', height: '14px', marginBottom: '8px' }}></div>
            <div className="skeleton-box" style={{ width: '88%', height: '14px', marginBottom: '8px' }}></div>
            <div className="skeleton-box" style={{ width: '75%', height: '14px', marginBottom: '16px' }}></div>

            <div className="skeleton-box" style={{ width: '50%', height: '18px', marginBottom: '12px' }}></div>
            <div className="skeleton-box" style={{ width: '95%', height: '14px', marginBottom: '8px' }}></div>
            <div className="skeleton-box" style={{ width: '80%', height: '14px' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        .loading-bubble {
          width: 100%;
        }

        .loading-status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--accent-gold);
          margin-bottom: 14px;
        }

        .sparkle-spin {
          animation: pulseGlow 1.5s infinite ease-in-out;
        }

        .skeleton-lines {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
