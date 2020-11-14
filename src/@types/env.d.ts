declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV?: string;
    CHECK_INTERVAL: number;
    MIN_SLEEP_INTERVAL: number;
    MAX_SLEEP_INTERVAL: number;
    DEFAULT_DDI: number;
    APP_WEB_URL?: string;
    APP_SECRET?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_NAME?: string;
    DB_USER?: string;
    DB_PASS?: string;
  }
}
