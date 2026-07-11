import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateChurchDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsIn(["active", "suspended"])
  @IsOptional()
  status?: "active" | "suspended";
}
