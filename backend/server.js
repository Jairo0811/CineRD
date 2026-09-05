require("dotenv").config();

const { ensureStorageLayout } = require("./src/config/storage");
ensureStorageLayout();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(JSON.stringify({ level: "info", event: "server.started", host: HOST, port: Number(PORT) }));
});
