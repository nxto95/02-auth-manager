import { NormalizeString } from '.';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @NormalizeString()
  @IsString()
  @IsOptional()
  @Length(2, 55)
  username?: string;
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
