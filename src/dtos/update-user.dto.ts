import { NormalizeString } from '.';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @NormalizeString()
  @IsString()
  @IsOptional()
  @Length(2, 55)
  username?: string;
}
