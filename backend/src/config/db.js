require("dotenv").config();

const sql = require("mssql");

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

const requiredVariables = ["DB_USER", "DB_PASSWORD", "DB_SERVER", "DB_DATABASE"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno de SQL Server: ${missingVariables.join(", ")}`
  );
}

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: parseBoolean(process.env.DB_ENCRYPT, true),
    trustServerCertificate: parseBoolean(process.env.DB_TRUST_CERT, false),
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX || 10),
    min: 0,
    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS || 30000),
  },
  connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 15000),
  requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT_MS || 30000),
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Conectado a SQL Server correctamente");
    return pool;
  })
  .catch((error) => {
    console.error("Error al conectar con SQL Server:", error.message);
    throw error;
  });

module.exports = {
  sql,
  poolPromise,
};
