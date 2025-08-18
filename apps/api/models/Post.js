import mongoose from 'mongoose';
const { Schema } = mongoose;
const postSchema = new Schema({
  title: String,
  body: String,
  type: { type: String, enum: ['SOP', 'VISA'] },
  country: String,
  // SOP specific fields
  university: String,
  program: String,
  department: String,
  term: String,
  degreeType: { type: String, enum: ['Bachelors', 'Masters', 'PhD', 'Diploma', 'Certificate'] },
  // Common fields
  tags: [String],
  author: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
