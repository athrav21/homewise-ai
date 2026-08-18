import React from 'react';
import { Sparkles, Bot, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AiInsightCard({ aiInsight, onRegenerate }) {
  const { summary, verdict, caveat, generatedAt } = aiInsight;

  return (
    <div className="ai-insight-card">
      <div className="ai-card-header">
        <div className="ai-brand-badge">
          <Bot size={20} className="ai-icon" />
          <h3 className="ai-title">AI Neighborhood Insight</h3>
          <span className="prototype-ai-badge">Prototype AI Insight</span>
        </div>

        <div className="ai-header-right">
          <span className="timestamp-text">Generated at {generatedAt}</span>
          {onRegenerate && (
            <button className="btn-icon-xs" onClick={onRegenerate} title="Recalculate AI Summary">
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="ai-body">
        <p className="ai-summary-text">{summary}</p>

        <div className="ai-insights-grid">
          <div className="ai-verdict-box">
            <div className="verdict-header">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>AI Recommendation</span>
            </div>
            <p className="verdict-text">{verdict}</p>
          </div>

          <div className="ai-caveat-box">
            <div className="caveat-header">
              <AlertTriangle size={16} className="text-amber" />
              <span>Buyer Due Diligence Checklist</span>
            </div>
            <p className="caveat-text">{caveat}</p>
          </div>
        </div>
      </div>

      <div className="ai-footer-disclaimer">
        <Sparkles size={14} />
        <span>
          Note: This synthesis is dynamically generated for the Review 2 prototype. Production versions will connect to real-time municipal APIs and LLM inference endpoints.
        </span>
      </div>
    </div>
  );
}
