import {
  IsDivisibleBy,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
export class ActualSetDto {
  @IsInt() @Min(0) @Max(1000) reps!: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(10000) weight!: number;
  @IsInt() @Min(0) @Max(10) rir!: number;
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3600)
  @IsDivisibleBy(30)
  restSeconds?: number;
}
