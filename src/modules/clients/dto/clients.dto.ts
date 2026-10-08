import { IsEmail } from "class-validator";
export class LinkClientDto {
  @IsEmail() email!: string;
}
