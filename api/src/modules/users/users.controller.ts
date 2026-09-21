import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les utilisateurs (legacy, non protégé)',
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
  @ApiOperation({ summary: 'Créer un utilisateur (préférer POST /auth/register)' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return user.toSafeJSON();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return user.toSafeJSON();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    return user.toSafeJSON();
  }
}
