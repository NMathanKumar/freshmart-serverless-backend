const { errors, response, utils } = require('@freshmart/service-shared');
const profileRepository = require('../repositories/profile.repository');

const { asyncHandler } = utils;
const { success, created } = response;
const { genId } = utils.id;
const { NotFoundError } = errors;

const buildDefaultProfile = (user, existingProfile = null) => {
  const nameVal = existingProfile?.name || existingProfile?.fullName || user.username || user.email || 'FreshMart Customer';
  return {
    userId: user.userId,
    name: nameVal,
    fullName: nameVal,
    email: existingProfile?.email || user.email || '',
    phone: existingProfile?.phone || null,
    avatarUrl: existingProfile?.avatarUrl || null,
    address: existingProfile?.address || null,
    addresses: existingProfile?.addresses || [],
    preferences: existingProfile?.preferences || {},
    createdAt: existingProfile?.createdAt || null,
    updatedAt: existingProfile?.updatedAt || null,
  };
};

const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileRepository.findById(req.user.userId);
  success(res, {
    message: 'Profile fetched',
    data: buildDefaultProfile(req.user, profile),
  });
});

const upsertProfile = asyncHandler(async (req, res) => {
  const current = await profileRepository.findById(req.user.userId);
  const profile = current
    ? await profileRepository.update(req.user.userId, req.body)
    : await profileRepository.upsert({
      userId: req.user.userId,
      ...req.body,
      addresses: [],
    });

  success(res, { message: 'Profile updated', data: buildDefaultProfile(req.user, profile) });
});

const addAddress = asyncHandler(async (req, res) => {
  const current = await profileRepository.findById(req.user.userId);
  if (!current) {
    throw new NotFoundError('Profile not found. Create your profile before adding addresses.');
  }

  const nextAddress = {
    addressId: genId('ADDR'),
    ...req.body,
  };

  const existingAddresses = Array.isArray(current.addresses) ? current.addresses : [];
  const addresses = req.body.isDefault
    ? existingAddresses.map((address) => ({ ...address, isDefault: false })).concat(nextAddress)
    : existingAddresses.concat(nextAddress);

  const profile = await profileRepository.update(req.user.userId, {
    addresses,
    address: addresses[0] || null,
  });

  created(res, {
    message: 'Address added',
    data: {
      profile: buildDefaultProfile(req.user, profile),
      address: nextAddress,
    },
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const current = await profileRepository.findById(req.user.userId);
  if (!current) {
    throw new NotFoundError('Profile not found.');
  }

  const existingAddresses = Array.isArray(current.addresses) ? current.addresses : [];
  const addresses = existingAddresses.filter((a) => a.addressId !== req.params.addressId);

  const profile = await profileRepository.update(req.user.userId, {
    addresses,
    address: addresses[0] || null,
  });

  success(res, {
    message: 'Address deleted',
    data: buildDefaultProfile(req.user, profile),
  });
});

module.exports = {
  getProfile,
  upsertProfile,
  addAddress,
  deleteAddress,
};
