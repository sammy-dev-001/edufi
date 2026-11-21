const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Config plugin to fix the manifest merger conflict with react-native-android-notification-listener.
 * That library declares android:allowBackup="false" which conflicts with our android:allowBackup="true".
 * Adding tools:replace="android:allowBackup" tells the merger to use our value.
 */
const withAllowBackupFix = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication?.$) {
      mainApplication.$['tools:replace'] =
        (mainApplication.$['tools:replace']
          ? mainApplication.$['tools:replace'] + ',android:allowBackup'
          : 'android:allowBackup');
      // Ensure tools namespace is declared on the manifest root
      config.modResults.manifest.$['xmlns:tools'] =
        'http://schemas.android.com/tools';
    }
    return config;
  });
};

// Correctly use dynamic config injection
module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...(config.android?.config || {}),
        googleMaps: {
          apiKey:
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
            config.android?.config?.googleMaps?.apiKey ||
            "AIzaSyCddkAGYOB5Rtnrf8zXNZee7HlJBaVR2bc"
        }
      }
    },
    plugins: [
      ...(config.plugins || []),
      'expo-video',
      withAllowBackupFix,
    ],
  };
};
