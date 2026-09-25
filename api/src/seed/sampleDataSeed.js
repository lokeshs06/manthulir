import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { Cluster } from '../models/Cluster.js';
import { VerificationLog } from '../models/VerificationLog.js';
import { Produce } from '../models/Produce.js';
import { farmersSeedData } from './data/farmers.data.js';
import { computeBadgeForFarmer } from '../services/badge.service.js';
import { logger } from '../utils/logger.js';

// Seed data never calls out to real Cloudinary — these are stable
// placeholder image URLs, not uploads.
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400.png?text=Sample+Photo';

const ensureFarmer = async (data) => {
  let user = await User.findOne({ phone: data.phone });
  if (!user) {
    const passwordHash = await bcrypt.hash('samplePass123', 10);
    user = await User.create({ name: data.name, phone: data.phone, passwordHash, role: 'farmer' });
  }

  let profile = await FarmerProfile.findOne({ userId: user._id });
  if (!profile) {
    profile = await FarmerProfile.create({
      userId: user._id,
      district: data.district,
      landSizeAcres: data.landSizeAcres,
      crops: data.crops,
      transitionStatus: data.transitionStatus,
      transitionStartDate: data.transitionStatus !== 'not_started' ? new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) : null,
    });
  }
  return profile;
};

export const seedSampleFarmers = async () => {
  const profiles = [];
  for (const data of farmersSeedData) {
    profiles.push(await ensureFarmer(data));
  }
  const [murugan, kalaiselvi, , , selvam] = profiles;

  let cluster = await Cluster.findOne({ name: 'Thanjavur Organic Growers' });
  if (!cluster) {
    cluster = await Cluster.create({
      name: 'Thanjavur Organic Growers',
      district: 'Thanjavur',
      leadId: murugan._id,
      memberIds: [murugan._id, kalaiselvi._id],
      memberCount: 2,
      totalLandSizeAcres: murugan.landSizeAcres + kalaiselvi.landSizeAcres,
    });
    murugan.clusterIds.push(cluster._id);
    kalaiselvi.clusterIds.push(cluster._id);
    await murugan.save();
    await kalaiselvi.save();
  }

  const existingLogCount = await VerificationLog.countDocuments({ farmerId: { $in: [murugan._id, kalaiselvi._id, selvam._id] } });
  if (existingLogCount === 0) {
    const log1 = await VerificationLog.create({
      farmerId: murugan._id,
      practiceType: 'compost_application',
      description: 'Applied farmyard manure compost to the main field.',
      photoUrl: PLACEHOLDER_IMAGE,
      photoPublicId: 'sample/verification-1',
    });
    log1.peerVerifications.push({ verifierId: kalaiselvi._id });
    await log1.save();

    await VerificationLog.create({
      farmerId: kalaiselvi._id,
      practiceType: 'panchagavya_spray',
      description: 'Sprayed panchagavya on brinjal crop.',
      photoUrl: PLACEHOLDER_IMAGE,
      photoPublicId: 'sample/verification-2',
    });

    await VerificationLog.create({
      farmerId: selvam._id,
      practiceType: 'pheromone_trap',
      description: 'Installed pheromone traps for fruit borer.',
      photoUrl: PLACEHOLDER_IMAGE,
      photoPublicId: 'sample/verification-3',
    });

    for (const p of [murugan, kalaiselvi, selvam]) {
      await computeBadgeForFarmer(p._id);
    }
  }

  const existingProduceCount = await Produce.countDocuments();
  if (existingProduceCount === 0) {
    await Produce.create({
      farmerId: murugan._id,
      cropName: 'Tomato',
      cropNameTa: 'தக்காளி',
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 20,
      badge: murugan.badge,
      transitionStatus: murugan.transitionStatus,
    });
    await Produce.create({
      farmerId: selvam._id,
      cropName: 'Chilli',
      cropNameTa: 'மிளகாய்',
      quantity: 50,
      unit: 'kg',
      pricePerUnit: 80,
      badge: selvam.badge,
      transitionStatus: selvam.transitionStatus,
    });
    await Produce.create({
      clusterId: cluster._id,
      cropName: 'Paddy',
      cropNameTa: 'நெல்',
      quantity: 20,
      unit: 'quintal',
      pricePerUnit: 2200,
      badge: 'none',
      transitionStatus: 'transitioning',
    });
  }

  logger.info(
    `Sample data seeded: ${farmersSeedData.length} farmers, 1 cluster, verification logs, produce listings`,
  );
};
