import mongoose from 'mongoose';
import { ARTICLE_CATEGORIES } from '../config/constants.js';

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    titleTa: { type: String },
    // Markdown content, rendered client-side.
    content: { type: String, required: true },
    contentTa: { type: String },
    category: { type: String, enum: ARTICLE_CATEGORIES, required: true },
    tags: { type: [String], default: [] },
    coverImageUrl: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },

    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

articleSchema.index({ category: 1, isPublished: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ title: 'text', content: 'text', titleTa: 'text', contentTa: 'text' });

export const Article = mongoose.model('Article', articleSchema);
