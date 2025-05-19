import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  isEmailVerified: boolean;
  twoFAEnabled: boolean;
  twoFASecret?: string;
  passkeys: any[]; // For WebAuthn
  sessions: Array<{
    sessionId: string;
    device: string;
    location: string;
    lastActive: Date;
  }>;
  username: string;
  passkeyChallenge?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  twoFAEnabled: { type: Boolean, default: false },
  twoFASecret: { type: String },
  passkeys: { type: [Schema.Types.Mixed as any], default: [] },
  sessions: [
    {
      sessionId: String,
      device: String,
      location: String,
      lastActive: Date,
    },
  ],
  username: { type: String, required: true, unique: true },
  passkeyChallenge: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
