import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be positive"], // Ensures positive amount
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure this matches the User model name
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ensure this matches the User model name
      required: true,
    },
    type: {
      type: String,
      enum: ["transfer", "deposit", "withdrawal"], // Example enum for transaction types
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true, // Ensures each reference is unique
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"], // Example statuses
      default: "pending", // Default status
      required: true,
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt timestamps
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;


