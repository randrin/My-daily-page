import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthUser } from '@common/types/auth-user';
import { TasksService } from './tasks.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  toReminderResponse,
  toTaskListResponse,
  toTaskResponse,
} from './task.mapper';

@ApiTags('tasks')
@ApiJwtAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les tâches de l’utilisateur' })
  async findAll(@CurrentUser() user: AuthUser) {
    const tasks = await this.tasksService.findAll(user.id);
    return toTaskListResponse(tasks);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une tâche' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const task = await this.tasksService.findOne(id, user.id);
    return toTaskResponse(task);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une tâche (rappels optionnels)' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(user.id, createTaskDto);
    return toTaskResponse(task);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une tâche' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.update(id, user.id, updateTaskDto);
    return toTaskResponse(task);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const task = await this.tasksService.remove(id, user.id);
    return toTaskResponse(task);
  }

  @Post(':id/reminders')
  @ApiOperation({ summary: 'Ajouter un rappel à une tâche' })
  async addReminder(
    @Param('id', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: AuthUser,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    const reminder = await this.tasksService.addReminder(
      taskId,
      user.id,
      createReminderDto,
    );
    return toReminderResponse(reminder);
  }

  @Patch(':id/reminders/:reminderId')
  @ApiOperation({ summary: 'Mettre à jour un rappel' })
  async updateReminder(
    @Param('id', ParseUUIDPipe) taskId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
    @CurrentUser() user: AuthUser,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    const reminder = await this.tasksService.updateReminder(
      taskId,
      reminderId,
      user.id,
      updateReminderDto,
    );
    return toReminderResponse(reminder);
  }

  @Delete(':id/reminders/:reminderId')
  @ApiOperation({ summary: 'Supprimer un rappel' })
  async removeReminder(
    @Param('id', ParseUUIDPipe) taskId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const reminder = await this.tasksService.removeReminder(
      taskId,
      reminderId,
      user.id,
    );
    return toReminderResponse(reminder);
  }
}
