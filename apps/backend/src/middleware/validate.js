import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${messages}` });
    }

    req.validated = value;
    next();
  };
};

// Common schemas
export const schemas = {
  email: Joi.string().email().required(),
  magicLink: Joi.object({
    email: Joi.string().email().required(),
  }),
  invite: Joi.object({
    email: Joi.string().email().required(),
    family_id: Joi.string().uuid().required(),
    role: Joi.string().valid('collaborator', 'admin').optional(),
  }),
  person: Joi.object({
    first_name: Joi.string().max(100).required(),
    last_name: Joi.string().max(100).required(),
    birth_date: Joi.date().optional(),
    birth_place: Joi.string().max(255).optional().allow(''),
    current_location: Joi.string().max(255).optional().allow(''),
    bio: Joi.string().max(500).optional().allow(''),
    family_id: Joi.string().uuid().required(),
  }),
  family: Joi.object({
    name: Joi.string().max(100).optional(),
    display_name: Joi.string().max(100).optional(),
    color_hex: Joi.string().regex(/^[0-9A-F]{6}$/i).optional(),
    description: Joi.string().optional(),
  }),
  relationship: Joi.object({
    person_a_id: Joi.string().uuid().required(),
    person_b_id: Joi.string().uuid().required(),
    type: Joi.string().valid('parent', 'child', 'partner', 'sibling', 'cousin', 'other').required(),
    notes: Joi.string().optional().allow('').allow(null),
  }),
};
