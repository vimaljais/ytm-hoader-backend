import mongoose from 'mongoose';


const TokenSchema = new mongoose.Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  refreshToken: { type: String, required: true },
  googleId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

export default mongoose.model('Token', TokenSchema);
