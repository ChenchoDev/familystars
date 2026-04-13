import express from 'express';
import { validate, schemas } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

// Controllers
import * as authController from '../controllers/auth.js';
import * as personsController from '../controllers/persons.js';
import * as familiesController from '../controllers/families.js';
import * as relationshipsController from '../controllers/relationships.js';
import * as photosController from '../controllers/photos.js';
import * as adminController from '../controllers/admin.js';

const router = express.Router();

// ===== AUTH ROUTES =====
router.post('/auth/magic-link', validate(schemas.magicLink), authController.requestMagicLink);
router.get('/auth/verify/:token', authController.verifyMagicLink);
router.get('/auth/me', requireAuth, authController.getCurrentUser);
router.post('/auth/invite', requireAuth, requireRole('admin'), validate(schemas.invite), authController.generateInvite);

// ===== PERSONS ROUTES =====
router.get('/persons', personsController.listPersons);
router.get('/persons/:id', personsController.getPerson);
router.post('/persons', requireAuth, validate(schemas.person), personsController.createPerson);
router.patch('/persons/:id', requireAuth, validate(schemas.person), personsController.updatePerson);
router.patch('/persons/:id/approve', requireAuth, requireRole('admin'), personsController.approvePerson);
router.delete('/persons/:id', requireAuth, requireRole('admin'), personsController.deletePerson);

// ===== PHOTOS ROUTES =====
router.get('/persons/:person_id/photos', photosController.getPhotos);
router.post('/persons/:person_id/photos', requireAuth, photosController.uploadPhoto);
router.patch('/person_photos/:id/approve', requireAuth, requireRole('admin'), photosController.approvePhoto);
router.delete('/person_photos/:id', requireAuth, requireRole('admin'), photosController.deletePhoto);

// ===== RELATIONSHIPS ROUTES =====
router.get('/relationships', relationshipsController.listRelationships);
router.post('/relationships', requireAuth, validate(schemas.relationship), relationshipsController.createRelationship);
router.patch('/relationships/:id/approve', requireAuth, requireRole('admin'), relationshipsController.approveRelationship);
router.delete('/relationships/:id', requireAuth, requireRole('admin'), relationshipsController.deleteRelationship);

// ===== FAMILIES ROUTES =====
router.get('/families', familiesController.listFamilies);
router.get('/families/:id', familiesController.getFamily);
router.post('/families', requireAuth, requireRole('admin'), validate(schemas.family), familiesController.createFamily);
router.patch('/families/:id', requireAuth, requireRole('admin'), validate(schemas.family), familiesController.updateFamily);

// ===== ADMIN ROUTES =====
router.get('/admin/pending', requireAuth, requireRole('admin'), adminController.getPending);
router.get('/admin/users', requireAuth, requireRole('admin'), adminController.listUsers);
router.patch('/admin/users/:id/role', requireAuth, requireRole('admin'), adminController.changeUserRole);
router.delete('/admin/users/:id', requireAuth, requireRole('admin'), adminController.deleteUser);
router.get('/admin/stats', requireAuth, requireRole('admin'), adminController.getStats);

// ===== HEALTH CHECK =====
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
