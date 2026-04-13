import pool from '../db/index.js';

// GET /admin/pending
export const getPending = async (req, res) => {
  try {
    // Pending persons
    const personsResult = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, f.name as family, u.name as suggested_by, p.created_at
       FROM persons p
       JOIN families f ON p.family_id = f.id
       JOIN users u ON p.created_by = u.id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    );

    // Pending photos
    const photosResult = await pool.query(
      `SELECT pp.id, p.first_name, p.last_name, pp.caption, u.name as suggested_by, pp.created_at
       FROM person_photos pp
       JOIN persons p ON pp.person_id = p.id
       JOIN users u ON pp.uploaded_by = u.id
       WHERE pp.approved = FALSE
       ORDER BY pp.created_at DESC`
    );

    // Pending relationships
    const relResult = await pool.query(
      `SELECT r.id, p1.first_name as person_a_first, p1.last_name as person_a_last,
              p2.first_name as person_b_first, p2.last_name as person_b_last,
              r.type, u.name as suggested_by, r.created_at
       FROM relationships r
       JOIN persons p1 ON r.person_a_id = p1.id
       JOIN persons p2 ON r.person_b_id = p2.id
       LEFT JOIN users u ON r.id = u.id
       WHERE r.verified = FALSE
       ORDER BY r.created_at DESC`
    );

    res.json({
      pending_persons: personsResult.rows,
      pending_photos: photosResult.rows,
      pending_relationships: relResult.rows,
    });
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ error: 'Failed to fetch pending items' });
  }
};

// GET /admin/users
export const listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, family_id, created_at FROM users ORDER BY created_at DESC`
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// PATCH /admin/users/:id/role
export const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'collaborator', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING *`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ error: 'Failed to change user role' });
  }
};

// DELETE /admin/users/:id
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Don't allow deleting yourself
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// GET /admin/stats
export const getStats = async (req, res) => {
  try {
    const personsCount = await pool.query(
      'SELECT COUNT(*) FROM persons WHERE status = $1',
      ['approved']
    );

    const familiesCount = await pool.query('SELECT COUNT(*) FROM families');

    const usersCount = await pool.query('SELECT COUNT(*) FROM users');

    const pendingCount = await pool.query(
      `SELECT COUNT(*) as total FROM persons WHERE status = $1
       UNION ALL
       SELECT COUNT(*) FROM person_photos WHERE approved = FALSE
       UNION ALL
       SELECT COUNT(*) FROM relationships WHERE verified = FALSE`,
      ['pending']
    );

    res.json({
      total_persons: parseInt(personsCount.rows[0].count, 10),
      total_families: parseInt(familiesCount.rows[0].count, 10),
      total_users: parseInt(usersCount.rows[0].count, 10),
      pending_items: pendingCount.rows.reduce((sum, row) => sum + parseInt(row.count, 10), 0),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
