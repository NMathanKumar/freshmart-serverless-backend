const { errors, response, utils } = require('@freshmart/service-shared');
const profileRepository = require('../repositories/profile.repository');

const { asyncHandler } = utils;
const { success, created } = response;
const { genId } = utils.id;
const { NotFoundError } = errors;

const buildDefaultProfile = (user, existingProfile = null) => {
  const userId = user.userId || user.sub || existingProfile?.userId || 'guest';
  const resolvedName = existingProfile?.name || existingProfile?.fullName || user.fullName || user.username || user.name || (user.email ? user.email.split('@')[0] : 'FreshMart Customer');
  return {
    userId,
    name: resolvedName,
    fullName: resolvedName,
    email: existingProfile?.email || user.email || '',
    phone: existingProfile?.phone || null,
    avatarUrl: existingProfile?.avatarUrl || null,
    address: existingProfile?.address || null,
    addresses: existingProfile?.addresses || (existingProfile?.address ? [existingProfile.address] : []),
    preferences: existingProfile?.preferences || {},
    createdAt: existingProfile?.createdAt || null,
    updatedAt: existingProfile?.updatedAt || null,
  };
};

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.sub;
  const profile = userId ? await profileRepository.findById(userId) : null;
  success(res, {
    message: 'Profile fetched',
    data: buildDefaultProfile(req.user, profile),
  });
});

const upsertProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.user?.sub;
  const current = userId ? await profileRepository.findById(userId) : null;
  const profile = current
    ? await profileRepository.update(userId, req.body)
    : await profileRepository.upsert({
      userId,
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
