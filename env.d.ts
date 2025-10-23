/// <reference types="vite/client" />
/// <reference types="@react-router/node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REDIS_URL?: string;
    }
  }
}
