import { FastifyInstance } from 'fastify';
import {
  MedicalGuidePaginatedResponse,
  PaginationMetadata,
  MedicalGuide,
} from '../../../types/guide.types';
import { GuideRepository } from '../GuideRepository';
import { HttpError } from '../../../errors/http.error';

// Constantes para tipos padrão
const DEFAULT_ADDRESS_TYPE = 'Professional';
const DEFAULT_PHONE_TYPE = 'Professional';
const MIN_PAGE = 1;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

// Tipo para os dados brutos do banco
interface DatabaseProfessionalRecord {
  name: string;
  specialty: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  ddd: string;
  phoneNumber: string;
}

export class SqlServerGuideRepository implements GuideRepository {
  async getMedicalGuide(
    tenantId: string,
    networkOption: string,
    page: number = 1,
    limit: number = 10,
    app?: FastifyInstance
  ): Promise<MedicalGuidePaginatedResponse> {
    this.validateInputs(tenantId, networkOption, page, limit);

    if (!app) {
      throw new HttpError(
        500,
        'FastifyInstance is required for database access',
        'Internal Server Error'
      );
    }

    const knex = await app.getDbPool(tenantId);

    // Query base para buscar os profissionais
    const baseQuery = knex('dbo.PrestadorServico as ps')
      .leftJoin('dbo.Pessoa as p', 'ps.Pessoa', 'p.AutoId')
      .leftJoin('dbo.ClassePrestador as cp', 'ps.Classe', 'cp.Codigo')
      .leftJoin('dbo.TipoPrestadorServico as tps', 'cp.Tipo', 'tps.Codigo')
      .leftJoin('dbo.EspecPrestador as ep_espec', 'ps.AutoId', 'ep_espec.Prestador')
      .leftJoin('dbo.EspecialidadeServico as es', 'ep_espec.Especialidade', 'es.AutoId')
      .leftJoin('dbo.EnderecoPessoa as ep', function () {
        this.on('p.AutoId', '=', 'ep.Pessoa').andOnNull('ep.FimVigencia');
      })
      .leftJoin('dbo.CidadePais as cidade', 'ep.Cidade', 'cidade.Codigo')
      .leftJoin('dbo.TelefonePessoa as tp', function () {
        this.on('p.AutoId', '=', 'tp.Pessoa').andOnNull('tp.FimVigencia');
      })
      .where('cp.Codigo', networkOption);

    // Contar total de registros
    const totalResult = await baseQuery.clone().countDistinct('ps.AutoId as total').first();

    const total = Number(totalResult?.total) || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Buscar profissionais com paginação
    const professionals = await baseQuery
      .select(
        'p.Nome as name',
        'es.Nome as specialty',
        'ep.Logradouro as street',
        'ep.NumLogradouro as number',
        'ep.ComplLogradouro as complement',
        'ep.Bairro as neighborhood',
        'cidade.Nome as city',
        'cidade.UF as state',
        'ep.CEP as zipCode',
        knex.raw(`CAST(tp.DDD AS VARCHAR(10)) as ddd`),
        knex.raw(`CAST(tp.Numero AS VARCHAR(20)) as phoneNumber`)
      )
      .limit(limit)
      .offset(offset);

    const data = professionals.map(this.mapDatabaseRecordToMedicalGuide);

    const pagination: PaginationMetadata = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      data,
      pagination,
    };
  }

  private validateInputs(
    tenantId: string,
    networkOption: string,
    page: number,
    limit: number
  ): void {
    if (!tenantId?.trim()) {
      throw new HttpError(400, 'Tenant ID is required', 'Bad Request');
    }

    if (!networkOption?.trim()) {
      throw new HttpError(400, 'Network option is required', 'Bad Request');
    }

    if (page < MIN_PAGE) {
      throw new HttpError(400, `Page must be at least ${MIN_PAGE}`, 'Bad Request');
    }

    if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
      throw new HttpError(
        400,
        `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
        'Bad Request'
      );
    }
  }

  private mapDatabaseRecordToMedicalGuide(record: DatabaseProfessionalRecord): MedicalGuide {
    return {
      name: record.name?.trim() || '',
      specialty: record.specialty?.trim() || '',
      address: {
        type: DEFAULT_ADDRESS_TYPE,
        street: record.street?.trim() || '',
        number: record.number?.trim() || '',
        complement: record.complement?.trim() || undefined,
        neighborhood: record.neighborhood?.trim() || '',
        city: record.city?.trim() || '',
        state: record.state?.trim() || '',
        zipCode: record.zipCode?.trim() || '',
      },
      phone: {
        type: DEFAULT_PHONE_TYPE,
        number: this.formatPhoneNumber(record.ddd, record.phoneNumber),
      },
    };
  }

  private formatPhoneNumber(ddd: string, phoneNumber: string): string {
    const cleanDdd = ddd?.trim();
    const cleanPhone = phoneNumber?.trim();

    if (!cleanDdd || !cleanPhone) {
      return '';
    }

    return `+55 ${cleanDdd} ${cleanPhone}`;
  }
}
