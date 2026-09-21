import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JWT_AUTH_NAME } from '../../docs/swagger';

export function ApiJwtAuth() {
  return applyDecorators(
    ApiBearerAuth(JWT_AUTH_NAME),
    ApiUnauthorizedResponse({
      description: 'Token JWT manquant, expiré ou invalide',
    }),
  );
}
