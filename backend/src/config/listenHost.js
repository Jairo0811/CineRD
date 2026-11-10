/**
 * Desarrollo: escuchar solo en loopback para no exponer cuentas y SQL en LAN.
 * Producción/contendedores: interfaz de red configurable para healthcheck.
 * HOST explícito siempre tiene prioridad (incluyendo pruebas desde móvil).
 */
const resolveListenHost = (env = process.env) =>
  env.HOST || (env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

module.exports = { resolveListenHost };
