import { SetMetadata } from '@nestjs/common'
import {
  AUTH_TYPE_KEY,
  AuthType,
  AuthTypeValue,
  ConditionGuard,
  ConditionGuardValue,
} from '@repo/constants'

export type AuthTypeDecorator = {
  authType: AuthTypeValue[]
  options: { condition: ConditionGuardValue }
}
export const Auth = (authType: AuthTypeValue[], options?: { condition: ConditionGuardValue }) =>
  SetMetadata(AUTH_TYPE_KEY, { authType, options: options ?? { condition: ConditionGuard.And } })

export const IsPublic = () => Auth([AuthType.None])
