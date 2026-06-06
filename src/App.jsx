import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Moon,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  SunMedium,
} from 'lucide-react';
import FileUploader from './components/FileUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ScanResults from './components/ScanResults';
import { buildPermissionRecords, getPermissionSummary } from './utils/permissionData';
import { calculatePrivacyScore } from './utils/riskEngine';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

const normalizePermissions = (rawPermissions) => {
  if (!rawPermissions) {
    return [];
  }

  if (Array.isArray(rawPermissions)) {
    return rawPermissions;
  }

  if (typeof rawPermissions === 'object') {
    return Object.values(rawPermissions).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    );
  }

  return [rawPermissions];
};

const pickFirstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeIcon = (iconValue) => {
  if (!iconValue || typeof iconValue !== 'string') {
    return '';
  }

  if (iconValue.startsWith('data:image') || iconValue.startsWith('blob:') || iconValue.startsWith('http')) {
    return iconValue;
  }

  return `data:image/png;base64,${iconValue}`;
};

const extractAppDetails = (result, file) => {
  const manifest = result?.manifest ?? result?.data?.manifest ?? {};
  const permissions = normalizePermissions(
    pickFirstValue(
      manifest?.usesPermissions,
      manifest?.permissions,
      result?.permissions,
      result?.usesPermissions,
    ),
  )
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }

      return pickFirstValue(
        entry?.name,
        entry?.permission,
        entry?.['android:name'],
        entry?.attrs?.['android:name'],
      );
    })
    .filter(Boolean);

  const appName = pickFirstValue(
    result?.label,
    result?.appName,
    manifest?.application?.label,
    manifest?.label,
    file.name.replace(/\.apk$/i, ''),
  );

  const version = pickFirstValue(
    result?.versionName,
    result?.version,
    manifest?.versionName,
    manifest?.['android:versionName'],
    'Unknown',
  );

  const packageName = pickFirstValue(result?.package, result?.packageName, manifest?.package, 'Unknown');

  const icon = pickFirstValue(
    result?.icon,
    result?.icons?.[0],
    manifest?.application?.icon,
    '',
  );

  return {
    name: appName,
    version,
    packageName,
    icon: normalizeIcon(icon),
    permissions,
    fileName: file.name,
    fileSize: file.size,
  };
};

export default function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const [scanState, setScanState] = useState({
    loading: false,
    error: '',
    app: null,
    analysis: null,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('apk-privacy-theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleFileSelect = async (file) => {
    if (!file) {
      return;
    }

    const isApk = file.name.toLowerCase().endsWith('.apk') || file.type === 'application/vnd.android.package-archive';
    if (!isApk) {
      setScanState({
        loading: false,
        error: 'Invalid file type. Please upload a valid .apk file.',
        app: null,
        analysis: null,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setScanState({
        loading: false,
        error: 'Large file detected. APK files over 50MB are not supported.',
        app: null,
        analysis: null,
      });
      return;
    }

    if (!window.AppInfoParser) {
      setScanState({
        loading: false,
        error: 'APK parser failed to load. Please check your network connection and refresh the page.',
        app: null,
        analysis: null,
      });
      return;
    }

    setScanState({
      loading: true,
      error: '',
      app: null,
      analysis: null,
    });

    try {
      const parser = new window.AppInfoParser(file);
      const rawResult = await parser.parse();
      const app = extractAppDetails(rawResult, file);
      const permissionRecords = buildPermissionRecords(app.permissions);
      const analysis = calculatePrivacyScore(permissionRecords);

      setScanState({
        loading: false,
        error: '',
        app,
        analysis: {
          ...analysis,
          permissionSummary: getPermissionSummary(permissionRecords),
          permissionRecords,
        },
      });
    } catch (error) {
      setScanState({
        loading: false,
        error:
          error instanceof Error
            ? `Parsing failure: ${error.message}`
            : 'Parsing failure. The APK could not be analyzed in the browser.',
        app: null,
        analysis: null,
      });
    }
  };

  const stats = useMemo(() => {
    if (!scanState.analysis) {
      return [
        { label: 'Permissions', value: '0' },
        { label: 'Critical Flags', value: '0' },
        { label: 'Risk Score', value: '0/100' },
      ];
    }

    return [
      { label: 'Permissions', value: String(scanState.analysis.permissionRecords.length) },
      { label: 'Critical Flags', value: String(scanState.analysis.permissionSummary.critical) },
      { label: 'Risk Score', value: `${scanState.analysis.privacyScore}/100` },
    ];
  }, [scanState.analysis]);

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-primary" />
      <div className="bg-orb bg-orb-secondary" />

      <motion.header className="hero-card glass" {...pageMotion}>
        <div>
          <div className="eyebrow">
            <ScanSearch size={16} />
            Static APK privacy scanner
          </div>
          <h1>APK Privacy Analyzer</h1>
          <p className="hero-copy">
            Upload an Android APK to inspect permissions, spot risky permission combinations,
            and estimate a privacy score directly in the browser.
          </p>
        </div>

        <button className="theme-toggle" type="button" onClick={handleThemeToggle}>
          {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </motion.header>

      <motion.section className="stats-grid" {...pageMotion} transition={{ delay: 0.05, duration: 0.45 }}>
        {stats.map((item) => (
          <div key={item.label} className="glass stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </motion.section>

      <motion.main className="content-grid" {...pageMotion} transition={{ delay: 0.1, duration: 0.45 }}>
        <section className="glass panel uploader-panel">
          <div className="panel-heading">
            <div>
              <h2>Upload APK</h2>
              <p>Drag and drop an APK file or browse locally. Analysis happens entirely in your browser.</p>
            </div>
            <ShieldCheck size={20} />
          </div>
          <FileUploader onFileSelect={handleFileSelect} isLoading={scanState.loading} />

          <div className="notice-grid">
            <div className="notice-card">
              <ShieldAlert size={18} />
              <span>No backend or server APIs are used.</span>
            </div>
            <div className="notice-card">
              <AlertTriangle size={18} />
              <span>This tool performs static analysis only and cannot detect runtime malware.</span>
            </div>
          </div>
        </section>

        <section className="glass panel results-panel">
          <div className="panel-heading">
            <div>
              <h2>Privacy Dashboard</h2>
              <p>App metadata, permission categories, risk labels, and suspicious combinations.</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {scanState.loading ? (
              <motion.div
                key="loading"
                className="state-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <LoadingSpinner />
                <p>Parsing APK package, manifest, and permission metadata...</p>
              </motion.div>
            ) : null}

            {!scanState.loading && scanState.error ? (
              <motion.div
                key="error"
                className="state-card error-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertTriangle size={24} />
                <div>
                  <h3>Analysis unavailable</h3>
                  <p>{scanState.error}</p>
                </div>
              </motion.div>
            ) : null}

            {!scanState.loading && !scanState.error && scanState.app && scanState.analysis ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <ScanResults app={scanState.app} analysis={scanState.analysis} />
              </motion.div>
            ) : null}

            {!scanState.loading && !scanState.error && !scanState.app ? (
              <motion.div
                key="empty"
                className="state-card empty-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScanSearch size={28} />
                <div>
                  <h3>Ready to inspect an APK</h3>
                  <p>Once an APK is uploaded, the dashboard will populate with app details and privacy insights.</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </motion.main>
    </div>
  );
}