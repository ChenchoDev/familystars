import pool from '../db/index.js';
import { sendAdminNotification } from '../services/email.js';

// GET /persons
export const listPersons = async (req, res) => {
  const { family_id, limit = 100, offset = 0 } = req.query;

  try {
    let query = `SELECT id, first_name, last_name, birth_date, avatar_url, family_id, status
                 FROM persons WHERE status = 'approved'`;
    const params = [];

    if (family_id) {
      query += ` AND family_id = $${params.length + 1}`;
      params.push(family_id);
    }

    // Generate mock coordinates for canvas (will be improved in Phase 2)
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);

    // Add mock coordinates
    const persons = result.rows.map((p, idx) => ({
      ...p,
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      generation: 0,
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM persons WHERE status = $1';
    const countParams = ['approved'];
    if (family_id) {
      countQuery += ` AND family_id = $2`;
      countParams.push(family_id);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json(persons);
  } catch (error) {
    console.error('Error listing persons:', error);
    res.status(500).json({ error: 'Failed to fetch persons' });
  }
};

// GET /persons/:id
export const getPerson = async (req, res) => {
  const { id } = req.params;

  try {
    const personResult = await pool.query(
      `SELECT p.*, f.name as family_name, f.color_hex
       FROM persons p
       JOIN families f ON p.family_id = f.id
       WHERE p.id = $1`,
      [id]
    );

    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const person = personResult.rows[0];

    // Get relationships
    const relResult = await pool.query(
      `SELECT r.id, r.person_b_id, p.first_name, p.last_name, r.type
       FROM relationships r
       JOIN persons p ON r.person_b_id = p.id
       WHERE r.person_a_id = $1 AND r.verified = TRUE`,
      [id]
    );

    // Get photos
    const photosResult = await pool.query(
      `SELECT id, cloudinary_url, caption, year FROM person_photos
       WHERE person_id = $1 AND approved = TRUE`,
      [id]
    );

    // Get social links
    const socialResult = await pool.query(
      `SELECT platform, url, label FROM social_links WHERE person_id = $1`,
      [id]
    );

    res.json({
      ...person,
      family: {
        id: person.family_id,
        name: person.family_name,
        color_hex: person.color_hex,
      },
      relationships: relResult.rows,
      photos: photosResult.rows,
      social_links: socialResult.rows,
    });
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
};

// POST /persons
export const createPerson = async (req, res) => {
  const { first_name, last_name, birth_date, birth_place, current_location, bio, family_id } = req.validated;

  try {
    // Check family exists
    const familyResult = await pool.query(
      'SELECT id FROM families WHERE id = $1',
      [family_id]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Determine status (admin = approved, collaborator = pending)
    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    const result = await pool.query(
      `INSERT INTO persons (first_name, last_name, birth_date, birth_place, current_location, bio, family_id, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, status`,
      [first_name, last_name, birth_date || null, birth_place, current_location, bio, family_id, status, req.user.id]
    );

    const person = result.rows[0];

    // Notify admin if pending
    if (status === 'pending') {
      await sendAdminNotification(
        'Nueva persona sugerida',
        `${req.user.name || req.user.email} ha sugerido: ${first_name} ${last_name}`
      );
    }

    res.status(201).json({
      id: person.id,
      status: person.status,
      message: status === 'pending' ? 'Person suggested, awaiting approval' : 'Person created successfully',
    });
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
};

// PATCH /persons/:id
export const updatePerson = async (req, res) => {
  const { id } = req.params;
  const updates = req.validated;

  try {
    // Check person exists and user has permission
    const personResult = await pool.query(
      'SELECT created_by, family_id FROM persons WHERE id = $1',
      [id]
    );

    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const person = personResult.rows[0];

    // Only admin or creator can edit
    if (req.user.role !== 'admin' && req.user.id !== person.created_by) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Build update query
    const updateKeys = Object.keys(updates);
    const updateValues = Object.values(updates);
    const setClause = updateKeys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');

    const query = `UPDATE persons SET ${setClause}, updated_at = NOW() WHERE id = $${updateKeys.length + 1} RETURNING *`;
    const result = await pool.query(query, [...updateValues, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
};

// PATCH /persons/:id/approve [ADMIN ONLY]
export const approvePerson = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE persons SET status = 'approved', approved_by = $1 WHERE id = $2 RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving person:', error);
    res.status(500).json({ error: 'Failed to approve person' });
  }
};

// DELETE /persons/:id [ADMIN ONLY]
export const deletePerson = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM persons WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
};
