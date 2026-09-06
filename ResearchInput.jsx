import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, CornerDownLeft } from 'lucide-react';

export default function ResearchInput({ onSend, isLoading }) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSend(query.trim());
      setQuery('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-container-wrapper">
      <form onSubmit={handleSubmit} className="research-form">
        <div className="input-box-wrapper">
          <div className="input-prefix-icon">
            <Scale size={18} className="scale-icon" />
          </div>

          <textarea
            ref={textareaRef}
            className="research-textarea"
            placeholder="Ask a legal question (e.g. doctrine of promissory estoppel, statutory interpretation, ratio decidendi)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />

          <button
            type="submit"
            className={`send-button ${query.trim() && !isLoading ? 'active' : ''}`}
            disabled={!query.trim() || isLoading}
            title="Send Legal Research Query (Enter)"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="input-footer-bar">
          <span className="disclaimer-text">
            LawLens AI provides structured analysis. Always verify citations against official statutory gazettes.
          </span>
          <span className="shortcut-hint">
            Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for line break
          </span>
        </div>
      </form>

      <style>{`
        .input-container-wrapper {
          padding: 16px 24px 20px;
          background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 30%);
          position: relative;
          z-index: 10;
        }

        .research-form {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-box-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: var(--shadow-md);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-box-wrapper:focus-within {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.12);
        }

        .input-prefix-icon {
          padding-bottom: 8px;
          color: var(--text-muted);
        }

        .input-box-wrapper:focus-within .scale-icon {
          color: var(--accent-cyan);
        }

        .research-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          line-height: 1.5;
          resize: none;
          max-height: 180px;
          padding: 6px 0;
        }

        .research-textarea::placeholder {
          color: var(--text-muted);
        }

        .send-button {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: not-allowed;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-button.active {
          background: linear-gradient(135deg, var(--accent-gold), #B8860B);
          border-color: var(--accent-gold);
          color: #000000;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
        }

        .send-button.active:hover {
          transform: scale(1.05);
        }

        .input-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .shortcut-hint kbd {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 1px 4px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-secondary);
        }

        @media (max-width: 640px) {
          .shortcut-hint {
            display: none;
          }

          .input-container-wrapper {
            padding: 12px 16px 16px;
          }
        }
      `}</style>
    </div>
  );
}
