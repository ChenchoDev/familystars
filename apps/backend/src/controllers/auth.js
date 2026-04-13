import pool from '../db/index.js';
import { generateToken, generateMagicLinkToken, verifyToken } from '../services/jwt.js';
import { sendMagicLink, sendInvitationEmail } from '../services/email.js';

// POST /auth/magic-link
export const requestMagicLink = async (req, res) => {
  const { email } = req.validated;

  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    const token = generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert or update magic token
    await pool.query(
      `INSERT INTO magic_tokens (email, token, expires_at)
       VALUES ($1, $2, $3)`,
      [email, token, expiresAt]
    );

    // Send email
    await sendMagicLink(email, token);

    res.json({ message: `Magic link sent to ${email}` });
  } catch (error) {
    console.error('Error requesting magic link:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
};

// GET /auth/verify/:token
export const verifyMagicLink = async (req, res) => {
  const { token } = req.params;

  try {
    // Check magic token
    const tokenResult = await pool.query(
      `SELECT email FROM magic_tokens
       WHERE token = $1 AND expires_at > NOW() AND used = FALSE`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const { email } = tokenResult.rows[0];

    // Mark token as used
    await pool.query(
      'UPDATE magic_tokens SET used = TRUE WHERE token = $1',
      [token]
    );

    // Find or create user
    let userResult = await pool.query(
      'SELECT id, name, role, family_id FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (userResult.rows.length === 0) {
      // Create new viewer user
      userResult = await pool.query(
        `INSERT INTO users (email, name, role)
         VALUES ($1, $2, 'viewer')
         RETURNING id, name, role, family_id`,
        [email, email.split('@')[0]]
      );
      user = userResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Generate JWT
    const jwtToken = generateToken({
      id: user.id,
      email,
      role: user.role,
      family_id: user.family_id,
    });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email,
        name: user.name,
        role: user.role,
        family_id: user.family_id,
      },
    });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
};

// GET /auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, name, role, family_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// POST /auth/invite [ADMIN ONLY]
export const generateInvite = async (req, res) => {
  const { email, family_id, role } = req.validated;

  try {
    // Check family exists
    const familyResult = await pool.query(
      'SELECT id FROM families WHERE id = $1',
      [family_id]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Generate invite token
    const inviteToken = generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Insert user with invite token
    const userResult = await pool.query(
      `INSERT INTO users (email, name, role, family_id, invite_token, invite_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
       SET invite_token = $5, invite_expires_at = $6
       RETURNING id, email`,
      [email, email.split('@')[0], role, family_id, inviteToken, expiresAt]
    );

    const familyNameResult = await pool.query(
      'SELECT name FROM families WHERE id = $1',
      [family_id]
    );

    const familyName = familyNameResult.rows[0]?.name || 'FamilyStars';
    const inviteUrl = `${process.env.FRONTEND_URL}/invite/${inviteToken}`;

    // Send invitation email
    await sendInvitationEmail(email, inviteUrl, familyName);

    res.status(201).json({
      invite_token: inviteToken,
      invite_url: inviteUrl,
      expires_at: expiresAt,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error('Error generating invite:', error);
    res.status(500).json({ error: 'Failed to generate invite' });
  }
};
