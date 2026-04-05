import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '../../types';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!roles) return true;

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as { role: UserRole };
    return roles.includes(user?.role);
  }
}
