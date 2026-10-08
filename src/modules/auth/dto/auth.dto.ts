import { IsEmail, IsIn, IsString, MaxLength, MinLength } from "class-validator";
export class CredentialsDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) @MaxLength(128) password!: string;
}
export class RegisterDto extends CredentialsDto {
  @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @IsIn(["TRAINER", "CLIENT"]) role!: "TRAINER" | "CLIENT";
}
