export type AccessTokenPayloadCreate = {
  userId: string
  deviceId: string
  roleId: string
  roleName: string
  tableId?: string
}

export type AccessTokenPayload = AccessTokenPayloadCreate & {
  exp: number
  iat: number
}

export type RefreshTokenPayloadCreate = {
  userId: string
}

export type RefreshTokenPayload = RefreshTokenPayloadCreate & {
  exp: number
  iat: number
}
