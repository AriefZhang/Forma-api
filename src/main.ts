import { NestFactory } from "@nestjs/core"
import "dotenv/config"
import "reflect-metadata"
import { AppModule } from "./app.module"
import { configureApp } from "./config/configure-app"
import { DatabaseService } from "./database/database.service"
import { Logger, NestApplicationOptions } from "@nestjs/common"

const corsOptions: NestApplicationOptions = {
  rawBody: true,
}

async function bootstrap() {
  const logger = new Logger()

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL wajib diisi")
  const app = await NestFactory.create(AppModule, corsOptions)
  configureApp(app)
  await app.get(DatabaseService).initialize()
  await app.listen(Number(process.env.PORT || 3000), "0.0.0.0")
  logger.log(`This application is running on: ${await app.getUrl()}`)
}

if (require.main === module)
  bootstrap().catch((error) => {
    console.error(error)
    process.exit(1)
  })
