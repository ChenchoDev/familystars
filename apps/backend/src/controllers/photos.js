import pool from '../db/index.js';
import { sendAdminNotification } from '../services/email.js';

// GET /persons/:person_id/photos
export const getPhotos = async (req, res) => {
  const { person_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, cloudinary_url, caption, year, approved, created_at
       FROM person_photos
       WHERE person_id = $1 AND approved = TRUE
       ORDER BY created_at DESC`,
      [person_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

// POST /persons/:person_id/photos
export const uploadPhoto = async (req, res) => {
  const { person_id } = req.params;
  const { cloudinary_url, caption, year } = req.body;

  if (!cloudinary_url) {
    return res.status(400).json({ error: 'cloudinary_url is required' });
  }

  try {
    // Check person exists
    const personResult = await pool.query(
      'SELECT id FROM persons WHERE id = $1',
      [person_id]
    );

    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Determine approved status (admin = true, collaborator = false)
    const approved = req.user.role === 'admin';

    const result = await pool.query(
      `INSERT INTO person_photos (person_id, cloudinary_url, caption, year, uploaded_by, approved)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, approved`,
      [person_id, cloudinary_url, caption, year || null, req.user.id, approved]
    );

    const photo = result.rows[0];

    // Si la persona no tiene avatar, usar esta foto como avatar automáticamente
    const personCheck = await pool.query(
      'SELECT avatar_url FROM persons WHERE id = $1',
      [person_id]
    );

    if (!personCheck.rows[0]?.avatar_url) {
      await pool.query(
        'UPDATE persons SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
        [cloudinary_url, person_id]
      );
    }

    // Notify admin if pending
    if (!approved) {
      await sendAdminNotification(
        'Nueva foto sugerida',
        `Se ha subido una nueva foto para una persona.`
      );
    }

    res.status(201).json({
      id: photo.id,
      approved: photo.approved,
      message: approved ? 'Photo uploaded' : 'Photo uploaded, awaiting approval',
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// PATCH /person_photos/:id/approve [ADMIN ONLY]
export const approvePhoto = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE person_photos SET approved = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving photo:', error);
    res.status(500).json({ error: 'Failed to approve photo' });
  }
};

// DELETE /person_photos/:id [ADMIN ONLY]
export const deletePhoto = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM person_photos WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};
