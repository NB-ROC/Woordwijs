import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "woordwijs",
});

db.connect((err) => {
  if (err) console.error("Database connectie mislukt:", err);
  else console.log("Verbonden met MySQL!");
});

// --- Controllers ---

// GET all words
app.get("/api/words", (req, res) => {
  db.query("SELECT * FROM words", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// POST new word
app.post("/api/words", (req, res) => {
  const { word, description } = req.body;
  if (!word || !description || !Array.isArray(description)) {
    return res.status(400).json({ error: "Ongeldige data" });
  }

  db.query(
    "INSERT INTO words (word, description) VALUES (?, ?)",
    [word, JSON.stringify(description)],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, word, description });
    }
  );
});

// DELETE a word
app.delete("/api/words/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM words WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// PUT / update a word
app.put("/api/words/:id", (req, res) => {
  const { id } = req.params;
  const { word, description } = req.body;

  if (!word && !description) {
    return res.status(400).json({ error: "Geen data om te updaten" });
  }

  let updates = [];
  let params = [];

  if (word) {
    updates.push("word = ?");
    params.push(word);
  }
  if (description) {
    updates.push("description = ?");
    params.push(JSON.stringify(description));
  }

  params.push(id);

  const sql = `UPDATE words SET ${updates.join(", ")} WHERE id = ?`;

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server draait op http://localhost:${PORT}`)
);
