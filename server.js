const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/api/words", (req, res) => {
  const dataPath = path.join(__dirname, "data", "words.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
