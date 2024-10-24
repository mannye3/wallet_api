
import mongoose from 'mongoose';

import { User } from '../models/user.model.js';
import Transaction from '../models/transactionModel.js';
import { sendEmailNotification, sendDepositEmail} from "../utils/emailService.js";
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';




const stripe = new Stripe(process.env.STRIPE_KEY);
const uniqueID = uuidv4();
const MAX_RETRIES = 3;




export const transfer = async (req, res) => {
  const { sender, receiver, amount } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: "Transfer amount must be positive" });
  }

  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction(); // Begin the transaction

    try {
      const senderAccount = await User.findById(sender).session(session);
      const receiverAccount = await User.findById(receiver).session(session);

      if (!senderAccount || !receiverAccount) {
        return res.status(404).json({ message: "Account not found" });
      }

      if (senderAccount.balance < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Update account balances
      senderAccount.balance -= amount;
      receiverAccount.balance += amount;

      await senderAccount.save({ session });
      await receiverAccount.save({ session });

      // Create a transaction record
      const transaction = new Transaction({
        sender: senderAccount._id,
        receiver: receiverAccount._id,
        amount,
        type: "transfer",
        reference: `TX-${Date.now()}`,
        status: "completed",
      });

      await transaction.save({ session });

      await session.commitTransaction(); // Commit the transaction
      session.endSession();

      // Send email notifications to both parties
      await sendEmailNotification(senderAccount, receiverAccount, amount);

      return res.status(200).json({
        message: 'Transfer successful',
        success: true,
      });

    } catch (error) {
      await session.abortTransaction(); // Rollback on error
      session.endSession();

      if (error.codeName === "WriteConflict" && retryCount < MAX_RETRIES) {
        console.warn("Write conflict detected, retrying transaction...");
        retryCount++;
        continue; // Retry the transaction
      }

      console.error("Error during transfer:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(500).json({ message: "Failed to complete transfer after retries" });
};



// get all transactions by user
export const getAllTransactions = async (req, res) => {
  try {
  
     //const transactions = await Transaction.find({ $or: [{sender: req.body.userId}, {receiver: req.body.userId}] })
      const transactions = await Transaction.find({ $or: [{sender: req.body.userId}, {receiver: req.body.userId}] }).
     sort({createdAt: -1}).populate("sender").populate("receiver");
    

    res.status(200).json({
      success: true,
      data: transactions,
      token: req.token,
    });
  } catch (error) {
    console.error("Error in CheckAuth:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}






export const verifyAccount = async (req, res) => {
  try {
    const user = await User.findOne({_id: req.body.receiver})

    if (user) {
      return res.status(200).json({
        message: 'Account verified successfully',
        success: true,
        data: user,
      });
    } else {
      return res.status(404).json({
        message: 'Account not found',
        success: false,
      });
    }
    
  } catch (error) {
    
  }

};




// export const DepositFunds = async (req, res) => {
//   try {
//     const { amount, token } = req.body; // Ensure userId is in the request body

//     // Validate input
//     if (!amount || !token) {
//       return res.status(400).send({
//         success: false,
//         message: 'Missing required fields',
//       });
//     }

//     const user = await User.findById(req.body.userId).select("-password");
//     console.log(user)
//     // Step 1: Create a customer in Stripe
//     const customer = await stripe.customers.create({
//       email: token.email, // Store the email of the customer
//       source: token.id, // Associate the token with this customer
//     });

//     // Step 2: Create a charge for the customer
//     const charge = await stripe.charges.create({
//       amount: amount * 100, // Amount in cents
//       currency: 'usd',
//       customer: customer.id, // Charge the customer
//       description: 'Deposit to account',
//     });

//     // Step 3: Save the transaction to the database
//     if (charge.status === 'succeeded') {
//       const transaction = new Transaction({
//         sender: res.body.userId, // Use the userId from the request body
//         receiver:  res.body.userId, // Deposit made to the same user's account
//         amount,
//         status: 'completed', // Change this based on your logic
//         type: 'deposit', // Use lowercase to match the enum values
//         reference: `TX-${Date.now()}`, // Generate a unique reference
//       });

//       await transaction.save(); // Save the transaction record

//       // Update user's balance
//       await User.findByIdAndUpdate(res.body.userId, {
//         $inc: { balance: amount }, // Increment the user's balance
//       });

//       return res.status(200).send({
//         success: true,
//         message: 'Deposit successful!',
//         data: transaction,
//       });
//     } else {
//       return res.status(400).send({
//         success: false,
//         message: 'Deposit failed!',
//         data: charge,
//       });
//     }
//   } catch (error) {
//     console.error('Error during deposit:', error); // Log the error for debugging
//     return res.status(500).send({
//       success: false,
//       message: 'Deposit failed!',
//       error: error.message || 'An error occurred', // Send the error message if available
//     });
//   }
// };


export const DepositFunds = async (req, res) => {
  try {
    const { amount, token, userId } = req.body;

    if (!amount || !token || !userId) {
      return res.status(400).send({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Fetch user details from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    const { firstname, lastname, email, balance } = user;

    // Step 1: Create a customer in Stripe
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    // Step 2: Create a charge
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      customer: customer.id,
      description: 'Deposit to account',
    });

    // Step 3: Save the transaction and update the user's balance
    if (charge.status === 'succeeded') {
      const transaction = new Transaction({
        sender: userId,
        receiver: userId,
        amount,
        status: 'completed',
        type: 'deposit',
        reference: `TX-${Date.now()}`,
      });

      await transaction.save();

      // Update user's balance
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } },
        { new: true }
      );

      // Send email notification with personalized name and updated balance
      await sendDepositEmail(
        email,
        amount,
        updatedUser.balance,
        firstname,
        lastname
      );

      return res.status(200).send({
        success: true,
        message: 'Deposit successful!',
        data: transaction,
      });
    } else {
      return res.status(400).send({
        success: false,
        message: 'Deposit failed!',
        data: charge,
      });
    }
  } catch (error) {
    console.error('Error during deposit:', error);
    return res.status(500).send({
      success: false,
      message: 'Deposit failed!',
      error: error.message || 'An error occurred',
    });
  }
};
