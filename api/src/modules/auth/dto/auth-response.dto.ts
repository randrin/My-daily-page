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
    description: 'JWT à coller dans Authorize (sans préfixe Bearer)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}
