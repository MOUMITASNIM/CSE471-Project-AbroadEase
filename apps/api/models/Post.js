import mongoose from 'mongoose';
const { Schema } = mongoose;
const postSchema = new Schema({
  title: String,
  body: String,
  type: { type: String, enum: ['SOP', 'VISA'] },
  country: String,
  tags: [String],
  author: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
