const express = require('express');
const { authenticate, validate } = require('@freshmart/service-shared').middleware;
const controller = require('../controllers/user.controller');
const { profileSchema, addressSchema } = require('../validators/user.validator');

const router = express.Router();

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.put('/profile', validate(profileSchema), controller.upsertProfile);
router.post('/profile/avatar/upload-url', controller.getAvatarUploadUrl);
router.post('/avatar/upload-url', controller.getAvatarUploadUrl);
router.post('/addresses', validate(addressSchema), controller.addAddress);

router.get('/admin/profile', controller.getProfile);
router.put('/admin/profile', validate(profileSchema), controller.upsertProfile);
router.get('/admin/settings', controller.getSettings);
router.put('/admin/settings', controller.updateSettings);

router.get('/wishlist', (req, res) => {
  res.json({ data: { customerId: req.user.sub, items: [] } });
});

module.exports = router;

