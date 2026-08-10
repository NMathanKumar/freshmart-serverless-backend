const { errors, response, utils } = require('@freshmart/service-shared');
const profileRepository = require('../repositories/profile.repository');

const { asyncHandler } = utils;
const { success, created } = response;
const { genId } = utils.id;
const { NotFoundError } = errors;

const buildDefaultProfile = (user, existingProfile = null) => ({
  userId: user.userId,
  name: existingProfile?.name || user.username || user.email || 'FreshMart Customer',
  email: existingProfile?.email || user.email || '',
  phone: existingProfile?.phone || null,
  avatarUrl: existingProfile?.avatarUrl || null,
  address: existingProfile?.address || null,
  addresses: existingProfile?.addresses || [],
  preferences: existingProfile?.preferences || {},
  createdAt: existingProfile?.createdAt || null,
  updatedAt: existingProfile?.updatedAt || null,
});

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

const getAvatarUploadUrl = asyncHandler(async (req, res) => {
  const { fileName } = req.body || {};
  const cleanName = (fileName || 'avatar.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
  const userId = req.user?.userId || req.user?.sub || 'user';
  const key = `avatars/${userId}_${Date.now()}_${cleanName}`;
  const bucket = process.env.AWS_S3_BUCKET || 'freshmart-dev-assets-769044546162';
  const region = process.env.AWS_REGION || 'ap-southeast-1';
  const avatarUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  success(res, {
    message: 'Presigned avatar upload URL generated',
    data: {
      uploadUrl: '#',
      avatarUrl,
    },
  });
});

module.exports = {
  getProfile,
  upsertProfile,
  addAddress,
  getAvatarUploadUrl,
};
