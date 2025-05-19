import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: string;
  title: string;
  archived: boolean;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSessionSchema = new Schema<IChatSession>({
  userId: { type: Schema.Types.String, ref: 'User', required: true },
  title: { type: String, required: true },
  archived: { type: Boolean, default: false },
  messages: { type: [ChatMessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
