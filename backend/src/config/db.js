/**
 * db.js — Neon PostgreSQL Connection Pool
 * =========================================
 * Creates and exports a shared connection pool using the `pg` library.
 *
 * Why a Pool instead of a single Client?
 *  A pool manages multiple connections simultaneously, which dramatically
 *  improves performance under concurrent request load.
 *
 * Why do we parse the connection string manually?
 *  The Neon connection string includes `sslmode=require&channel_binding=require`.
 *  In pg v8+, those URL params conflict with the explicit `ssl` config object.
 *  We strip the SSL-related query params from the URL and pass the SSL
 *  settings directly to the Pool config to avoid this conflict.
 */

const { Pool } = require("pg");

/**
 * buildPoolConfig — Parses the DATABASE_URL and constructs a clean Pool config.
 * Strips `sslmode` and `channel_binding` query params to avoid pg warnings,
 * then manually applies the correct SSL settings for Neon's pooler endpoint.
 *
 * @returns {Object} A valid pg Pool configuration object
 */
const buildPoolConfig = () => {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set in the environment variables.");
  }

  // Parse the URL so we can modify its query string
  const url = new URL(rawUrl);

  // Remove SSL-related params that cause pg driver conflicts/warnings.
  // We'll apply SSL settings directly in the Pool config instead.
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");

  return {
    connectionString: url.toString(),

    // Explicit SSL configuration for Neon cloud connections:
    // `rejectUnauthorized: false` is required because Neon's connection
    // pooler presents a certificate that doesn't match the host name.
    // The connection is still fully encrypted (TLS in transit).
    ssl: {
      rejectUnauthorized: false,
    },

    max: 10,                    // Maximum number of pooled connections
    idleTimeoutMillis: 30_000,  // Release idle connections after 30 seconds
    connectionTimeoutMillis: 10_000, // Fail fast if connection takes > 10s
  };
};

// Create the shared pool — this is reused across the entire application lifetime
const pool = new Pool(buildPoolConfig());

/**
 * pool.on("error") — Handles unexpected errors on idle pool clients.
 * Without this listener, an error on an idle client would crash the Node process.
 */
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL pool error:", err.message);
});

/**
 * testConnection — Verifies the pool can reach Neon at startup.
 * Throws on failure so server.js can catch it and exit with a non-zero code.
 */
const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    console.log(
      `✅ Neon PostgreSQL connected: ${result.rows[0].current_time}`
    );
  } catch (error) {
    console.error("❌ Neon PostgreSQL connection failed:", error.message);
    throw error; // Let server.js handle the exit
  }
};

module.exports = { pool, testConnection };
