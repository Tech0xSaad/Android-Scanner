const PERMISSION_DEFINITIONS = {
  'android.permission.INTERNET': {
    description: 'Allows the app to open network connections and transmit data externally.',
    category: 'Normal',
  },
  'android.permission.CAMERA': {
    description: 'Allows the app to capture photos and access the device camera feed.',
    category: 'Dangerous',
  },
  'android.permission.ACCESS_FINE_LOCATION': {
    description: 'Allows the app to access precise GPS-based location.',
    category: 'Dangerous',
  },
  'android.permission.ACCESS_COARSE_LOCATION': {
    description: 'Allows the app to access approximate location derived from network signals.',
    category: 'Dangerous',
  },
  'android.permission.READ_CONTACTS': {
    description: 'Allows the app to read stored contacts on the device.',
    category: 'Critical',
  },
  'android.permission.WRITE_CONTACTS': {
    description: 'Allows the app to modify or add contacts on the device.',
    category: 'Critical',
  },
  'android.permission.GET_ACCOUNTS': {
    description: 'Allows the app to access the list of accounts stored on the device.',
    category: 'Critical',
  },
  'android.permission.RECORD_AUDIO': {
    description: 'Allows the app to capture audio through the microphone.',
    category: 'Critical',
  },
  'android.permission.READ_EXTERNAL_STORAGE': {
    description: 'Allows the app to read shared storage files on the device.',
    category: 'Dangerous',
  },
  'android.permission.WRITE_EXTERNAL_STORAGE': {
    description: 'Allows the app to write data to shared device storage.',
    category: 'Dangerous',
  },
  'android.permission.READ_MEDIA_IMAGES': {
    description: 'Allows the app to read image media from shared storage.',
    category: 'Dangerous',
  },
  'android.permission.READ_MEDIA_VIDEO': {
    description: 'Allows the app to read video media from shared storage.',
    category: 'Dangerous',
  },
  'android.permission.READ_MEDIA_AUDIO': {
    description: 'Allows the app to read audio media from shared storage.',
    category: 'Dangerous',
  },
  'android.permission.ACCESS_BACKGROUND_LOCATION': {
    description: 'Allows the app to access location while running in the background.',
    category: 'Critical',
  },
  'android.permission.READ_PHONE_STATE': {
    description: 'Allows the app to read phone status, call state, and device identifiers.',
    category: 'Dangerous',
  },
  'android.permission.POST_NOTIFICATIONS': {
    description: 'Allows the app to display notifications to the user.',
    category: 'Normal',
  },
  'android.permission.BLUETOOTH_CONNECT': {
    description: 'Allows the app to connect to paired Bluetooth devices.',
    category: 'Normal',
  },
  'android.permission.BLUETOOTH_SCAN': {
    description: 'Allows the app to discover nearby Bluetooth devices.',
    category: 'Dangerous',
  },
};

const CATEGORY_RISK_LABEL = {
  Normal: 'Low',
  Dangerous: 'Medium',
  Critical: 'High',
};

const FALLBACK_PATTERNS = [
  { match: /CONTACT/i, category: 'Critical', description: 'Allows the app to access or modify contact information.' },
  { match: /LOCATION/i, category: 'Dangerous', description: 'Allows the app to access the device location.' },
  { match: /CAMERA/i, category: 'Dangerous', description: 'Allows the app to access the device camera.' },
  { match: /AUDIO|MICROPHONE|RECORD/i, category: 'Critical', description: 'Allows the app to capture audio from the device.' },
  { match: /STORAGE|MEDIA/i, category: 'Dangerous', description: 'Allows the app to access shared storage or media files.' },
  { match: /INTERNET|NETWORK/i, category: 'Normal', description: 'Allows the app to use network connectivity.' },
];

const getPermissionDefinition = (permissionName) => {
  if (PERMISSION_DEFINITIONS[permissionName]) {
    return PERMISSION_DEFINITIONS[permissionName];
  }

  const shortName = permissionName.split('.').pop() ?? permissionName;
  const patternMatch = FALLBACK_PATTERNS.find(({ match }) => match.test(shortName));

  return (
    patternMatch ?? {
      category: 'Normal',
      description: 'No detailed description is available for this permission yet.',
    }
  );
};

export const buildPermissionRecords = (permissions) =>
  [...new Set(permissions)].map((permission) => {
    const definition = getPermissionDefinition(permission);
    const shortName = permission.split('.').pop() ?? permission;

    return {
      name: permission,
      shortName,
      description: definition.description,
      category: definition.category,
      riskLabel: CATEGORY_RISK_LABEL[definition.category] ?? 'Low',
    };
  });

export const getPermissionSummary = (permissions) =>
  permissions.reduce(
    (summary, permission) => ({
      normal: summary.normal + Number(permission.category === 'Normal'),
      dangerous: summary.dangerous + Number(permission.category === 'Dangerous'),
      critical: summary.critical + Number(permission.category === 'Critical'),
    }),
    { normal: 0, dangerous: 0, critical: 0 },
  );