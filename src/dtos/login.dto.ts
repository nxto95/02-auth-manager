import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { NormalizeString } from '.';

export class LoginDto {
  @NormalizeString()
  @IsEmail()
  email: string;
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  password: string;
}
