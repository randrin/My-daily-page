import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query('userId') userId?: string) {
    const tasks = await this.tasksService.findAll(userId);
    return toTaskListResponse(tasks);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    const task = await this.tasksService.findOne(id, userId);
    return toTaskResponse(task);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.tasksService.create(createTaskDto);
    return toTaskResponse(task);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksService.update(id, updateTaskDto);
    return toTaskResponse(task);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const task = await this.tasksService.remove(id);
    return toTaskResponse(task);
  }

  @Post(':id/reminders')
  async addReminder(
    @Param('id') taskId: string,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    const reminder = await this.tasksService.addReminder(
      taskId,
      createReminderDto,
    );
    return toReminderResponse(reminder);
  }

  @Patch(':id/reminders/:reminderId')
  async updateReminder(
    @Param('id') taskId: string,
    @Param('reminderId') reminderId: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    const reminder = await this.tasksService.updateReminder(
      taskId,
      reminderId,
      updateReminderDto,
    );
    return toReminderResponse(reminder);
  }

  @Delete(':id/reminders/:reminderId')
  async removeReminder(
    @Param('id') taskId: string,
    @Param('reminderId') reminderId: string,
  ) {
    const reminder = await this.tasksService.removeReminder(taskId, reminderId);
    return toReminderResponse(reminder);
  }
}
