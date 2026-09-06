import React, { useState } from 'react';
import { 
  User, 
  Scale, 
  Copy, 
  Check, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  FileText,
  AlertCircle,
  Cpu,
  Sparkles,
  Search
} from 'lucide-react';

export default function MessageItem({ message, onSelectEvidence }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format text with headers, bullet points, and bold styling
  const renderFormattedLegalText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ') || line.startsWith('#### ')) {
        const titleText = line.replace(/^(###|####)\s*/, '');
        return <h4 key={idx} className="legal-heading">{titleText}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletContent = line.replace(/^[-*]\s*/, '');
        return (
          <li key={idx} className="legal-bullet-item">
            {formatBoldText(bulletContent)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="legal-paragraph-spacer" />;
      }
      return <p key={idx} className="legal-paragraph">{formatBoldText(line)}</p>;
    });
  };

  const formatBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="legal-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Render Claim Support Status Badge
  const renderClaimStatusBadge = (status) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="badge badge-supported">
            <CheckCircle2 size={12} /> Supported
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="badge badge-partial">
            <AlertTriangle size={12} /> Partial Support
          </span>
        );
      case 'UNSUPPORTED':
      case 'NOT_SUPPORTED':
        return (
          <span className="badge badge-unsupported">
            <XCircle size={12} /> Unsupported
          </span>
        );
      default:
        return (
          <span className="badge badge-unverifiable">
            <HelpCircle size={12} /> {status || 'Unverified'}
          </span>
        );
    }
  };

  // Render Groq Verification Status Badge
  const renderGroqStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="badge badge-groq-verified">
            <ShieldCheck size={13} /> Verified by Groq
          </span>
        );
      case 'PARTIALLY_VERIFIED':
        return (
          <span className="badge badge-groq-partial">
            <AlertTriangle size={13} /> Partially Verified
          </span>
        );
      case 'NOT_VERIFIED':
        return (
          <span className="badge badge-groq-failed">
            <XCircle size={13} /> Not Verified
          </span>
        );
      default:
        return (
          <span className="badge badge-groq-unverifiable">
            <AlertCircle size={13} /> Unverifiable
          </span>
        );
    }
  };

  const findEvidenceObj = (chunkId) => {
    if (!message.evidence) return null;
    return message.evidence.find(ev => ev.chunk_id === chunkId || ev.id === chunkId);
  };

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'} animate-fade-in`}>
      <div className="avatar-wrapper">
        {isUser ? (
          <div className="user-avatar" title="You">
            <User size={16} />
          </div>
        ) : (
          <div className="assistant-avatar" title="LawLens AI Assistant">
            <Scale size={18} />
          </div>
        )}
      </div>

      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="sender-name">{isUser ? 'Legal Researcher' : 'LawLens AI Intelligence'}</span>
          <span className="message-time">{message.timestamp || 'Just now'}</span>
          {!isUser && message.status === 'grounded' && (
            <span className="grounded-tag"><Sparkles size={11} /> Grounded RAG</span>
          )}
        </div>

        <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          {isUser ? (
            <p className="user-text">{message.text}</p>
          ) : (
            <div className="legal-answer-area">
              {/* Insufficient Evidence Warning Banner */}
              {message.status === 'insufficient_evidence' && (
                <div className="warning-banner">
                  <AlertCircle size={16} className="warning-icon" />
                  <div>
                    <strong>Insufficient Grounding Evidence</strong>
                    <p>The system did not locate high-confidence statutory text or case precedents for this query.</p>
                  </div>
                </div>
              )}

              {/* Main Synthesized Legal Answer */}
              <div className="answer-section">
                {renderFormattedLegalText(message.text)}
              </div>

              {/* Key Points Summary */}
              {message.key_points && message.key_points.length > 0 && (
                <div className="rag-sub-block key-points-block">
                  <div className="block-title">
                    <Sparkles size={14} className="title-icon gold-icon" />
                    <span>Key Takeaways</span>
                  </div>
                  <ul className="key-points-list">
                    {message.key_points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted Claims & Support Traceability */}
              {message.claims && message.claims.length > 0 && (
                <div className="rag-sub-block claims-block">
                  <div className="block-title">
                    <FileText size={14} className="title-icon cyan-icon" />
                    <span>Extracted Legal Claims & Evidence Mapping ({message.claims.length})</span>
                  </div>
                  <div className="claims-list">
                    {message.claims.map((claim) => (
                      <div key={claim.claim_id} className="claim-card">
                        <div className="claim-header">
                          <span className="claim-type-tag">{claim.claim_type || 'CLAIM'}</span>
                          {renderClaimStatusBadge(claim.support_status)}
                        </div>
                        <p className="claim-text">{claim.claim_text}</p>
                        {claim.evidence_ids && claim.evidence_ids.length > 0 && (
                          <div className="mapped-evidence-row">
                            <span className="mapped-label">Sources:</span>
                            {claim.evidence_ids.map((chunkId) => {
                              const ev = findEvidenceObj(chunkId);
                              return (
                                <button
                                  key={chunkId}
                                  className="chunk-ref-btn"
                                  onClick={() => ev && onSelectEvidence && onSelectEvidence(ev)}
                                  title={`View Chunk ${chunkId}`}
                                >
                                  <BookOpen size={10} />
                                  <span>{ev?.title ? (ev.title.length > 20 ? ev.title.slice(0, 20) + '...' : ev.title) : chunkId.slice(0, 12)}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="rag-sub-block citations-block">
                  <div className="block-title">
                    <BookOpen size={14} className="title-icon gold-icon" />
                    <span>Extracted Statutory & Judicial Citations ({message.citations.length})</span>
                  </div>
                  <div className="citations-grid">
                    {message.citations.map((cite) => (
                      <div key={cite.citation_id} className="citation-chip">
                        <span className="citation-type-badge">{cite.citation_type || 'CITATION'}</span>
                        <span className="citation-text">{cite.citation_text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groq Independent Secondary Verification Block */}
              {message.verification && (
                <div className="rag-sub-block verification-block">
                  <div className="verification-header-row">
                    <div className="block-title">
                      <Cpu size={15} className="title-icon purple-icon" />
                      <span>Groq Secondary Verification Audit</span>
                    </div>
                    {renderGroqStatusBadge(message.verification.overall_status)}
                  </div>

                  <p className="verification-summary">{message.verification.summary}</p>

                  {/* Toggle Detailed Audits */}
                  {((message.verification.claim_verifications && message.verification.claim_verifications.length > 0) ||
                    (message.verification.warnings && message.verification.warnings.length > 0)) && (
                    <button
                      className="toggle-audit-btn"
                      onClick={() => setShowVerificationDetails(!showVerificationDetails)}
                    >
                      <span>{showVerificationDetails ? 'Hide Audit Trail' : 'Inspect Audit Trail & Warnings'}</span>
                      {showVerificationDetails ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                  )}

                  {showVerificationDetails && (
                    <div className="audit-details-drawer">
                      {/* Warnings */}
                      {message.verification.warnings && message.verification.warnings.length > 0 && (
                        <div className="warnings-subcard">
                          <strong>Verification Warnings:</strong>
                          <ul>
                            {message.verification.warnings.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Claim-by-Claim Verification */}
                      {message.verification.claim_verifications && message.verification.claim_verifications.length > 0 && (
                        <div className="claim-verifications-list">
                          <strong>Claim Verification Breakdown:</strong>
                          {message.verification.claim_verifications.map((cv) => (
                            <div key={cv.claim_id} className="cv-item">
                              <div className="cv-top">
                                <span className="cv-id">{cv.claim_id}</span>
                                {renderClaimStatusBadge(cv.status)}
                              </div>
                              <p className="cv-reason">{cv.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Research Limitations & Disclaimer */}
              {((message.limitations && message.limitations.length > 0) || message.disclaimer) && (
                <div className="disclaimer-area">
                  {message.limitations && message.limitations.length > 0 && (
                    <div className="limitations-list">
                      <span className="limitations-title">Research Limitations:</span>
                      <ul>
                        {message.limitations.map((lim, idx) => (
                          <li key={idx}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.disclaimer && (
                    <p className="legal-disclaimer">{message.disclaimer}</p>
                  )}
                </div>
              )}

              {/* Referenced Evidence Attachment Chips */}
              {message.evidence && message.evidence.length > 0 && (
                <div className="evidence-attachment-bar">
                  <div className="evidence-bar-header">
                    <BookOpen size={14} className="bar-icon" />
                    <span>Referenced Legal Sources ({message.evidence.length})</span>
                  </div>

                  <div className="evidence-chip-list">
                    {message.evidence.map((ev, index) => (
                      <button
                        key={ev.chunk_id || ev.id || index}
                        className="evidence-chip"
                        onClick={() => onSelectEvidence && onSelectEvidence(ev)}
                      >
                        <ShieldCheck size={12} className="chip-shield" />
                        <span className="chip-type">{ev.document_type || 'LAW'}</span>
                        <span className="chip-title">{ev.title || `Doc #${index + 1}`}</span>
                        {ev.section_number && <span className="chip-section">Sec {ev.section_number}</span>}
                        {ev.score !== undefined && (
                          <span className="chip-score">{(ev.score * 100).toFixed(0)}% Match</span>
                        )}
                        <ChevronRight size={12} className="chip-arrow" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action bar for assistant messages */}
        {!isUser && (
          <div className="message-actions">
            <button className="action-btn" onClick={handleCopy} title="Copy Legal Answer">
              {copied ? <Check size={13} className="success-icon" /> : <Copy size={13} />}
              <span>{copied ? 'Copied Answer' : 'Copy Answer'}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .message-row {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }

        .user-row {
          flex-direction: row-reverse;
        }

        .avatar-wrapper {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .assistant-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(0, 229, 255, 0.2));
          border: 1px solid var(--border-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-gold);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
        }

        .message-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 92%;
        }

        .user-row .message-content-wrapper {
          align-items: flex-end;
          max-width: 85%;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
        }

        .sender-name {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .message-time {
          color: var(--text-muted);
        }

        .grounded-tag {
          font-size: 0.68rem;
          color: var(--accent-gold);
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }

        .message-bubble {
          border-radius: 12px;
          padding: 18px 20px;
          font-size: 0.93rem;
          line-height: 1.6;
        }

        .user-bubble {
          background-color: #1E293B;
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top-right-radius: 2px;
        }

        .user-text {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .assistant-bubble {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-top-left-radius: 2px;
          box-shadow: var(--shadow-sm);
        }

        .warning-banner {
          display: flex;
          gap: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #F87171;
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 14px;
          font-size: 0.85rem;
        }

        .warning-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .legal-heading {
          font-family: var(--font-heading);
          color: var(--accent-gold-light);
          font-size: 1.05rem;
          font-weight: 600;
          margin-top: 14px;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }

        .legal-heading:first-child {
          margin-top: 0;
        }

        .legal-paragraph {
          margin-bottom: 8px;
          color: #E2E8F0;
        }

        .legal-paragraph-spacer {
          height: 8px;
        }

        .legal-bullet-item {
          margin-left: 18px;
          margin-bottom: 6px;
          color: #CBD5E1;
        }

        .legal-bold {
          color: var(--text-primary);
          font-weight: 600;
        }

        .rag-sub-block {
          margin-top: 16px;
          padding: 14px;
          border-radius: 8px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-subtle);
        }

        .block-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .gold-icon { color: var(--accent-gold); }
        .cyan-icon { color: var(--accent-cyan); }
        .purple-icon { color: #A855F7; }

        .key-points-list {
          margin-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #E2E8F0;
          font-size: 0.88rem;
        }

        .claims-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .claim-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .claim-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .claim-type-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          background-color: var(--bg-tertiary);
          padding: 2px 6px;
          border-radius: 3px;
          text-transform: uppercase;
        }

        .claim-text {
          font-size: 0.86rem;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .mapped-evidence-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .mapped-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .chunk-ref-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 229, 255, 0.08);
          border: 1px solid rgba(0, 229, 255, 0.25);
          color: var(--accent-cyan);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .chunk-ref-btn:hover {
          background: rgba(0, 229, 255, 0.2);
          border-color: var(--accent-cyan);
        }

        .citations-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .citation-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .citation-type-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-gold);
          background: rgba(212, 175, 55, 0.1);
          padding: 2px 5px;
          border-radius: 3px;
        }

        .citation-text {
          color: var(--text-primary);
          font-weight: 500;
        }

        .verification-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }

        .verification-summary {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .toggle-audit-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: #A855F7;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          padding: 0;
        }

        .toggle-audit-btn:hover {
          text-decoration: underline;
        }

        .audit-details-drawer {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 0.8rem;
        }

        .warnings-subcard {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #FBBF24;
          padding: 8px 10px;
          border-radius: 6px;
        }

        .claim-verifications-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cv-item {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 8px 10px;
          border-radius: 6px;
        }

        .cv-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .cv-id {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .cv-reason {
          color: var(--text-secondary);
          font-size: 0.78rem;
          line-height: 1.3;
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

        .badge-supported {
          background: rgba(16, 185, 129, 0.12);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-partial {
          background: rgba(245, 158, 11, 0.12);
          color: #FBBF24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .badge-unsupported {
          background: rgba(239, 68, 68, 0.12);
          color: #F87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .badge-unverifiable {
          background: rgba(148, 163, 184, 0.12);
          color: #94A3B8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .badge-groq-verified {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .badge-groq-partial {
          background: rgba(245, 158, 11, 0.15);
          color: #FBBF24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .badge-groq-failed {
          background: rgba(239, 68, 68, 0.15);
          color: #F87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .badge-groq-unverifiable {
          background: rgba(148, 163, 184, 0.15);
          color: #94A3B8;
          border: 1px solid rgba(148, 163, 184, 0.4);
        }

        .disclaimer-area {
          margin-top: 14px;
          padding: 10px 12px;
          background: var(--bg-primary);
          border-left: 3px solid var(--accent-gold);
          border-radius: 0 6px 6px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .limitations-list {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .limitations-title {
          font-weight: 600;
          color: var(--accent-gold);
        }

        .limitations-list ul {
          margin-left: 16px;
          margin-top: 4px;
        }

        .legal-disclaimer {
          font-size: 0.74rem;
          color: var(--text-muted);
          font-style: italic;
          line-height: 1.3;
        }

        .evidence-attachment-bar {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .evidence-bar-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--accent-cyan);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bar-icon {
          color: var(--accent-cyan);
        }

        .evidence-chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .evidence-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .evidence-chip:hover {
          border-color: var(--accent-cyan);
          color: var(--text-primary);
          background-color: var(--bg-surface-hover);
        }

        .chip-shield {
          color: var(--status-success);
        }

        .chip-type {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-gold);
          background: rgba(212, 175, 55, 0.1);
          padding: 1px 4px;
          border-radius: 3px;
        }

        .chip-title {
          font-weight: 500;
        }

        .chip-section {
          color: var(--accent-cyan);
          font-size: 0.74rem;
        }

        .chip-score {
          color: var(--status-success);
          font-size: 0.72rem;
          font-weight: 600;
        }

        .chip-arrow {
          color: var(--text-muted);
        }

        .message-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .action-btn:hover {
          color: var(--text-secondary);
          background-color: var(--bg-surface);
        }

        .success-icon {
          color: var(--status-success);
        }
      `}</style>
    </div>
  );
}

