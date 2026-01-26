import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { PromotionType } from 'src/generated/prisma/client'

export class CreatePromotionDto {
  @IsString()
  code: string

  @IsEnum(PromotionType)
  type: PromotionType

  @IsNumber()
  @Min(0)
  amount: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number

  @IsDateString()
  validFrom: string

  @IsDateString()
  validTo: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number

  @IsOptional()
  @IsString()
  applicableTo?: string
}
