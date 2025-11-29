import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.cuddles',
  appName: 'cuddles-smart-budtender-ai',
  webDir: 'dist',
  server: {
    url: 'https://16082a8c-a109-49a8-a05d-987a18f90c7d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
