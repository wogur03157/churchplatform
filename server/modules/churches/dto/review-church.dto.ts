import { IsIn, IsOptional, IsString } from "class-validator";

export class ReviewChurchDto {
  @IsIn(["active", "rejected"])
  action!: "active" | "rejected";

  @IsString()
  @IsOptional()
  rejectedReason?: string;
}
