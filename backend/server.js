// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// --- Routes ---

// GET alle woorden
app.get("/api/words", (req, res) => {
  db.query("SELECT * FROM words", (err, results) => {
    if (err) return res.status(500).json(err);
    const data = results.map((row) => ({
      ...row,
      description: Array.isArray(row.description)
        ? row.description
        : JSON.parse(row.description || "[]"),
    }));
    res.json(data);
  });
});

// POST nieuw woord
app.post("/api/words", (req, res) => {
  const { word, description } = req.body;
  const descJSON = JSON.stringify(description);
  db.query(
    "INSERT INTO words (word, description) VALUES (?, ?)",
    [word, descJSON],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json({ id: results.insertId, word, description });
    }
  );
});

// DELETE woord
app.delete("/api/words/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM words WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// PUT update woord
app.put("/api/words/:id", (req, res) => {
  const id = req.params.id;
  const { word, description } = req.body;
  const descJSON = JSON.stringify(description);
  db.query(
    "UPDATE words SET word = ?, description = ? WHERE id = ?",
    [word, descJSON, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated" });
    }
  );
});

// --- Server starten ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
