import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
export class SetInputDto {
  @IsInt() @Min(1) @Max(1000) reps!: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(10000) weight!: number;
}
export class ExerciseInputDto {
  @IsUUID() exerciseId!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => SetInputDto)
  sets!: SetInputDto[];
}
export class WorkoutInputDto {
  @IsUUID() userId!: string;
  @IsDateString({ strict: true }) date!: string;
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @IsString() @MaxLength(2000) notes!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ExerciseInputDto)
  exercises!: ExerciseInputDto[];
}
