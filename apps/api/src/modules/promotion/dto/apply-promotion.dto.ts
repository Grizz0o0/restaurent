import { IsNumber, IsString } from 'class-validator'

export class ApplyPromotionDto {
  @IsString()
  code: string

  @IsNumber()
  orderValue: number
}
