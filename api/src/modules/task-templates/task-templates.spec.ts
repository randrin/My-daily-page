import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TaskTemplate } from '../../entities/task-template.entity';
import {
  TaskTemplatesService,
  suggestTemplate,
} from './task-templates.service';
import {
  TemplateAiService,
  parseAiItems,
  templateProviderError,
} from './template-ai.service';
import { SaveTemplateDto, UpdateTemplateDto } from './dto/task-template.dto';

const item = { title: 'Préparer', dayOffset: 0, time: '09:00', enabled: true };
const input = { name: 'Voyage', description: '', enabled: true, items: [item] };
describe('personal task templates', () => {
  it('scopes reads and deletes to the authenticated owner', async () => {
    const repository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({ affected: 0 }),
    };
    const service = new TaskTemplatesService(
      repository as unknown as Repository<TaskTemplate>,
      {} as TemplateAiService,
    );
    await expect(
      service.update('other-id', 'me', input),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findOneBy).toHaveBeenCalledWith({
      id: 'other-id',
      userId: 'me',
    });
    await expect(service.remove('other-id', 'me')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.delete).toHaveBeenCalledWith({
      id: 'other-id',
      userId: 'me',
    });
  });
  it('requires items and rejects null patches, bad times and invalid offsets', async () => {
    for (const payload of [
      { ...input, items: [] },
      { ...input, items: [{ ...item, time: '26:00' }] },
      { ...input, items: [{ ...item, dayOffset: -1 }] },
    ]) {
      expect(
        (await validate(plainToInstance(SaveTemplateDto, payload))).length,
      ).toBeGreaterThan(0);
    }
    expect(
      (await validate(plainToInstance(UpdateTemplateDto, { items: null })))
        .length,
    ).toBeGreaterThan(0);
  });
  it('suggestions work locally without saving or calling an AI', () => {
    const result = suggestTemplate({ name: 'Voyage', description: '' });
    expect(result.source).toBe('guided');
    expect(result.items[0].title).toContain('documents');
    expect(result.items.map((i) => i.dayOffset)).toEqual([0, 1, 2]);
  });
  it('validates AI output before exposing it', async () => {
    const response = (items: unknown[]) => ({
      status: 'completed',
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: JSON.stringify({ items }) }],
        },
      ],
    });
    await expect(parseAiItems(response([item]))).resolves.toEqual([item]);
    await expect(
      parseAiItems(response([{ ...item, dayOffset: -1 }])),
    ).rejects.toThrow();
    await expect(
      parseAiItems(response([{ ...item, userId: 'other' }])),
    ).rejects.toThrow();
    await expect(
      parseAiItems({ status: 'incomplete', output: [] }),
    ).rejects.toThrow();
  });
  it('does not call provider or reserve quota when unconfigured', async () => {
    const query = jest.fn();
    const ai = new TemplateAiService(
      { get: () => undefined } as unknown as ConfigService,
      { query } as unknown as DataSource,
    );
    await expect(
      ai.suggest('me', { name: 'Voyage', description: '' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });
  it('blocks AI calls above the persistent daily quota', async () => {
    const ai = new TemplateAiService(
      { get: () => 'configured' } as unknown as ConfigService,
      { query: jest.fn().mockResolvedValue([]) } as unknown as DataSource,
    );
    await expect(
      ai.suggest('me', { name: 'Voyage', description: '' }),
    ).rejects.toMatchObject({ status: 429 });
  });
});

describe('template AI provider errors', () => {
  it('reports exhausted credits instead of a generic bad request', () => {
    const error = templateProviderError(429, {
      error: {
        code: 'credit_balance_exhausted',
        type: 'insufficient_quota',
        message: 'sensitive provider details',
      },
    });
    expect(error.getStatus()).toBe(503);
    expect(error.message).toContain('solde ou le quota');
    expect(error.message).not.toContain('sensitive');
  });
  it('distinguishes credentials, model, throttling and incompatible parameters', () => {
    expect(templateProviderError(401, {}).message).toContain('clé API');
    expect(templateProviderError(404, {}).message).toContain('modèle');
    expect(templateProviderError(429, {}).getStatus()).toBe(429);
    expect(templateProviderError(400, {}).getStatus()).toBe(502);
  });
  it('preserves the actionable error through the service catch', async () => {
    const mockedFetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'credit_balance_exhausted' } }),
          { status: 429 },
        ),
      );
    try {
      const ai = new TemplateAiService(
        { get: () => 'configured' } as unknown as ConfigService,
        {
          query: jest.fn().mockResolvedValue([{ requests: 1 }]),
        } as unknown as DataSource,
      );
      await expect(
        ai.suggest('me', { name: 'Voyage', description: '' }),
      ).rejects.toThrow('Le solde ou le quota API OpenAI est épuisé');
    } finally {
      mockedFetch.mockRestore();
    }
  });
});
