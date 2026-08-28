import { model, Schema, models } from "mongoose";
import { IVoiceSession } from "@/types";

const VoiceSessionSchema = new Schema<IVoiceSession>({
    clerkId: { type: String, required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0, required: true },
    billingPeriodStart: { type: Date, required: true, index:  true },
}, { timestamps: true });

VoiceSessionSchema.index({ clerkId: 1, billingPeriodStart: 1 }); // to get access to the information of which user we need to charge for a specific subscription, we can query by clerkId and billingPeriodStart to get the voice sessions for that user in that billing period.

const VoiceSession = models.VoiceSession || model<IVoiceSession>('VoiceSession', VoiceSessionSchema);

export default VoiceSession;
