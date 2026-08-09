const { errors, response, utils } = require('@freshmart/service-shared');
const profileRepository = require('../repositories/profile.repository');

const { asyncHandler } = utils;
const { success, created } = response;
const { genId } = utils.id;
const { NotFoundError } = errors;

const buildDefaultProfile = (user, existingProfile = null) => {
  const emailName = user.email ? user.email.split('@')[0] : 'FreshMart Customer';
  const rawName = existingProfile?.name || existingProfile?.fullName || user.name;
  const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
  const nameVal = (rawName && !isUuid(rawName)) ? rawName : emailName;
  return {
    userId: user.userId,
    name: nameVal,
    fullName: nameVal,
    email: existingProfile?.email || user.email || '',
    phone: existingProfile?.phone || existingProfile?.phoneNumber || user.phone || user.phoneNumber || user.phone_number || (user.claims ? user.claims.phone_number : null) || null,
    phoneNumber: existingProfile?.phone || existingProfile?.phoneNumber || user.phone || user.phoneNumber || user.phone_number || (user.claims ? user.claims.phone_number : null) || null,
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

const getAvatarUploadUrl = asyncHandler(async (req, res) => {
  const { fileName, contentType } = req.body || {};
  const userId = req.user.userId;
  const cleanName = (fileName || 'avatar.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `avatars/${userId}/${Date.now()}_${cleanName}`;
  const bucket = process.env.AWS_S3_BUCKET || 'freshmart-dev-assets-769044546162';
  const region = process.env.AWS_REGION || 'ap-southeast-1';
  const avatarUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  let uploadUrl = avatarUrl;
  try {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const { s3Client } = require('@freshmart/service-shared').aws;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || 'image/jpeg',
    });
    uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  } catch (err) {
    console.warn('Failed to generate presigned avatar S3 URL:', err.message);
  }

  success(res, {
    message: 'Avatar upload URL generated',
    data: { uploadUrl, avatarUrl, bucket, key },
  });
});

module.exports = {
  getProfile,
  upsertProfile,
  addAddress,
  deleteAddress,
  getAvatarUploadUrl,
};
