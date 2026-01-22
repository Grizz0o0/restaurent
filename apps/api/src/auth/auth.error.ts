import { TRPCError } from '@trpc/server'

// OTP related errors
export class InvalidOTPException extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.InvalidOTP' })
  }
}

export class OTPExpiredException extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.OTPExpired' })
  }
}

export class FailedToSendOTPException extends TRPCError {
  constructor() {
    super({ code: 'INTERNAL_SERVER_ERROR', message: 'Error.FailedToSendOTP' })
  }
}

// Email related errors
export class EmailAlreadyExistsException extends TRPCError {
  constructor() {
    super({ code: 'CONFLICT', message: 'Error.EmailAlreadyExists' })
  }
}

export class EmailNotFoundException extends TRPCError {
  constructor() {
    super({ code: 'NOT_FOUND', message: 'Error.EmailNotFound' })
  }
}

// Password related errors
export class InvalidPasswordException extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'Error.InvalidPassword' })
  }
}

export class InvalidRefreshTokenException extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'Error.InvalidRefreshToken' })
  }
}

export class InvalidTokenException extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'Error.InvalidToken' })
  }
}

// Auth token related errors
export class RefreshTokenAlreadyUsedException extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'Error.RefreshTokenAlreadyUsed' })
  }
}

export class UnauthorizedAccessException extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'Error.UnauthorizedAccess' })
  }
}

// Google auth related errors
export class GoogleUserInfoError extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.FailedToGetGoogleUserInfo' })
  }
}

// TOTP related errors
export class TOTPAlreadyEnabledException extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.TOTPAlreadyEnabled' })
  }
}

export class TOTPNotEnabledException extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.TOTPNotEnabled' })
  }
}

export class InvalidTOTPAndCodeException extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.InvalidTOTPAndCode' })
  }
}

export class InvalidTOTPCodeException extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.InvalidTOTPCode' })
  }
}

export class AccountLockedException extends TRPCError {
  constructor() {
    super({ code: 'FORBIDDEN', message: 'Error.AccountLocked' })
  }
}

export class OldPasswordIncorrectException extends TRPCError {
  constructor() {
    super({ code: 'BAD_REQUEST', message: 'Error.OldPasswordIncorrect' })
  }
}
