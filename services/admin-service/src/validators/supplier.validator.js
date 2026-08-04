const Joi = require('joi');

// --- Reusable field patterns ---

const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const PHONE_PATTERN = /^\+?[\d\s\-()]{7,20}$/;

const supplierIdSchema = Joi.object({
  supplierId: Joi.string().trim().min(1).max(128).required(),
});

const supplierListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').optional(),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'companyName', 'city', 'leadTimeDays').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const addressSchema = Joi.object({
  line1: Joi.string().max(200).allow('', null).optional(),
  line2: Joi.string().max(200).allow('', null).optional(),
  city: Joi.string().max(120).allow('', null).optional(),
  state: Joi.string().max(120).allow('', null).optional(),
  postalCode: Joi.string().max(20).allow('', null).optional(),
  country: Joi.string().max(80).allow('', null).optional(),
}).optional();

const bankDetailsSchema = Joi.object({
  bankName: Joi.string().max(200).allow('', null).optional(),
  accountNumber: Joi.string().max(40).allow('', null).optional(),
  ifscCode: Joi.string().max(20).allow('', null).optional(),
  accountType: Joi.string().valid('SAVINGS', 'CURRENT').allow('', null).optional(),
  beneficiaryName: Joi.string().max(200).allow('', null).optional(),
}).optional();

const taxInformationSchema = Joi.object({
  gstNumber: Joi.string().trim().max(20).pattern(GST_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid GST number format' }),
  panNumber: Joi.string().trim().max(10).pattern(PAN_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid PAN number format' }),
  taxCategory: Joi.string().max(60).allow('', null).optional(),
}).optional();

const createSupplierSchema = Joi.object({
  // Core identity
  name: Joi.string().trim().min(1).max(200).required(),
  companyName: Joi.string().trim().max(200).allow('', null).optional(),
  legalName: Joi.string().trim().max(200).allow('', null).optional(),
  supplierCode: Joi.string().trim().max(30).allow('', null).optional(),

  // Tax identifiers (backward compatible – top-level gstNumber still accepted)
  gstNumber: Joi.string().trim().max(20).pattern(GST_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid GST number format' }),
  panNumber: Joi.string().trim().max(10).pattern(PAN_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid PAN number format' }),

  // Contact
  contactPerson: Joi.string().trim().max(120).allow('', null).optional(),
  designation: Joi.string().trim().max(100).allow('', null).optional(),
  email: Joi.string().email().max(200).required(),
  phone: Joi.string().max(30).pattern(PHONE_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid phone number format' }),
  alternatePhone: Joi.string().max(30).pattern(PHONE_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid phone number format' }),

  // Address
  address: addressSchema,
  city: Joi.string().max(120).allow('', null).optional(),
  state: Joi.string().max(120).allow('', null).optional(),
  country: Joi.string().max(80).allow('', null).optional(),
  postalCode: Joi.string().max(20).allow('', null).optional(),

  // Business terms
  paymentTerms: Joi.string().max(200).allow('', null).optional(),
  leadTimeDays: Joi.number().integer().min(0).max(365).allow(null).optional(),

  // Catalog linkage
  supportedCategories: Joi.array().items(Joi.string().max(80)).max(50).optional(),
  suppliedProducts: Joi.array().items(Joi.string().max(80)).max(500).optional(),

  // Financial
  bankDetails: bankDetailsSchema,
  taxInformation: taxInformationSchema,

  // Status & notes
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  notes: Joi.string().max(2000).allow('', null).optional(),
});

const updateSupplierSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  companyName: Joi.string().trim().max(200).allow('', null).optional(),
  legalName: Joi.string().trim().max(200).allow('', null).optional(),
  supplierCode: Joi.string().trim().max(30).allow('', null).optional(),

  gstNumber: Joi.string().trim().max(20).pattern(GST_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid GST number format' }),
  panNumber: Joi.string().trim().max(10).pattern(PAN_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid PAN number format' }),

  contactPerson: Joi.string().trim().max(120).allow('', null).optional(),
  designation: Joi.string().trim().max(100).allow('', null).optional(),
  email: Joi.string().email().max(200).optional(),
  phone: Joi.string().max(30).pattern(PHONE_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid phone number format' }),
  alternatePhone: Joi.string().max(30).pattern(PHONE_PATTERN).allow('', null).optional()
    .messages({ 'string.pattern.base': 'Invalid phone number format' }),

  address: addressSchema,
  city: Joi.string().max(120).allow('', null).optional(),
  state: Joi.string().max(120).allow('', null).optional(),
  country: Joi.string().max(80).allow('', null).optional(),
  postalCode: Joi.string().max(20).allow('', null).optional(),

  paymentTerms: Joi.string().max(200).allow('', null).optional(),
  leadTimeDays: Joi.number().integer().min(0).max(365).allow(null).optional(),

  supportedCategories: Joi.array().items(Joi.string().max(80)).max(50).optional(),
  suppliedProducts: Joi.array().items(Joi.string().max(80)).max(500).optional(),

  bankDetails: bankDetailsSchema,
  taxInformation: taxInformationSchema,

  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').optional(),
  notes: Joi.string().max(2000).allow('', null).optional(),
}).min(1);

module.exports = { supplierIdSchema, supplierListSchema, createSupplierSchema, updateSupplierSchema };
