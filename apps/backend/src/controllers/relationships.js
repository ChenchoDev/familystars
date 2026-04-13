import pool from '../db/index.js';
import { sendAdminNotification } from '../services/email.js';

// GET /relationships
export const listRelationships = async (req, res) => {
  const { person_id, verified = true } = req.query;

  try {
    let query = `SELECT r.id, r.person_a_id, r.person_b_id, r.type, r.verified, r.notes,
                        p1.first_name as person_a_name, p1.last_name as person_a_lastname,
                        p2.first_name as person_b_name, p2.last_name as person_b_lastname
                 FROM relationships r
                 JOIN persons p1 ON r.person_a_id = p1.id
                 JOIN persons p2 ON r.person_b_id = p2.id
                 WHERE 1=1`;
    const params = [];

    if (verified === 'true' || verified === true) {
      query += ` AND r.verified = TRUE`;
    }

    if (person_id) {
      query += ` AND (r.person_a_id = $${params.length + 1} OR r.person_b_id = $${params.length + 1})`;
      params.push(person_id);
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, params);

    const relationships = result.rows.map((r) => ({
      id: r.id,
      person_a: {
        id: r.person_a_id,
        name: `${r.person_a_name} ${r.person_a_lastname}`,
      },
      person_b: {
        id: r.person_b_id,
        name: `${r.person_b_name} ${r.person_b_lastname}`,
      },
      type: r.type,
      verified: r.verified,
      notes: r.notes,
    }));

    res.json({ data: relationships });
  } catch (error) {
    console.error('Error listing relationships:', error);
    res.status(500).json({ error: 'Failed to fetch relationships' });
  }
};

// POST /relationships
export const createRelationship = async (req, res) => {
  const { person_a_id, person_b_id, type, notes } = req.validated;

  try {
    // Check both persons exist
    const checkResult = await pool.query(
      'SELECT id FROM persons WHERE id IN ($1, $2)',
      [person_a_id, person_b_id]
    );

    if (checkResult.rows.length < 2) {
      return res.status(404).json({ error: 'One or both persons not found' });
    }

    // Check for duplicates
    const dupResult = await pool.query(
      `SELECT id FROM relationships
       WHERE (person_a_id = $1 AND person_b_id = $2)
       OR (person_a_id = $2 AND person_b_id = $1)`,
      [person_a_id, person_b_id]
    );

    if (dupResult.rows.length > 0) {
      return res.status(409).json({ error: 'Relationship already exists' });
    }

    // Determine verified status (admin = true, collaborator = false)
    const verified = req.user.role === 'admin';

    const result = await pool.query(
      `INSERT INTO relationships (person_a_id, person_b_id, type, verified, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, verified`,
      [person_a_id, person_b_id, type, verified, notes]
    );

    const relationship = result.rows[0];

    // Notify admin if pending
    if (!verified) {
      await sendAdminNotification(
        'Nueva relación sugerida',
        `Se ha sugerido una relación de tipo "${type}" entre dos personas.`
      );
    }

    res.status(201).json({
      id: relationship.id,
      verified: relationship.verified,
      message: verified ? 'Relationship created' : 'Relationship suggested, awaiting approval',
    });
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ error: 'Failed to create relationship' });
  }
};

// PATCH /relationships/:id/approve [ADMIN ONLY]
export const approveRelationship = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE relationships SET verified = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving relationship:', error);
    res.status(500).json({ error: 'Failed to approve relationship' });
  }
};

// DELETE /relationships/:id [ADMIN ONLY]
export const deleteRelationship = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM relationships WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting relationship:', error);
    res.status(500).json({ error: 'Failed to delete relationship' });
  }
};
