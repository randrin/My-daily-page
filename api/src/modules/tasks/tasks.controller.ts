import { CreateTaskListDto } from './dto/create-task-list.dto';
import { TaskConflictsQueryDto } from './dto/task-conflicts-query.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiJwtAuth } from '@common/decorators/api-jwt-auth.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthUser } from '@common/types/auth-user';
import { TaskNotesService } from './task-notes.service';
import { CreateTaskNoteDto } from './dto/create-task-note.dto';
import { TasksService } from './tasks.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { TasksRangeQueryDto } from './dto/tasks-range-query.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  toReminderResponse,
  toTaskPageResponse,
  toTaskRangeResponse,
  toTaskResponse,
} from './task.mapper';

@ApiTags('tasks')
@ApiJwtAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskNotes: TaskNotesService,
  ) {}

  @Post('lists')
  @ApiOperation({ summary: 'Créer une liste de tâches datées en une transaction' })
  createList(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskListDto) {
    return this.tasksService.createList(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les tâches de l’utilisateur (filtres + pagination)',
  })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListTasksQueryDto,
  ) {
    const page = await this.tasksService.findAll(user.id, query);
    return toTaskPageResponse(page);
  }

  @Get('conflicts')
  @ApiOperation({
    summary: 'Prévenir des tâches actives prévues à la même minute',
  })
  findConflicts(
    @CurrentUser() user: AuthUser,
    @Query() query: TaskConflictsQueryDto,
  ) {
    return this.tasksService.findConflicts(
      user.id,
      query.deadline,
      query.excludeId,
    );
  }

  @Get('today')
  @ApiOperation({
    summary:
      'Page du jour : trois tâches prioritaires dans le fuseau utilisateur',
  })
  async findToday(@CurrentUser() user: AuthUser) {
    const result = await this.tasksService.findToday(user.id);
    return { ...result, items: result.items.map(toTaskResponse) };
  }

  @Get('in-range')
  @ApiOperation({
    summary: 'Lister les tâches sur une période d’échéance (deadline)',
    description:
      '`from` et `to` sont optionnels. Sans bornes, toutes les tâches de l’utilisateur sont renvoyées (max 500).',
  })
  async findInRange(
    @CurrentUser() user: AuthUser,
    @Query() query: TasksRangeQueryDto,
  ) {
    const result = await this.tasksService.findInRange(user.id, query);
    return toTaskRangeResponse(result);
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

  @Get(':id/notes')
  @ApiOperation({
    summary: 'Lister les notes d’une tâche, les plus récentes en premier',
  })
  async listNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.taskNotes.list(id, user.id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Ajouter une note à une tâche' })
  async addNote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTaskNoteDto,
  ) {
    return this.taskNotes.create(id, user.id, dto);
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
