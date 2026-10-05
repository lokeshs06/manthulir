import { FarmerProfile } from '../models/FarmerProfile.js';
import { PestDetection } from '../models/PestDetection.js';
import { PestRemedy } from '../models/PestRemedy.js';
import { ApiError } from '../utils/ApiError.js';
import { sniffImageType } from '../utils/imageSniff.js';
import { uploadImageBuffer } from './cloudinaryUpload.service.js';
import { requestPrediction } from './mlClient.service.js';
import { ML_CONFIDENCE_THRESHOLD } from '../config/constants.js';

const KVK_ADVICE =
  'For a confident diagnosis, please contact your nearest Krishi Vigyan Kendra (KVK) or agriculture extension officer.';
const KVK_ADVICE_TA =
  'உறுதியான கண்டறிதலுக்கு, உங்கள் அருகிலுள்ள கிருஷி விஞ்ஞான் கேந்திரா (KVK) அல்லது வேளாண் விரிவாக்க அதிகாரியை தொடர்பு கொள்ளவும்.';

const getProfileOrThrow = async (userId) => {
  const profile = await FarmerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');
  return profile;
};

const remedyForLabel = (label) => PestRemedy.findOne({ modelClassLabel: label });

export const detectPest = async (userId, file, { consentForTraining }) => {
  if (!file) throw ApiError.badRequest('IMAGE_REQUIRED', 'A pest/crop photo is required');

  // Step 1: validate by magic bytes, not just the client-supplied mimetype.
  const imageType = sniffImageType(file.buffer);
  if (!imageType) {
    throw ApiError.badRequest('INVALID_FILE_TYPE', 'Only JPEG, PNG, or WebP images are allowed');
  }
  if (file.buffer.length > 5 * 1024 * 1024) {
    throw ApiError.badRequest('FILE_TOO_LARGE', 'Image must be 5MB or smaller');
  }

  const profile = await getProfileOrThrow(userId);

  // Step 2: upload to Cloudinary (compression handled by the upload transform).
  let url;
  let publicId;
  try {
    const uploadRes = await uploadImageBuffer(file.buffer, 'pest-detections');
    url = uploadRes.url;
    publicId = uploadRes.publicId;
  } catch (cloudErr) {
    throw ApiError.internal('IMAGE_UPLOAD_FAILED', `Failed to upload image to storage: ${cloudErr.message}`);
  }

  // Step 3: call the ML service (15s timeout, 1 retry — see mlClient.service.js).
  let mlResult;
  try {
    mlResult = await requestPrediction(file.buffer, file.originalname);
  } catch {
    // Step 6: ML service unreachable — still record the attempt, then
    // surface a 503 with bilingual KVK guidance. The error carries the
    // saved detection so the controller can include its id in the response.
    await PestDetection.create({
      farmerId: profile._id,
      imageUrl: url,
      imagePublicId: publicId,
      predictions: [],
      resultType: 'service-unavailable',
      consentForTraining: !!consentForTraining,
    });
    throw ApiError.serviceUnavailable(
      'ML_SERVICE_UNAVAILABLE',
      `Pest detection is temporarily unavailable. ${KVK_ADVICE} / ${KVK_ADVICE_TA}`,
    );
  }

  const predictions = mlResult.predictions || [];
  const [top] = predictions;

  if (!top) {
    const detection = await PestDetection.create({
      farmerId: profile._id,
      imageUrl: url,
      imagePublicId: publicId,
      predictions: [],
      resultType: 'uncertain',
      modelVersion: mlResult.modelVersion,
      consentForTraining: !!consentForTraining,
    });
    return { detection, message: KVK_ADVICE, messageTa: KVK_ADVICE_TA, remedies: [] };
  }

  const isConfident = top.confidence >= ML_CONFIDENCE_THRESHOLD;

  if (isConfident) {
    // Step 4: confident — return only the matching remedy.
    const remedy = await remedyForLabel(top.label);
    const detection = await PestDetection.create({
      farmerId: profile._id,
      imageUrl: url,
      imagePublicId: publicId,
      predictions,
      topLabel: top.label,
      topConfidence: top.confidence,
      resultType: 'confident',
      remedyIds: remedy ? [remedy._id] : [],
      modelVersion: mlResult.modelVersion,
      consentForTraining: !!consentForTraining,
    });
    return { detection, remedies: remedy ? [remedy] : [] };
  }

  // Step 5: uncertain — return up to 3 possible matches with their remedies.
  const topThree = predictions.slice(0, 3);
  const remedies = (
    await Promise.all(topThree.map((p) => remedyForLabel(p.label)))
  ).filter(Boolean);

  const detection = await PestDetection.create({
    farmerId: profile._id,
    imageUrl: url,
    imagePublicId: publicId,
    predictions: topThree,
    topLabel: top.label,
    topConfidence: top.confidence,
    resultType: 'uncertain',
    remedyIds: remedies.map((r) => r._id),
    modelVersion: mlResult.modelVersion,
    consentForTraining: !!consentForTraining,
  });

  return { detection, remedies, message: KVK_ADVICE, messageTa: KVK_ADVICE_TA };
};

export const listMyDetections = async (userId, { skip, limit }) => {
  const profile = await getProfileOrThrow(userId);
  const filter = { farmerId: profile._id };
  const [items, total] = await Promise.all([
    PestDetection.find(filter).populate('remedyIds').sort({ createdAt: -1 }).skip(skip).limit(limit),
    PestDetection.countDocuments(filter),
  ]);
  return { items, total };
};

export const submitFeedback = async (userId, detectionId, { farmerFeedback, feedbackNote }) => {
  const profile = await getProfileOrThrow(userId);
  const detection = await PestDetection.findOne({ _id: detectionId, farmerId: profile._id });
  if (!detection) throw ApiError.notFound('DETECTION_NOT_FOUND', 'Pest detection not found');

  detection.farmerFeedback = farmerFeedback;
  if (feedbackNote !== undefined) detection.feedbackNote = feedbackNote;
  await detection.save();
  return detection;
};
