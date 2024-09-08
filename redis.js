import { createClient } from "@redis/client";

export const getRedisClient = async () => {
  const client = createClient({
    url: "redis://default:kbfbEOsotLmdeAOAmJstkvVJOZCgkHpI@junction.proxy.rlwy.net:13528",
  });

  client.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  await client.connect();
  return client;
};
