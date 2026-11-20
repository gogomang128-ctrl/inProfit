import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.inprofit.app",
  appName: "inProfit",
  webDir: "dist",
  bundledWebRuntime: false,
  android: {
    useLegacyBridge: true,
  },
};

export default config;
