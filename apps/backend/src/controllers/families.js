import pool from '../db/index.js';

// GET /families
export const listFamilies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.name, f.color_hex, f.description,
              COUNT(p.id) as person_count,
              u.name as admin_name
       FROM families f
       LEFT JOIN persons p ON f.id = p.family_id AND p.status = 'approved'
       LEFT JOIN users u ON f.admin_id = u.id
       GROUP BY f.id, f.name, f.color_hex, f.description, u.name
       ORDER BY f.name`
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error listing families:', error);
    res.status(500).json({ error: 'Failed to fetch families' });
  }
};

// GET /families/:id
export const getFamily = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT f.id, f.name, f.color_hex, f.description, f.admin_id, f.created_at, f.updated_at,
              u.name as admin_name, COUNT(p.id) as person_count
       FROM families f
       LEFT JOIN users u ON f.admin_id = u.id
       LEFT JOIN persons p ON f.id = p.family_id AND p.status = 'approved'
       WHERE f.id = $1
       GROUP BY f.id, f.name, f.color_hex, f.description, f.admin_id, f.created_at, f.updated_at, u.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching family:', error);
    res.status(500).json({ error: 'Failed to fetch family' });
  }
};

// POST /families [ADMIN ONLY]
export const createFamily = async (req, res) => {
  const { name, color_hex, description } = req.validated;

  try {
    const result = await pool.query(
      `INSERT INTO families (name, color_hex, description, admin_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, color_hex, description, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Family name already exists' });
    }
    console.error('Error creating family:', error);
    res.status(500).json({ error: 'Failed to create family' });
  }
};

// PATCH /families/:id [ADMIN ONLY]
export const updateFamily = async (req, res) => {
  const { id } = req.params;
  const updates = req.validated;

  try {
    const updateKeys = Object.keys(updates);
    const updateValues = Object.values(updates);
    const setClause = updateKeys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');

    const query = `UPDATE families SET ${setClause}, updated_at = NOW() WHERE id = $${updateKeys.length + 1} RETURNING *`;
    const result = await pool.query(query, [...updateValues, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating family:', error);
    res.status(500).json({ error: 'Failed to update family' });
  }
};
