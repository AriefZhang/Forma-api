import { INestApplication, ValidationPipe } from "@nestjs/common";
export function configureApp(
  app: INestApplication,
  origin: string | RegExp | (string | RegExp)[] = (
    process.env.WEB_ORIGIN || "http://localhost:8083,http://127.0.0.1:8083"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
) {
  app.enableCors({
    origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
    optionsSuccessStatus: 204,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
}
