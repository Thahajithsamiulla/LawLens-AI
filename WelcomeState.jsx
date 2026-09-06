import React from 'react';
import { Scale, Sparkles, BookOpen, ShieldCheck, ArrowRight, Gavel, Cpu, CheckCircle } from 'lucide-react';
import { EXAMPLE_QUESTIONS } from '../data/mockData';

export default function WelcomeState({ onSelectExample }) {
  return (
    <div className="welcome-container animate-fade-in">
      <div className="welcome-hero">
        <div className="hero-icon-container">
          <Scale size={32} className="hero-icon" />
        </div>
        
        <h2 className="welcome-title">
          LawLens AI — <span className="title-gradient">AI-assisted Indian Legal Research</span>
        </h2>
        
        <p className="welcome-description">
          Ask a legal research question and LawLens AI will retrieve relevant Indian legal sources, 
          generate an evidence-grounded analysis, map claims to sources, and independently verify the result.
        </p>

        {/* Workflow Pipeline Display */}
        <div className="workflow-pipeline">
          <div className="step-chip"><BookOpen size={13} /> 1. Retrieve</div>
          <ArrowRight size={12} className="step-arrow" />
          <div className="step-chip"><Sparkles size={13} /> 2. Reason</div>
          <ArrowRight size={12} className="step-arrow" />
          <div className="step-chip"><Gavel size={13} /> 3. Cite</div>
          <ArrowRight size={12} className="step-arrow" />
          <div className="step-chip"><Cpu size={13} /> 4. Verify</div>
        </div>

        <div className="trust-badges">
          <div className="trust-item">
            <ShieldCheck size={14} className="trust-icon" />
            <span>Atlas Vector Grounding</span>
          </div>
          <div className="trust-item">
            <BookOpen size={14} className="trust-icon" />
            <span>Statutory Acts & Precedents</span>
          </div>
          <div className="trust-item">
            <Gavel size={14} className="trust-icon" />
            <span>Groq Dual Model Audit</span>
          </div>
        </div>
      </div>

      {/* Static Example Research Questions */}
      <div className="examples-section">
        <div className="examples-header">
          <Sparkles size={16} className="sparkles-icon" />
          <span>Example Research Questions</span>
        </div>

        <div className="examples-grid">
          {EXAMPLE_QUESTIONS.map((item) => (
            <button
              key={item.id}
              className="example-card"
              onClick={() => onSelectExample(item.query)}
            >
              <div className="card-top">
                <span className="category-pill">{item.category}</span>
                <ArrowRight size={14} className="card-arrow" />
              </div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-query">"{item.query}"</p>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .welcome-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 36px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
          text-align: center;
        }

        .welcome-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .hero-icon-container {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(0, 229, 255, 0.15));
          border: 1px solid var(--border-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-gold);
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.2);
        }

        .welcome-title {
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .title-gradient {
          background: linear-gradient(135deg, var(--accent-gold-light), var(--accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-description {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 620px;
          line-height: 1.6;
        }

        .workflow-pipeline {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 4px;
        }

        .step-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border-accent);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-gold);
        }

        .step-arrow {
          color: var(--text-muted);
        }

        .trust-badges {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 8px;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .trust-icon {
          color: var(--accent-cyan);
        }

        .examples-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .examples-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sparkles-icon {
          color: var(--accent-gold);
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
        }

        .example-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 18px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .example-card:hover {
          background-color: var(--bg-surface-hover);
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .category-pill {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-arrow {
          color: var(--text-muted);
          transition: transform 0.2s, color 0.2s;
        }

        .example-card:hover .card-arrow {
          transform: translateX(3px);
          color: var(--accent-gold);
        }

        .card-title {
          font-size: 0.98rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .card-query {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .examples-grid {
            grid-template-columns: 1fr;
          }

          .welcome-title {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </div>
  );
}
