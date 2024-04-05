declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "dev" | "test";
      ENDURANCE_AL_URL: string;
      ENDURANCE_CF_URL: string;
      TELEGRAM_BOT_TOKEN: string;
      TELEGRAM_USER_CHAT_ID: string;
    }
  }
}

export {};
