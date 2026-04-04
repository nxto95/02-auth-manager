export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface IJwtPayload {
  sub: string;
  role: UserRole;
}

export type AccessToken = string;
export type RefreshToken = string;

export interface JwtRefreshUser {
  sub: string;
  role: UserRole;
  refreshToken: string;
}
