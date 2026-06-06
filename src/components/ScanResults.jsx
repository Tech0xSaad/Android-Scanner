import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AppWindow,
  BadgeInfo,
  FileDigit,
  Globe,
  Package,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import RiskBadge from './RiskBadge';

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

const formatBytes = (size) => `${(size / (1024 * 1024)).toFixed(2)} MB`;

export default function ScanResults({ app, analysis }) {
  return (
    <div className="results-stack">
      <motion.section className="app-summary glass-subtle" {...cardMotion}>
        <div className="app-summary-header">
          <div className="app-icon-wrap">
            {app.icon ? (
              <img src={app.icon} alt={`${app.name} icon`} className="app-icon" />
            ) : (
              <div className="app-icon fallback-icon">
                <AppWindow size={30} />
              </div>
            )}
          </div>

          <div>
            <h3>{app.name}</h3>
            <p>{app.packageName}</p>
          </div>

          <div className="score-ring-wrap">
            <div
              className="score-ring"
              style={{
                background: `conic-gradient(var(--accent-strong) ${analysis.privacyScore * 3.6}deg, transparent 0deg)`,
              }}
            >
              <div>
                <strong>{analysis.privacyScore}</strong>
                <span>Privacy Score</span>
              </div>
            </div>
          </div>
        </div>

        <div className="meta-grid">
          <div className="meta-card">
            <BadgeInfo size={16} />
            <div>
              <span>Version</span>
              <strong>{app.version}</strong>
            </div>
          </div>
          <div className="meta-card">
            <Package size={16} />
            <div>
              <span>File name</span>
              <strong>{app.fileName}</strong>
            </div>
          </div>
          <div className="meta-card">
            <FileDigit size={16} />
            <div>
              <span>File size</span>
              <strong>{formatBytes(app.fileSize)}</strong>
            </div>
          </div>
          <div className="meta-card">
            <ShieldCheck size={16} />
            <div>
              <span>Overall Risk</span>
              <strong>{analysis.riskLabel}</strong>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="analysis-grid">
        <motion.section className="glass-subtle section-card" {...cardMotion} transition={{ delay: 0.05, duration: 0.35 }}>
          <div className="section-heading">
            <h3>Permission Breakdown</h3>
            <p>
              {analysis.permissionRecords.length} detected permission
              {analysis.permissionRecords.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="category-pills">
            <span className="pill pill-normal">Normal: {analysis.permissionSummary.normal}</span>
            <span className="pill pill-dangerous">Dangerous: {analysis.permissionSummary.dangerous}</span>
            <span className="pill pill-critical">Critical: {analysis.permissionSummary.critical}</span>
          </div>

          <div className="permission-list">
            {analysis.permissionRecords.length > 0 ? (
              analysis.permissionRecords.map((permission) => (
                <div key={permission.name} className="permission-card">
                  <div className="permission-card-top">
                    <div>
                      <h4>{permission.shortName}</h4>
                      <p>{permission.name}</p>
                    </div>
                    <div className="permission-risk">
                      <span className={`category-chip category-${permission.category.toLowerCase()}`}>
                        {permission.category}
                      </span>
                      <RiskBadge label={permission.riskLabel} />
                    </div>
                  </div>
                  <p className="permission-description">{permission.description}</p>
                </div>
              ))
            ) : (
              <div className="combination-empty">
                <ShieldCheck size={18} />
                <span>No manifest permissions were extracted from this APK.</span>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section className="glass-subtle section-card" {...cardMotion} transition={{ delay: 0.1, duration: 0.35 }}>
          <div className="section-heading">
            <h3>Risk Signals</h3>
            <p>Scores and combinations based on static permission analysis.</p>
          </div>

          <div className="risk-summary-card">
            <div>
              <span>Total risk points</span>
              <strong>{analysis.totalPoints}</strong>
            </div>
            <RiskBadge label={analysis.riskLabel} />
          </div>

          <div className="combination-block">
            <div className="combination-title">
              <TriangleAlert size={18} />
              <h4>Risky combinations</h4>
            </div>

            {analysis.triggeredCombinations.length > 0 ? (
              <div className="combination-list">
                {analysis.triggeredCombinations.map((combo) => (
                  <div key={combo.key} className="combination-card">
                    <strong>{combo.title}</strong>
                    <p>{combo.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="combination-empty">
                <ShieldCheck size={18} />
                <span>No flagged permission combinations were detected.</span>
              </div>
            )}
          </div>

          <div className="legend-list">
            <div className="legend-item">
              <Globe size={16} />
              <span>Risk label thresholds: Low under 35, Medium under 70, High at 70 or above.</span>
            </div>
            <div className="legend-item">
              <AlertTriangle size={16} />
              <span>This tool performs static analysis only and cannot detect runtime malware.</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}