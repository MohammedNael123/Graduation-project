# API Endpoint: `POST /log_in`
## Description
This API endpoint allows users to log in by providing their email and password. It checks whether the user exists in the system, verifies the credentials via Supabase authentication, fetches the user's profile data, and returns a JWT token for session management.

## Request
- **URL**: `/log_in`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body Parameters**:

    - `email` (string): The email address of the user trying to log in.

    - `password` (string): The password of the user trying to log in.

- **Request Body Example**:
```json
{
  "email": "user@example.com",
  "password": "user_password123"
}
```


## Flow of Functionality

- **Input Validation**:

The request must contain both the email and password. If either is missing, the API responds with an error message: "Email and password are required.".

- **Check if User Exists**:

The email provided in the request is checked against the profiles table in the Supabase database.
If the user doesn't exist (i.e., no record found with the given email), the API responds with: "user is not registered!".
- **Supabase Authentication**:

The API calls Supabase Authentication to attempt to log the user in with the provided email and password.
If the credentials are invalid (i.e., wrong email or password), the API responds with: "Invalid email or password.".
- **Fetch User Profile**:

After successful authentication, the user's profile data is fetched from the profiles table based on the authenticated user's ID.
If there is an error fetching the profile (e.g., missing profile information), the API responds with: "failed to fetch user profile.".
- **JWT Token Generation**:

If the authentication is successful and the profile data is retrieved, a JWT (JSON Web Token) is generated.
The token contains the user's ID, full name, and email, and is signed with a secret key ("jwt-secret-key").
The token expires in 1 day.
- **Set Cookie**:

A secure cookie containing the generated JWT token is sent back to the client. This cookie is used to maintain the user session.
The cookie is set with the following  **properties**:
- `httpOnly`: true: Ensures the cookie is not accessible via JavaScript (for security purposes).
- `secure`: false: The cookie is set to be non-secure (use true in production if serving over HTTPS).
- `maxAge`: 24 * 60 * 60 * 1000: The cookie will expire after 1 day.


## Successful Login Response:

If the login is successful, the response **contains**:
- A success message: "Login successful!".
- The user information (email and full name).
- A success: true flag indicating that the login process succeeded.
- Response

## Success Response (HTTP status 200):

- **Status Code**: 200 OK
Response Body:
```json
{
  "message": "Login successful!",
  "user": {
    "email": "user@example.com",
    "full_name": "User Name"
  },
  "success": true
}
```
**Error Response** (HTTP status 400 or 500):

Status Code: 400 Bad Request or 500 Internal Server Error
Response Body:
```json
{
  "message": "Invalid email or password." // or other error messages
}
```
## Error Handling
If there’s an issue with the request (e.g., missing email/password), the response will indicate the problem:

- **"Email and password are required."**
- **"user is not registered!"**
- **"Invalid email or password."**
- **"failed to fetch user profile."**
- **"Something went wrong!"**

If there’s an internal error (e.g., Supabase or JWT issue), the server will return a generic error message with a status of 500 and details about the error in the error field of the response.

## Security Considerations
**The JWT token** is stored in an httpOnly cookie to prevent client-side JavaScript from accessing it (protecting against XSS attacks).

**The JWT secret key** ("``jwt-secret-key``") should be kept private and stored securely (preferably in environment variables).

**In a production environment**, the secure flag for cookies should be set to true to ensure the cookie is only sent over HTTPS.


## Summary of the API Workflow
User sends a **POST** request to `/log_in` with email and password.

The system checks if the user exists in **Supabase**.

If the user **exists**, it attempts to log in using Supabase `Auth`.
Upon successful login, it fetches the user's profile data from **Supabase**.

**A JWT token** is created and stored in a secure httpOnly cookie.

**A success response** with user info and a success flag is returned.
