const express = require('express');
const { authenticate, validate } = require('@freshmart/service-shared').middleware;
const controller = require('../controllers/user.controller');
const { profileSchema, addressSchema } = require('../validators/user.validator');

const router = express.Router();

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.put('/profile', validate(profileSchema), controller.upsertProfile);
router.post('/addresses', validate(addressSchema), controller.addAddress);
router.delete('/addresses/:addressId', controller.deleteAddress);

router.get('/wishlist', (req, res) => {
  res.json({ data: { customerId: req.user.sub, items: [] } });
});

module.exports = router;
