import { TemplateAiService } from './template-ai.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskTemplate } from '../../entities/task-template.entity';
import {
  SaveTemplateDto,
  SuggestTemplateDto,
  UpdateTemplateDto,
} from './dto/task-template.dto';

export function suggestTemplate(input: SuggestTemplateDto) {
  const subject = `${input.name} ${input.description}`.toLocaleLowerCase('fr');
  const titles = /voyage|vacances|séjour/.test(subject)
    ? [
        'Vérifier les documents de voyage',
        'Confirmer les réservations',
        'Préparer les bagages',
      ]
    : /paie|budget|facture/.test(subject)
      ? [
          'Vérifier les revenus et justificatifs',
          'Régler les factures',
          'Mettre à jour le budget',
        ]
      : /rentrée|école|scolaire/.test(subject)
        ? [
            'Vérifier les inscriptions',
            'Acheter les fournitures',
            'Préparer le planning',
          ]
        : /déménagement|demenagement/.test(subject)
          ? [
              'Préparer les cartons',
              'Organiser le transport',
              'Effectuer les changements d’adresse',
              'Vérifier le nouveau logement',
            ]
          : /réunion|reunion|événement|evenement/.test(subject)
            ? [
                'Définir le programme',
                'Confirmer les participants',
                'Préparer les documents',
                'Faire le bilan',
              ]
            : [
                `Définir les étapes : ${input.name}`,
                `Préparer les ressources : ${input.name}`,
                `Réaliser et vérifier : ${input.name}`,
              ];
  return {
    source: 'guided' as const,
    items: titles.map((title, dayOffset) => ({
      title: title.slice(0, 255),
      dayOffset,
      time: '09:00',
      enabled: true,
    })),
  };
}

@Injectable()
export class TaskTemplatesService {
  constructor(
    @InjectRepository(TaskTemplate)
    private readonly repository: Repository<TaskTemplate>,
    private readonly ai: TemplateAiService,
  ) {}
  findAll(userId: string) {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id: string, userId: string) {
    const template = await this.repository.findOneBy({ id, userId });
    if (!template) throw new NotFoundException('Modèle introuvable');
    return template;
  }
  create(userId: string, input: SaveTemplateDto) {
    return this.repository.save(this.repository.create({ ...input, userId }));
  }
  async update(id: string, userId: string, input: UpdateTemplateDto) {
    const template = await this.findOne(id, userId);
    return this.repository.save(Object.assign(template, input));
  }
  async remove(id: string, userId: string) {
    const result = await this.repository.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('Modèle introuvable');
    return { success: true };
  }
  config() {
    return { aiEnabled: this.ai.enabled() };
  }
  suggest(userId: string, input: SuggestTemplateDto) {
    return input.mode === 'ai'
      ? this.ai.suggest(userId, input)
      : suggestTemplate(input);
  }
}
