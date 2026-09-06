import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Search, 
  MessageSquare, 
  Settings, 
  ChevronRight, 
  X, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
export default function Sidebar({ 
  activeConversationId, 
  conversations = [],
  onSelectConversation, 
  onNewResearch, 
  onOpenSettings,
  isOpen,
  onCloseMobile 
}) {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Branding */}
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon-wrapper">
              <Scale size={20} className="brand-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">LawLens <span className="brand-accent">AI</span></span>
              <span className="brand-subtitle">Legal Research System</span>
            </div>
          </div>
          {onCloseMobile && (
            <button className="mobile-close-btn" onClick={onCloseMobile} aria-label="Close Sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className="sidebar-action">
          <button className="new-research-btn" onClick={onNewResearch}>
            <Plus size={18} />
            <span>New Research</span>
          </button>
        </div>

        {/* History Search / Filter */}
        <div className="sidebar-search">
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Filter research history..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="history-filter-input"
            />
            {searchFilter && (
              <button className="clear-filter-btn" onClick={() => setSearchFilter('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="sidebar-history">
          <div className="history-label">
            <span>Recent Research</span>
            <span className="count-badge">{filteredConversations.length}</span>
          </div>

          <div className="history-scroll-area">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const sId = conv.session_id || conv.id;
                const isActive = activeConversationId === sId;
                const dateStr = conv.updated_at ? new Date(conv.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (conv.timestamp || '');
                return (
                  <button
                    key={sId}
                    className={`history-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectConversation(sId)}
                  >
                    <MessageSquare size={16} className="item-icon" />
                    <div className="item-content">
                      <span className="item-title">{conv.title}</span>
                      {dateStr && <span className="item-time">{dateStr}</span>}
                    </div>
                    {isActive && <ChevronRight size={14} className="item-active-arrow" />}
                  </button>
                );
              })
            ) : (
              <div className="empty-history">
                <span>No matching research sessions</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Settings */}
        <div className="sidebar-footer">
          <button className="settings-btn" onClick={onOpenSettings}>
            <Settings size={18} />
            <span>System Settings</span>
          </button>
          <div className="version-tag">
            <span className="version-dot"></span>
            <span>Step 1 Foundation</span>
          </div>
        </div>
      </aside>

      {/* Style for Sidebar */}
      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100%;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 30;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-header {
          padding: 20px 18px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(0, 229, 255, 0.15));
          border: 1px solid var(--border-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-gold);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
        }

        .brand-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--text-primary);
          display: block;
          line-height: 1.2;
        }

        .brand-accent {
          color: var(--accent-cyan);
        }

        .brand-subtitle {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }

        .mobile-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: none;
          padding: 4px;
        }

        .sidebar-action {
          padding: 16px 18px 12px;
        }

        .new-research-btn {
          width: 100%;
          padding: 11px 16px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1E293B, #0F172A);
          border: 1px solid var(--border-accent);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .new-research-btn:hover {
          background: linear-gradient(135deg, #2D3748, #1E293B);
          border-color: var(--accent-gold);
          color: var(--accent-gold-light);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
          transform: translateY(-1px);
        }

        .sidebar-search {
          padding: 4px 18px 12px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .history-filter-input {
          width: 100%;
          padding: 8px 12px 8px 34px;
          border-radius: 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 0.82rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .history-filter-input:focus {
          border-color: var(--accent-cyan);
        }

        .clear-filter-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .sidebar-history {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          overflow: hidden;
        }

        .history-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .count-badge {
          background-color: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 999px;
          font-size: 0.7rem;
        }

        .history-scroll-area {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 2px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
        }

        .history-item:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
        }

        .history-item.active {
          background-color: var(--bg-surface);
          border-color: rgba(0, 229, 255, 0.3);
          color: var(--accent-cyan);
        }

        .item-icon {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .history-item.active .item-icon {
          opacity: 1;
          color: var(--accent-cyan);
        }

        .item-content {
          flex: 1;
          overflow: hidden;
        }

        .item-title {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-time {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .item-active-arrow {
          flex-shrink: 0;
          color: var(--accent-cyan);
        }

        .empty-history {
          padding: 20px 10px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .sidebar-footer {
          padding: 14px 18px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .settings-btn {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .settings-btn:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .version-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: var(--text-muted);
          justify-content: center;
        }

        .version-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--status-success);
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: var(--shadow-lg);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .mobile-close-btn {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
