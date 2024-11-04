
import mongoose from 'mongoose';

import { User } from '../models/user.model.js';
import Transaction from '../models/transactionModel.js';
import { sendEmailNotification, sendDepositEmail, sendRequestEmailNotification} from "../utils/emailService.js";
import { Request } from '../models/requestModel.js';




export const allRequest = async (req, res) => {
 try {
  
    console.log('Received User ID:', req.body.userId);
     //const transactions = await Transaction.find({ $or: [{sender: req.body.userId}, {receiver: req.body.userId}] })
      const transactions = await Request.find({ $or: [{sender: req.body.userId}, {receiver: req.body.userId}] }).
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
};













export const sendRequest = async (req, res) => {
  try {
    const { receiver, amount, description, userId } = req.body;

    if (!receiver || !amount || !description) {
      return res.status(400).send({
        success: false,
        message: 'Missing required fields',
      });
    }

 

    // Create a payment request record
    const request = new Request({
      sender: userId,
      receiver,
      amount,
      description,
    });
    await request.save();

    // Fetch the receiver's account to get their email address
    const receiverAccount = await User.findById(receiver);

    if (!receiverAccount) {
      return res.status(404).send({
        success: false,
        message: 'Receiver not found',
      });
    }

    const receiverEmail = receiverAccount.email;
  

    // Send email notification to the receiver
    await sendRequestEmailNotification(receiverEmail, amount, description);

    return res.status(200).send({
      data: request,
      message: 'Request sent successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error sending request:', error); // Improved logging
    return res.status(500).send({
      success: false,
      message: 'Failed to send request',
      error: error.message || 'An error occurred',
    });
  }
};






// get all transactions by user
export const getAllTransaction = async (req, res) => {
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
