import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsDivisibleBy,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { focusGroups } from "../../exercises/focus-groups";
export class PlannedExerciseDto {
  @IsUUID() exerciseId!: string;
  @IsInt() @Min(1) @Max(30) sets!: number;
  @IsInt() @Min(1) @Max(1000) targetReps!: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(10000) targetWeight!: number;
  @IsInt() @Min(0) @Max(10) targetRir!: number;
  @IsInt() @Min(0) @Max(3600) @IsDivisibleBy(30) restSeconds!: number;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(3600, { each: true })
  @IsDivisibleBy(30, { each: true })
  restSecondsBySet?: number[];
}
export class PlanInputDto {
  @IsUUID() userId!: string;
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @IsIn(Object.keys(focusGroups)) focus!: keyof typeof focusGroups;
  @IsDateString({ strict: true }) date!: string;
  @IsArray()
  @ArrayMaxSize(7)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays!: number[];
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => PlannedExerciseDto)
  exercises!: PlannedExerciseDto[];
}
export class StartInputDto {
  @IsDateString({ strict: true }) date!: string;
}
