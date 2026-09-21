# API Stack — Patterns

## TypeORM — entité

```ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
```

## Module + repository

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
  ) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.tasks.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: { category: true, reminders: true },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasks.findOne({ where: { id, userId } });
    if (!task) throw new NotFoundException(`Task "${id}" not found`);
    return task;
  }
}
```

## JWT

```ts
// auth.service.ts — login
const user = await this.users.findByEmail(dto.email);
if (!user || !(await bcrypt.compare(dto.password, user.password))) {
  throw new UnauthorizedException('Invalid credentials');
}
const access_token = await this.jwt.signAsync({
  sub: user.id,
  email: user.email,
});
return { access_token, user: user.toSafeJSON() };
```

```ts
@Controller('tasks')
@ApiTags('tasks')
@ApiJwtAuth()
@UseGuards(JwtAuthGuard)
export class TasksController {
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.tasksService.findAll(user.id);
  }
}
```

Swagger : `setupSwagger(app)` dans `main.ts`, UI sur `/docs`. `PartialType` / `OmitType` depuis `@nestjs/swagger`.

```ts
// common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as { id: string; email: string };
  },
);
```

## DTO — class-validator + class-transformer

```ts
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @Transform(({ value }) => fromClientStatus(value))
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
```

User JSON : `@Exclude() password` + `ClassSerializerInterceptor`, ou `toSafeJSON()`.

## Notifications (BullMQ)

```ts
await this.notificationQueue.add('send', {
  reminderId: reminder.id,
  channel: dto.channel,
  recipient: dto.recipient,
  subject: dto.subject,
  body: dto.body,
});
```

Providers dans `notifications/providers/` uniquement.

## Tests Jest

```ts
describe('TasksService', () => {
  it('ne renvoie pas une tâche d\'un autre user', async () => {
    await expect(service.findOne('task-id', 'other-user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
```

e2e : register → login → `Authorization: Bearer` → CRUD tâche (`test/*.e2e-spec.ts`).

## Nouveau module

```bash
cd api
nest g module modules/notes
nest g controller modules/notes
nest g service modules/notes
```

Puis : entité TypeORM, `dto/`, `TypeOrmModule.forFeature`, `JwtAuthGuard`, `@ApiTags` + `@ApiJwtAuth()`.
