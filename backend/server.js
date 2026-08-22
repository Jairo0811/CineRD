require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor CineRD ejecutándose en http://${HOST}:${PORT}`);
});
