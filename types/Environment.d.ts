namespace NodeJS {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    ANALYZE: boolean;
    Debug_HOST: string;
    API_HOST: string;
    SECRET: string;
    DATABASE_URL: string;
    DBName: string;
    DBPass: string;
  }
}