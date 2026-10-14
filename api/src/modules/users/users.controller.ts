import { ForbiddenException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { AdminGuard } from '../admin/admin.guard';
import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les utilisateurs (administration)',
  })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => u.toSafeJSON());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un utilisateur (sans mot de passe)' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return user.toSafeJSON();
  }

  @Post()
  @ApiOperation({
    summary:
      'Route de mutation historique désactivée ; utiliser les parcours audités',
  })
  create() {
    throw new ForbiddenException(
      'Route historique désactivée. Utiliser les parcours de compte et d’administration audités.',
    );
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Route de mutation historique désactivée' })
  update() {
    throw new ForbiddenException(
      'Route historique désactivée. Utiliser les parcours de compte et d’administration audités.',
    );
  }
  @Delete(':id')
  @ApiOperation({
    summary:
      'Suppression administrative non disponible avant son workflow audité',
  })
  remove() {
    throw new ForbiddenException('Suppression administrative non disponible.');
  }
}
