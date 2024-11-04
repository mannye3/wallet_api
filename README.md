# Node Authentication

A backend service built with Node.js, Express, and MongoDB to support wallet functionalities like fund requests, balance updates, transaction history, and user authentication.

## Features

- User Authentication (JWT-based).
- CRUD operations for wallet transactions.
- Real-time balance updates with MongoDB transactions.
- Request/approval workflow for fund transfers.
- Error handling and response management.

- **Secure HTTP headers with Helmet.js:** Improve security by setting various HTTP headers using Helmet.js.
- **MongoDB for persistent storage:** Store user data, token info, and other authentication-related data in MongoDB.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mannye3/wallet_api.git
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```bash
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRATION=1h

   # Database Configuration
   MONGO_URI=your_mongo_connection_string_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Email Configuration (for password reset and email verification)
   EMAIL=your_email_here
   EMAIL_PASSWORD=your_email_password_or_app_specific_password_here
   ```

4. Ensure MongoDB is running either locally or on a service like MongoDB Atlas.

## Usage

1. Start the server:
   ```bash
   npm start
   ```
2. The server will run on `http://localhost:5000` (or the port specified in your `.env` file).
3. Use API endpoints to handle authentication-related tasks such as user registration, login, email verification, and password resets.

## API Endpoints

### Authentication

- **POST** `/api/auth/register`: Register a new user. Requires `name`, `email`, and `password` in the request body.
- **POST** `/api/auth/login`: Login a user and receive a JWT token. Requires `email` and `password`.
- **POST** `/api/auth/logout`: Log out the user and invalidate the current JWT token.
- **GET** `/api/auth/verify-email`: Verifies a user's email using the verification token sent via email.
- **POST** `/api/auth/forgot-password`: Request a password reset by providing the user's email.
- **POST** `/api/auth/reset-password`: Reset the password using a token sent to the user's email.

### Protected Routes

- **GET** `/api/check-auth`: An example of a protected route that requires valid JWT authentication.

  - This route demonstrates how to protect certain parts of your application by requiring JWT in the headers.

  ### Transctions

- **POST** `/api/transactions/transfer-fund`: Transfer funds to other accounts
- **POST** `/api/transactions/deposit-fund`: Deposit funds to your account using stripe
- **GET** `/api/transactions/user-transactions`: User transaction
- **POST** `/api/transactions/user-requests`: Send transaction requests
- **POST** `/api/transactions/update-request`: Update transaction request

## Example Usage with cURL

**Registration**:

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"John Doe", "email":"john@example.com", "password":"yourpassword"}'
```

**Login**:

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"john@example.com", "password":"yourpassword"}'
```

**Verify Email**:

```bash
curl -X GET http://localhost:5000/api/auth/verify-email?token=your-verification-token
```

## Security Features

- **JWT-based Authentication**: Secure stateless user sessions using JSON Web Tokens (JWT), stored in HTTP headers.
- **Password Hashing**: All passwords are hashed using bcrypt to ensure user credentials are stored securely.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for persisting user and token data.
- **JSON Web Tokens (jsonwebtoken)**: For issuing and verifying secure tokens.
- **bcrypt**: Password hashing library for securing user passwords.
- **nodemailer**: Email sending library for account verification and password resets.

## Contributing

Contributions are welcome! Please follow these steps to contribute to the project:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure all tests pass.
4. Submit a pull request explaining your changes.

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute the project as long as the license terms are met.

## Contact

For any questions or feedback, please feel free to reach out to:

**Emmanuel Aboajah**

- Email: [aboajahemmanuel@gmail.com](mailto:aboajahemmanuel@gmail.com)
- GitHub: [mannye3](https://github.com/mannye3)
