import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.discussionsexegetica.app',
  appName: 'Discussions Exegetica',
  webDir: 'dist',
  // When true, loads from the live server instead of bundled files
  // Set to false for store builds — updates flow through the web automatically
  server: {
    // Production: loads live site so updates are instant without store resubmission
    url: 'https://discussionsexegetica.com',
    cleartext: false,
    // Allow navigation within the app domain
    allowNavigation: [
      'discussionsexegetica.com',
      '*.discussionsexegetica.com',
      'images.unsplash.com',
      'api.livekit.io',
      '*.livekit.io',
      'www.stepbible.org',
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0f1e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0f1e',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
  },
  android: {
    backgroundColor: '#0a0f1e',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    backgroundColor: '#0a0f1e',
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
};

export default config;
