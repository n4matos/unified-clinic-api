import { FastifyInstance } from 'fastify';
import { MedicalGuidePaginatedResponse, PaginationMetadata } from '../../../types/guide.types';
import { GuideRepository } from '../GuideRepository';

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
    _tenantId: string,
    networkOption: string,
    page: number = 1,
    limit: number = 10,
    app?: FastifyInstance
  ): Promise<MedicalGuidePaginatedResponse> {
    if (!app) {
      throw new Error('FastifyInstance is required for database access');
    }

    const knex = await app.getDbPool(_tenantId);

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
    const totalResult = await baseQuery
      .clone()
      .countDistinct('ps.AutoId as total')
      .first();

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

    const data = professionals.map((prof: DatabaseProfessionalRecord) => ({
      name: prof.name || '',
      specialty: prof.specialty || '',
      address: {
        type: 'Professional', // Tipo padrão para endereços profissionais
        street: prof.street || '',
        number: prof.number || '',
        complement: prof.complement || undefined,
        neighborhood: prof.neighborhood || '',
        city: prof.city || '',
        state: prof.state || '',
        zipCode: prof.zipCode || '',
      },
      phone: {
        type: 'Professional', // Tipo padrão para telefones profissionais
        number: prof.ddd && prof.phoneNumber ? `+55 ${prof.ddd} ${prof.phoneNumber}`.trim() : '',
      },
    }));

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
}
