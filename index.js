const express = require('express');
const { Client } = require('pg');
const app = express();

app.use(express.json());

const client = new Client({
  connectionString: 'postgresql://postgres:npoe5030@localhost:5432/ice_cream_shop', // Replace 'your_password' with the actual password for the postgres user
});

client.connect()
  .then(() => {
    console.log('Connected to the database');
    return client.query(`
      CREATE TABLE IF NOT EXISTS flavors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  })
  .then(() => {
    // Insert some sample data if the table is empty
    return client.query(`
      INSERT INTO flavors (name, is_favorite)
      SELECT 'Vanilla', true
      WHERE NOT EXISTS (SELECT 1 FROM flavors)
      UNION ALL
      SELECT 'Chocolate', false
      WHERE NOT EXISTS (SELECT 1 FROM flavors)
      UNION ALL
      SELECT 'Strawberry', false
      WHERE NOT EXISTS (SELECT 1 FROM flavors)
    `);
  })
  .then(() => console.log('Table "flavors" is ready with sample data'))
  .catch(err => console.error('Connection error', err.stack));

// Define routes

// GET /api/flavors/:id
app.get('/api/flavors/:id', (req, res) => {
  const { id } = req.params;
  client.query('SELECT * FROM flavors WHERE id = $1', [id], (err, result) => {
    if (err) {
      console.error('Error fetching flavor:', err.stack);
      res.status(500).json({ error: 'Failed to fetch flavor' });
    } else {
      res.json(result.rows[0]);
    }
  });
});

// GET /api/flavors/:id
app.get('/api/flavors/:id', (req, res) => {
  const { id } = req.params;
  client.query('SELECT * FROM flavors WHERE id = $1', [id], (err, result) => {
    if (err) {
      console.error('Error fetching flavor:', err.stack);
      res.status(500).json({ error: 'Failed to fetch flavor' });
    } else {
      res.json(result.rows[0]);
    }
  });
});

// POST /api/flavors
app.post('/api/flavors', (req, res) => {
  const { name, is_favorite } = req.body;
  client.query('INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *', [name, is_favorite], (err, result) => {
    if (err) {
      console.error('Error adding flavor:', err.stack);
      res.status(500).json({ error: 'Failed to add flavor' });
    } else {
      res.status(201).json(result.rows[0]);
    }
  });
});

// DELETE /api/flavors/:id
app.delete('/api/flavors/:id', (req, res) => {
  const { id } = req.params;
  client.query('DELETE FROM flavors WHERE id = $1', [id], (err, result) => {
    if (err) {
      console.error('Error deleting flavor:', err.stack);
      res.status(500).json({ error: 'Failed to delete flavor' });
    } else {
      res.status(204).end();
    }
  });
});

// PUT /api/flavors/:id
app.put('/api/flavors/:id', (req, res) => {
  const { id } = req.params;
  const { name, is_favorite } = req.body;
  client.query('UPDATE flavors SET name = $1, is_favorite = $2, updated_at = NOW() WHERE id = $3 RETURNING *', [name, is_favorite, id], (err, result) => {
    if (err) {
      console.error('Error updating flavor:', err.stack);
      res.status(500).json({ error: 'Failed to update flavor' });
    } else {
      res.json(result.rows[0]);
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

