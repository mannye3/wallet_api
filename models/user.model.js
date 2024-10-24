import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role:{
			type: String,
            enum: ["admin", "user"],
            default: "user",
		},
	//	isAdmin:{
		// 	type: Boolean,
        //     default: false,
		// },

		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},


		identification: {
			type: String,
			required: true,
		},

		identificationNumber: {
			type: String,
			required: true,
		},

			address: {
			type: String,
			required: true,
		},

		
		lastLogin: {
			type: Date, 
			default: Date.now,
		},

		balance:{
			type: Number,
			default: 0,
		},
		accountStatus: {
			type: Boolean,
			default: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);