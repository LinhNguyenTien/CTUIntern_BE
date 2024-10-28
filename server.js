const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the database connection
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Create (POST)
app.post('/items', (req, res) => {
  const { name, description } = req.body;
  const sql = 'INSERT INTO items (name, description) VALUES (?, ?)';
  db.query(sql, [name, description], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ id: result.insertId, name, description });
  });
});

// Read (GET)
app.get('/items', (req, res) => {
  const sql = 'SELECT * FROM items';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(results);
  });
});

// Update (PUT)
app.put('/items/:id', (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE items SET name = ?, description = ? WHERE id = ?';
  db.query(sql, [name, description, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ id, name, description });
  });
});

// Delete (DELETE)
app.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM items WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(204).send();
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
