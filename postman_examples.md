# Postman Collection for Auth Module (TRPC)

Base URL: `http://localhost:3052/trpc`

Dưới đây là các ví dụ cho Postman. Bạn có thể import hoặc copy paste vào Postman.
Lưu ý: TRPC sử dụng format input đặc biệt.

## 1. Register (Mutation)

**URL**: `{{baseUrl}}/auth.register`
**Method**: `POST`
**Body** (Raw JSON):

```json
{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phoneNumber": "0987654321",
    "confirmPassword": "password123",
    "code": "123456"
}
```

## 2. Login (Mutation)

**URL**: `{{baseUrl}}/auth.login`
**Method**: `POST`
**Body** (Raw JSON):

```json
{
    "email": "test@example.com",
    "password": "password123"
}
```

## 3. Send OTP (Mutation)

**URL**: `{{baseUrl}}/auth.sendOTP`
**Method**: `POST`
**Body** (Raw JSON):

```json
{
    "email": "test@example.com",
    "type": "REGISTER"
}
```

_Type có thể là: `REGISTER`, `LOGIN`, `FORGOT_PASSWORD`_

## 4. Refresh Token (Mutation)

**URL**: `{{baseUrl}}/auth.refreshToken`
**Method**: `POST`
**Body** (Raw JSON):

```json
{
    "refreshToken": "your_refresh_token_here"
}
```

## 5. Logout (Mutation)

**URL**: `{{baseUrl}}/auth.logout`
**Method**: `POST`
**Body** (Raw JSON):

```json
{
    "refreshToken": "your_refresh_token_here"
}
```

## 6. Forgot Password (Mutation)

**URL**: `{{baseUrl}}/auth.forgotPassword`
**Method**: `POST`
**Body** (Raw JSON):

```json
{
    "email": "test@example.com",
    "code": "123456",
    "newPassword": "newpassword123",
    "confirmNewPassword": "newpassword123"
}
```

## 7. Get Google Auth URL (Query)

**URL**: `{{baseUrl}}/auth.googleUrl?batch=1&input={}`
**Method**: `GET`
_(Lưu ý: TRPC Query thường dùng GET với input trong query params)_

## 8. Google Callback (Mutation)

**URL**: `{{baseUrl}}/auth.googleCallback`
**Method**: `POST`
**Body** (Raw JSON):

```json
{
    "code": "google_auth_code_from_callback",
    "state": "state_from_callback"
}
```

---
