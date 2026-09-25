import { describe, it, expect } from '@jest/globals';
import { User } from '../../src/models/User.js';
import { Scheme } from '../../src/models/Scheme.js';
import { PestRemedy } from '../../src/models/PestRemedy.js';
import { FarmerProfile } from '../../src/models/FarmerProfile.js';
import { Cluster } from '../../src/models/Cluster.js';
import { Produce } from '../../src/models/Produce.js';
import { VerificationLog } from '../../src/models/VerificationLog.js';
import { seedAdmin } from '../../src/seed/adminSeed.js';
import { seedSchemes } from '../../src/seed/schemeSeed.js';
import { seedPestRemedies } from '../../src/seed/pestRemedySeed.js';
import { seedSampleFarmers } from '../../src/seed/sampleDataSeed.js';
import { seedArticles } from '../../src/seed/articleSeed.js';
import { Article } from '../../src/models/Article.js';
import { schemesSeedData } from '../../src/seed/data/schemes.data.js';
import { pestRemediesSeedData } from '../../src/seed/data/pestRemedies.data.js';
import { farmersSeedData } from '../../src/seed/data/farmers.data.js';
import { articlesSeedData } from '../../src/seed/data/articles.data.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mlLabelsPath = path.resolve(__dirname, '../../../ml-service/artifacts/labels.json');
const mlLabels = JSON.parse(fs.readFileSync(mlLabelsPath, 'utf-8')).labels;

describe('seed scripts', () => {
  it('creates the admin user and is idempotent on re-run', async () => {
    await seedAdmin();
    await seedAdmin();
    const admins = await User.find({ role: 'admin' });
    expect(admins).toHaveLength(1);
  });

  it('seeds all schemes as unverified with placeholder-marked benefits, and is idempotent', async () => {
    await seedSchemes();
    await seedSchemes();
    const schemes = await Scheme.find({});
    expect(schemes).toHaveLength(schemesSeedData.length);
    expect(schemes.every((s) => s.verified === false)).toBe(true);
  });

  it('seeds pest remedies unreviewed, with modelClassLabel matching the ML service labels.json, and is idempotent', async () => {
    await seedPestRemedies();
    await seedPestRemedies();
    const remedies = await PestRemedy.find({});
    expect(remedies).toHaveLength(pestRemediesSeedData.length);
    expect(remedies.every((r) => r.reviewedByExpert === false)).toBe(true);
    expect(remedies.every((r) => mlLabels.includes(r.modelClassLabel))).toBe(true);
  });

  it('seeds sample farmers, a cluster, verification logs, and produce listings, and is idempotent', async () => {
    await seedSampleFarmers();
    await seedSampleFarmers();

    const farmers = await FarmerProfile.find({});
    expect(farmers).toHaveLength(farmersSeedData.length);

    const clusters = await Cluster.find({});
    expect(clusters).toHaveLength(1);
    expect(clusters[0].memberCount).toBe(2);

    const logs = await VerificationLog.find({});
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs.some((l) => l.peerVerifications.length > 0)).toBe(true);

    const produce = await Produce.find({});
    expect(produce.length).toBeGreaterThanOrEqual(3);
    expect(produce.some((p) => p.clusterId)).toBe(true);
  });

  it('seeds published articles covering philosophy and practice, and is idempotent', async () => {
    await seedArticles();
    await seedArticles();
    const articles = await Article.find({});
    expect(articles).toHaveLength(articlesSeedData.length);
    expect(articles.every((a) => a.isPublished)).toBe(true);
    expect(articles.some((a) => a.category === 'philosophy')).toBe(true);
    expect(articles.some((a) => a.category === 'practice')).toBe(true);
  });
});
