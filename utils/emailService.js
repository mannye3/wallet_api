import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL,PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from '../email/emailTemplates.js';

dotenv.config();
// console.log('EMAIL:', process.env.EMAIL);
// console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Password set' : 'Password missing');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
        
    },
    // logger: true,  // Enable logger
    // debug: true    // Show detailed debug output
});



export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const emailContent = VERIFICATION_EMAIL_TEMPLATE.replace('{verificationToken}', verificationToken);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Verify Your Email',
      html: emailContent
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
    //throw new Error('Failed to send verification email');
  }

}

export const sendWelcomeEmail = async (email, name) => {
  try {
    const emailContent = WELCOME_EMAIL.replace('{name}', name);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to Our Platform!",
      html: emailContent
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
    //throw new Error('Failed to send welcome email');
  }
};


export const sendResetPasswordEmail = async (email, resetURL) => {
  try {
    if (!email) {
      console.log('Recipient email is required');
    }

    const emailContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Your Password",
      html: emailContent
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    return false;
  }
};




export const sendResetSuccessEmail = async (email) => 
  {
     try {
    if (!email) {
      console.log('Recipient email is required');
    }

    const emailContent = PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{email}', email);


    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset Successfully", 
      html: emailContent
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    return false;
  }
  }





export const sendEmailNotification = async (senderAccount, receiverAccount, amount) => {
  // Calculate updated balances
  const updatedSenderBalance = senderAccount.balance - amount;
  const updatedReceiverBalance = receiverAccount.balance + amount;

  const senderEmailTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <h2 style="color: #4CAF50;">Transfer Successful</h2>
      <p>Dear ${senderAccount.firstname},</p>
      <p>You have successfully transferred <strong>$${amount}</strong> to 
        <strong>${receiverAccount.firstname} ${receiverAccount.lastname}</strong>.</p>
      <p>Your new balance is <strong>$${updatedSenderBalance}</strong>.</p>
      <p>Transaction Reference: <em>TX-${Date.now()}</em></p>
      <p>Thank you for using our service.</p>
      <footer style="margin-top: 20px; font-size: 12px; color: #777;">
        This is an automated message. Please do not reply to this email.
      </footer>
    </div>
  `;

  const receiverEmailTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <h2 style="color: #4CAF50;">You've Received a Transfer</h2>
      <p>Dear ${receiverAccount.firstname},</p>
      <p>You have received <strong>$${amount}</strong> from 
        <strong>${senderAccount.firstname} ${senderAccount.lastname}</strong>.</p>
      <p>Your new balance is <strong>$${updatedReceiverBalance}</strong>.</p>
      <p>Transaction Reference: <em>TX-${Date.now()}</em></p>
      <p>We hope you enjoy using our service.</p>
      <footer style="margin-top: 20px; font-size: 12px; color: #777;">
        This is an automated message. Please do not reply to this email.
      </footer>
    </div>
  `;

  const mailOptions = [
    {
      from: process.env.EMAIL,
      to: senderAccount.email,
      subject: "Transfer Successful",
      html: senderEmailTemplate, // Use HTML template
    },
    {
      from: process.env.EMAIL,
      to: receiverAccount.email,
      subject: "You've Received a Transfer",
      html: receiverEmailTemplate, // Use HTML template
    },
  ];

  // Send both emails using Promise.all() to send them concurrently
  await Promise.all(
    mailOptions.map((mail) => transporter.sendMail(mail))
  );
};



// Function to send deposit email with HTML template
export const sendDepositEmail = async (email, amount, balance, firstname, lastname) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Deposit Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #4CAF50; text-align: center;">Deposit Confirmation</h2>
          <p>Dear ${firstname} ${lastname},</p>

          <p>We are pleased to inform you that your recent deposit of <strong>$${amount}</strong> was successful!</p>

          <p>Your updated account balance is: <strong>$${balance}</strong>.</p>

          <div style="margin-top: 20px;">
            <p>Thank you for choosing our service. If you have any questions, feel free to contact us.</p>
            <p>Best Regards,</p>
            <p><strong>Your Company</strong></p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />
          <p style="font-size: 12px; text-align: center; color: #888;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};
