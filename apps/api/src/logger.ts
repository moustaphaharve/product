import pino from "pino";

const dev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (dev ? "debug" : "info"),
  transport: dev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "HH:MM:ss.l",
        },
      }
    : undefined,
  redact: ["req.headers.authorization", "req.headers.cookie"],
});
