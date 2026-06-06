import { AlertTriangle, Shield, ShieldAlert } from 'lucide-react';

const badgeMap = {
  Low: { icon: Shield, className: 'badge-low' },
  Medium: { icon: AlertTriangle, className: 'badge-medium' },
  High: { icon: ShieldAlert, className: 'badge-high' },
};

export default function RiskBadge({ label }) {
  const config = badgeMap[label] ?? badgeMap.Low;
  const Icon = config.icon;

  return (
    <span className={`risk-badge ${config.className}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}