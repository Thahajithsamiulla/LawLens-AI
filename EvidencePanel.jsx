import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Scale, 
  Award,
  Hash,
  Database,
  Calendar,
  Building
} from 'lucide-react';
export default function EvidencePanel({ evidenceList = [], onClose, selectedEvidence }) {
  const list = evidenceList || [];
  
  const getItemId = (item) => item?.chunk_id || item?.id || item?.document_id || '';

  const [activeId, setActiveId] = useState(
    selectedEvidence ? getItemId(selectedEvidence) : (list.length > 0 ? getItemId(list[0]) : '')
  );

  // Sync active item when selectedEvidence changes from parent
  useEffect(() => {
    if (selectedEvidence) {
      setActiveId(getItemId(selectedEvidence));
    } else if (list.length > 0) {
      setActiveId(getItemId(list[0]));
    } else {
      setActiveId('');
    }
  }, [selectedEvidence, evidenceList]);

  const currentItem = list.find((item) => getItemId(item) === activeId) || list[0];

  const getStatusBadge = (item) => {
    if (!item) return null;
    if (item?.score !== undefined && item.score !== null) {
      const percentage = (item.score * 100).toFixed(1);
      return (
        <span className="badge badge-gold" title={`Vector similarity score: ${item.score}`}>
          <Award size={12} /> {percentage}% Match
        </span>
      );
    }

    if (item?.verification_status) {
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} /> {item.verification_status}
        </span>
      );
    }
    return (
      <span className="badge badge-warning">
        <AlertCircle size={12} /> Retrieved Chunk
      </span>
    );
  };

  return (
    <aside className="evidence-panel animate-fade-in">
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <ShieldCheck size={18} className="panel-shield-icon" />
          <h3 className="panel-title">Evidence & Verification</h3>
        </div>
        <button className="panel-close-btn" onClick={onClose} aria-label="Close Evidence Panel">
          <X size={18} />
        </button>
      </div>

      <div className="panel-body">
        {list.length === 0 ? (
          <div className="empty-evidence-card">
            <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>No evidence was returned.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
              Submit a research question to view retrieved statutory sections and precedent chunks.
            </p>
          </div>
        ) : (
          <>
            {/* Source Selector Tabs */}
            <div className="sources-tab-bar">
              <span className="tab-label">Retrieved Evidence Items ({list.length})</span>
              <div className="sources-chip-container">
                {list.map((item, index) => {
                  const id = getItemId(item);
                  const isSelected = id === getItemId(currentItem);
                  return (
                    <button
                      key={id || index}
                      className={`source-selector-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setActiveId(id)}
                    >
                      <div className="source-btn-top">
                        <span className="source-num">Source #{index + 1}</span>
                        <span className="source-type-tag">{item.document_type || 'LAW'}</span>
                      </div>
                      <span className="source-name">
                        {item.title || item.case_title || item.act_title || `Evidence Chunk ${(id || '').slice(0, 10)}`}
                      </span>
                      {item.section_number && (
                        <span className="source-section">Sec. {item.section_number}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Evidence Detail View */}
            {currentItem && (
          <div className="evidence-detail-card">
            {/* Status Header */}
            <div className="detail-top-row">
              <span className="document-type-tag">{currentItem.document_type || 'LAW'}</span>
              {getStatusBadge(currentItem)}
            </div>

            {/* Legal Document Title */}
            <h4 className="document-title">
              {currentItem.title || currentItem.case_title || currentItem.act_title || 'Legal Document Evidence'}
            </h4>

            {/* Metadata Grid */}
            <div className="metadata-grid">
              {currentItem.section_number ? (
                <div className="meta-box">
                  <span className="meta-label">Section / Article</span>
                  <span className="meta-value highlight-cyan">Section {currentItem.section_number}</span>
                </div>
              ) : currentItem.section_article ? (
                <div className="meta-box">
                  <span className="meta-label">Section / Article</span>
                  <span className="meta-value highlight-cyan">{currentItem.section_article}</span>
                </div>
              ) : null}

              {currentItem.court && (
                <div className="meta-box">
                  <span className="meta-label">Court</span>
                  <span className="meta-value highlight-gold">{currentItem.court}</span>
                </div>
              )}

              {currentItem.year && (
                <div className="meta-box">
                  <span className="meta-label">Year / Date</span>
                  <span className="meta-value">{currentItem.year}</span>
                </div>
              )}

              {currentItem.citation && (
                <div className="meta-box">
                  <span className="meta-label">Official Citation</span>
                  <span className="meta-value highlight-gold">{currentItem.citation}</span>
                </div>
              )}

              {currentItem.score !== undefined && currentItem.score !== null && (
                <div className="meta-box">
                  <span className="meta-label">Relevance Score</span>
                  <span className="meta-value highlight-cyan">{(currentItem.score * 100).toFixed(2)}%</span>
                </div>
              )}
            </div>

            {/* Identifiers audit box */}
            <div className="identifiers-box">
              <div className="id-row">
                <Hash size={12} className="id-icon" />
                <span className="id-label">Chunk ID:</span>
                <span className="id-val">{currentItem.chunk_id || currentItem.id || 'N/A'}</span>
              </div>
              <div className="id-row">
                <Database size={12} className="id-icon" />
                <span className="id-label">Document ID:</span>
                <span className="id-val">{currentItem.document_id || 'N/A'}</span>
              </div>
            </div>

            {/* Text Snippet / Excerpt */}
            {(currentItem.snippet || currentItem.text) && (
              <div className="snippet-container">
                <div className="snippet-header">
                  <FileText size={14} />
                  <span>Legal Evidence Excerpt</span>
                </div>
                <p className="snippet-body">"{currentItem.snippet || currentItem.text}"</p>
              </div>
            )}

            {/* Verification Audit Details */}
            <div className="audit-box">
              <div className="audit-header">
                <Scale size={14} className="audit-icon" />
                <span>MongoDB Atlas Vector Verification</span>
              </div>
              <p className="audit-text">
                Indexed in MongoDB vector collection. Gemini 1536-dim embedding vector validated against authoritative Indian legal corpus.
              </p>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <style>{`
        .evidence-panel {
          width: var(--evidence-width);
          height: 100%;
          background-color: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 25;
          box-shadow: var(--shadow-md);
        }

        .panel-header {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
        }

        .panel-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panel-shield-icon {
          color: var(--accent-gold);
        }

        .panel-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .panel-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s;
        }

        .panel-close-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface-hover);
        }

        .panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sources-tab-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tab-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sources-chip-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .source-selector-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 10px 12px;
          border-radius: 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .source-btn-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .source-selector-btn:hover {
          border-color: var(--border-color);
          background-color: var(--bg-surface-hover);
        }

        .source-selector-btn.active {
          background-color: var(--bg-tertiary);
          border-color: var(--accent-cyan);
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.1);
        }

        .source-num {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--accent-gold);
          text-transform: uppercase;
        }

        .source-type-tag {
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--accent-cyan);
          background: rgba(0, 229, 255, 0.1);
          padding: 1px 4px;
          border-radius: 3px;
        }

        .source-name {
          font-size: 0.84rem;
          color: var(--text-primary);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .source-section {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .evidence-detail-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .detail-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .document-type-tag {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary);
          background-color: var(--bg-primary);
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-subtle);
        }

        .document-title {
          font-size: 1.02rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .meta-box {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .meta-label {
          font-size: 0.66rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .meta-value {
          font-size: 0.82rem;
          font-weight: 600;
          word-break: break-word;
        }

        .highlight-cyan {
          color: var(--accent-cyan);
        }

        .highlight-gold {
          color: var(--accent-gold);
        }

        .identifiers-box {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.72rem;
        }

        .id-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .id-icon {
          color: var(--text-muted);
        }

        .id-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .id-val {
          color: var(--text-secondary);
          font-family: monospace;
          word-break: break-all;
        }

        .snippet-container {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .snippet-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .snippet-body {
          font-size: 0.83rem;
          color: #CBD5E1;
          line-height: 1.5;
          font-style: italic;
        }

        .audit-box {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .audit-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--status-success);
          text-transform: uppercase;
        }

        .audit-text {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.12);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-gold {
          background: rgba(212, 175, 55, 0.12);
          color: var(--accent-gold);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .badge-warning {
          background: rgba(245, 158, 11, 0.12);
          color: #FBBF24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
      `}</style>
    </aside>
  );
}

