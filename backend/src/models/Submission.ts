import { Schema, model, type Types } from "mongoose";

export interface ISubmission {
  campaign: Types.ObjectId;
  creator: Types.ObjectId;
  postLink: string;
  views: number;
  /** Total rupees paid to the creator for this post so far. Monotonic, never decreases. */
  amountPaid: number;
  /** Bonus: set when views spike unusually fast. */
  flagged: boolean;
  flagReason?: string;
  lastViewsUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    postLink: { type: String, required: true, trim: true, maxlength: 500 },
    views: { type: Number, default: 0, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    flagged: { type: Boolean, default: false },
    flagReason: { type: String },
    lastViewsUpdatedAt: { type: Date },
  },
  { timestamps: true },
);

// The same link cannot be submitted twice to the same campaign.
submissionSchema.index({ campaign: 1, postLink: 1 }, { unique: true });

export const Submission = model<ISubmission>("Submission", submissionSchema);
