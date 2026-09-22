import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '+33600000000', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ example: '+33600000000', nullable: true })
  whatsappNumber: string | null;

  @ApiProperty({ example: 'Europe/Paris' })
  timezone: string;

  @ApiProperty()
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT d’accès (Authorize Swagger, header Bearer)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token opaque à envoyer à POST /auth/refresh',
  })
  refresh_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: 'Bearer';

  @ApiProperty({
    description: 'Durée de vie de l’access_token en secondes',
    example: 900,
  })
  expires_in: number;

  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}
