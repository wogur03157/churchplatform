import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ApplyChurchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: "slug는 소문자, 숫자, 하이픈만 사용할 수 있습니다" })
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
