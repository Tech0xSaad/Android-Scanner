const SCORE_MAP = [
  { aliases: ['INTERNET'], points: 1 },
  { aliases: ['CAMERA'], points: 3 },
  { aliases: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION'], points: 3 },
  { aliases: ['READ_CONTACTS', 'WRITE_CONTACTS', 'GET_ACCOUNTS'], points: 4 },
  { aliases: ['RECORD_AUDIO'], points: 4 },
];

const RISKY_COMBINATIONS = [
  {
    key: 'camera-internet',
    title: 'CAMERA + INTERNET',
    requires: ['CAMERA', 'INTERNET'],
    description: 'Camera access combined with network access could enable image capture and remote transmission.',
  },
  {
    key: 'contacts-internet',
    title: 'CONTACTS + INTERNET',
    requires: ['CONTACTS', 'INTERNET'],
    description: 'Contact access plus internet permission could allow address book data to be uploaded externally.',
  },
  {
    key: 'location-storage',
    title: 'LOCATION + STORAGE',
    requires: ['LOCATION', 'STORAGE'],
    description: 'Location access with storage permissions may allow tracking data to be retained or exported.',
  },
];

const matchesAlias = (shortName, alias) => {
  if (alias === 'CONTACTS') {
    return /CONTACT/i.test(shortName);
  }

  if (alias === 'LOCATION') {
    return /LOCATION/i.test(shortName);
  }

  if (alias === 'STORAGE') {
    return /STORAGE|MEDIA/i.test(shortName);
  }

  if (alias === 'MICROPHONE') {
    return /RECORD_AUDIO|MICROPHONE/i.test(shortName);
  }

  return shortName === alias;
};

const getTotalRiskPoints = (permissions) =>
  permissions.reduce((total, permission) => {
    const entry = SCORE_MAP.find(({ aliases }) =>
      aliases.some((alias) => matchesAlias(permission.shortName, alias)),
    );

    return total + (entry?.points ?? 0);
  }, 0);

const getTriggeredCombinations = (permissions) => {
  const shortNames = permissions.map((permission) => permission.shortName);

  return RISKY_COMBINATIONS.filter((combination) =>
    combination.requires.every((required) =>
      shortNames.some((shortName) => matchesAlias(shortName, required)),
    ),
  );
};

const toPrivacyScore = (totalPoints, combinationCount) => {
  const rawScore = 100 - totalPoints * 8 - combinationCount * 10;
  return Math.max(0, Math.min(100, rawScore));
};

const getRiskLabel = (privacyScore) => {
  if (privacyScore >= 70) {
    return 'Low';
  }

  if (privacyScore >= 35) {
    return 'Medium';
  }

  return 'High';
};

export const calculatePrivacyScore = (permissions) => {
  const totalPoints = getTotalRiskPoints(permissions);
  const triggeredCombinations = getTriggeredCombinations(permissions);
  const privacyScore = toPrivacyScore(totalPoints, triggeredCombinations.length);
  const riskLabel = getRiskLabel(privacyScore);

  return {
    totalPoints,
    triggeredCombinations,
    privacyScore,
    riskLabel,
  };
};