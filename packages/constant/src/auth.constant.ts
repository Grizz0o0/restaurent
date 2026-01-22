export const REQUEST_USER_KEY = 'user';
export const REQUEST_ROLE_PERMISSIONS = 'role_permission';
export const AUTH_TYPE_KEY = 'auth';

export const AuthType = {
    Bearer: 'Bearer',
    None: 'None',
    ApiKey: 'ApiKey',
} as const;

export type AuthTypeValue = (typeof AuthType)[keyof typeof AuthType];

export const ConditionGuard = {
    And: 'and',
    Or: 'or',
} as const;

export type ConditionGuardValue =
    (typeof ConditionGuard)[keyof typeof ConditionGuard];

export const TypeOfValidationCode = {
    REGISTER: 'REGISTER',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    LOGIN: 'LOGIN',
    DISABLE_2FA: 'DISABLE_2FA',
} as const;
export type TypeOfValidationCodeType =
    (typeof TypeOfValidationCode)[keyof typeof TypeOfValidationCode];
