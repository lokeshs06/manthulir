import { PestRemedy } from '../models/PestRemedy.js';
import { ApiError } from '../utils/ApiError.js';

export const listPestRemedies = async () => PestRemedy.find().sort({ pestName: 1 });

export const getPestRemedyById = async (id) => {
  const remedy = await PestRemedy.findById(id);
  if (!remedy) throw ApiError.notFound('PEST_REMEDY_NOT_FOUND', 'Pest remedy not found');
  return remedy;
};

export const createPestRemedy = async (data) => {
  const existing = await PestRemedy.findOne({ modelClassLabel: data.modelClassLabel });
  if (existing) {
    throw ApiError.conflict('DUPLICATE_MODEL_CLASS_LABEL', 'A remedy for this model class label already exists');
  }
  return PestRemedy.create(data);
};

export const updatePestRemedy = async (id, updates) => {
  const remedy = await getPestRemedyById(id);
  Object.assign(remedy, updates);
  await remedy.save();
  return remedy;
};

export const deletePestRemedy = async (id) => {
  const remedy = await PestRemedy.findByIdAndDelete(id);
  if (!remedy) throw ApiError.notFound('PEST_REMEDY_NOT_FOUND', 'Pest remedy not found');
};
