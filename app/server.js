const express = require("express");
const app = express();

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/version", (req, res) => res.json({ version: process.env.APP_VERSION || "dev" }));

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`listening on ${port}`));
}