import mongoose from 'mongoose';

const { Schema } = mongoose;

// GeoJSON Point — [longitude, latitude], matching MongoDB's 2dsphere convention.
export const geoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined },
  },
  { _id: false },
);
