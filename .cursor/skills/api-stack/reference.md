# API Stack — Référence détaillée

## Créer un nouveau module

```bash
cd api
nest g module users
nest g controller users
nest g service users
```

Puis structurer :
- `dto/create-user.dto.ts` — validation
- `dto/update-user.dto.ts` — `PartialType(CreateUserDto)`
- Enregistrer dans `app.module.ts`

## Exemple module complet

```typescript
// users.module.ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }
}
```

## Ajouter une notification

```json
POST /notifications/send
{
  "channel": "email",
  "recipient": "user@example.com",
  "subject": "Rappel tâche",
  "body": "<p>Votre tâche est due demain</p>"
}
```

Channels : `email` | `sms` | `whatsapp`

## Prisma — ajouter un modèle

1. Éditer `prisma/schema.prisma`
2. `npm run prisma:migrate -- --name add_model`
3. `npm run prisma:generate`

## Tests

```bash
npm run test
npm run test:e2e
```
