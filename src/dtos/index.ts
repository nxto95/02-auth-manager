import { Transform } from 'class-transformer';
export * from './create-user.dto';
export * from './update-user.dto';
export * from './login.dto';
export function NormalizeString() {
  return Transform(({ value }): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}
