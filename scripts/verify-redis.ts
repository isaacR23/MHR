import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error("❌ Faltan UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN en .env");
  process.exit(1);
}

const redis = new Redis({ url, token });

async function verify() {
  try {
    const pong = await redis.ping();
    if (pong === "PONG") {
      console.log("✅ Conexión a Redis exitosa");
    } else {
      console.error("❌ Respuesta inesperada:", pong);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Error de conexión:", err);
    process.exit(1);
  }
}

verify();
