import { RegistrationData, Invoice, InvoiceStatus } from '../../../types/patient.types';
import { Knex } from 'knex';
import { FastifyInstance } from 'fastify';
import { PatientRepository } from '../PatientRepository';

interface QueryResult {
  pessoaId: number;
  nome: string;
  cpf: string;
  enderecoId?: number;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  zipCode?: string;
  addressType?: number;
  cityName?: string;
  stateName?: string;
  telefoneId?: number;
  ddd?: string;
  phoneNumber?: string;
  extension?: string;
  phoneTypeName?: string;
  email?: string;
}

export class SqlServerPatientRepository implements PatientRepository {
  /**
   * Consulta de dados cadastrais
   * @param tenantId - ID do tenant
   * @param cpf - CPF do paciente (opcional)
   * @param cardNumber - Número da carteirinha (opcional)
   * @param app - Instância do Fastify (opcional)
   * @returns Dados cadastrais do paciente
   */
  async getRegistrationData(
    _tenantId: string,
    cpf?: string,
    _cardNumber?: string,
    app?: FastifyInstance
  ): Promise<RegistrationData | null> {
    // Se tivermos acesso ao app, podemos usar a conexão real
    if (app) {
      try {
        const dbPool = await app.getDbPool(_tenantId);
        return await this.executeRealQuery(dbPool, cpf, _cardNumber);
      } catch (error) {
        console.error(`Failed to get database connection for tenant ${_tenantId}:`, error);
        throw new Error(`Database connection failed for tenant ${_tenantId}`);
      }
    }

    // Fallback: se não tiver app, retorna erro
    throw new Error('FastifyInstance is required for database access');
  }

  /**
   * Query real para SQL Server - implementação ativa
   */
  private async executeRealQuery(
    knex: Knex,
    cpf?: string,
    cardNumber?: string
  ): Promise<RegistrationData | null> {
    // Query principal para buscar dados da pessoa
    const query = knex('dbo.Pessoa as p')
      .leftJoin('dbo.EnderecoPessoa as ep', function () {
        this.on('p.AutoId', '=', 'ep.Pessoa')
          .andOnNull('ep.FimVigencia')
          .andOn('ep.ParaCorrespondencia', '=', knex.raw('1'));
      })
      .leftJoin('dbo.CidadePais as cp', 'ep.Cidade', 'cp.Codigo')
      .leftJoin('dbo.RegistroPessoa as rp', function () {
        this.on('p.AutoId', '=', 'rp.Pessoa').andOn('rp.Tipo', '=', knex.raw('10'));
      })
      .leftJoin('dbo.TelefonePessoa as tp', function () {
        this.on('p.AutoId', '=', 'tp.Pessoa').andOnNull('tp.FimVigencia');
      })
      .leftJoin('dbo.TipoTelefone as tt', 'tp.Tipo', 'tt.Codigo')
      .leftJoin('dbo.EmailPessoa as emp', function () {
        this.on('p.AutoId', '=', 'emp.Pessoa').andOnNull('emp.FimVigencia');
      })
      .select([
        // Dados da pessoa
        'p.AutoId as pessoaId',
        'p.Nome as nome',
        'p.Cnp as cpf',

        // Dados do endereço
        'ep.AutoId as enderecoId',
        'ep.Logradouro as street',
        'ep.NumLogradouro as number',
        'ep.ComplLogradouro as complement',
        'ep.Bairro as neighborhood',
        'ep.CEP as zipCode',
        'ep.Tipo as addressType',

        // Dados da cidade/estado
        'cp.Nome as cityName',
        'cp.UF as stateName',

        // Dados do telefone
        'tp.AutoId as telefoneId',
        'tp.DDD as ddd',
        'tp.Numero as phoneNumber',
        'tp.Ramal as extension',
        'tt.Nome as phoneTypeName',

        // Dados do email
        'emp.Email as email',
      ]);

    // Aplicar filtros baseados nos parâmetros informados
    if (cpf && cardNumber) {
      // Se ambos foram informados, usar OR
      query.where(function () {
        this.where('p.Cnp', cpf).orWhere('rp.Numero', cardNumber);
      });
    } else if (cpf) {
      query.where('p.Cnp', cpf);
    } else if (cardNumber) {
      // Buscar pelo número do registro (carteirinha) na tabela RegistroPessoa onde Tipo = 10
      query.where('rp.Numero', cardNumber);
    }

    console.log('SQL Query:', query.toString());

    const results = (await query) as QueryResult[];

    if (!results || results.length === 0) {
      return null;
    }

    // Processar os resultados para o formato esperado
    const patient = results[0];

    // Agrupar telefones únicos
    const phones = results
      .filter((r: QueryResult) => r.telefoneId && r.phoneNumber)
      .map((r: QueryResult) => ({
        type: r.phoneTypeName || 'Unknown',
        number: r.ddd && r.phoneNumber ? `+55 ${r.ddd} ${r.phoneNumber}` : r.phoneNumber || '',
      }))
      .filter((phone, index, self) => index === self.findIndex((p) => p.number === phone.number));

    // Montar resposta
    const registrationData: RegistrationData = {
      activeAddress: patient.enderecoId
        ? {
            type: patient.addressType === 1 ? 'Residencial' : 'Comercial',
            street: patient.street || '',
            number: patient.number || '',
            complement: patient.complement || undefined,
            neighborhood: patient.neighborhood || '',
            city: patient.cityName || '',
            state: patient.stateName || '',
            zipCode: patient.zipCode || '',
          }
        : undefined,
      activePhones: phones,
      email: patient.email || undefined,
    };

    return registrationData;
  }

  /**
   * Segunda via de boleto
   * @param tenantId - ID do tenant
   * @param cpf - CPF do paciente
   * @param cardNumber - Número da carteirinha
   * @returns Dados da fatura
   */
  async getInvoiceReplacement(
    _tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    _cardNumber?: string
  ): Promise<Invoice | null> {
    // const knex = await app.getDbPool(_tenantId);
    // Implementar a lógica de busca da fatura aqui
    return {
      barcode: '23791.12345 67890.123456 78901.234567 1 98765432101234',
      amount: 150.75,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      contractCode: `CNT-${_tenantId}-${cpf?.slice(-4)}`,
    };
  }

  /**
   * Status da guia
   * @param tenantId - ID do tenant
   * @param authorizationPassword - Senha de autorização
   * @returns Status da guia
   */
  async getGuideStatus(
    _tenantId: string,
    app: FastifyInstance,
    authorizationPassword: string
  ): Promise<InvoiceStatus | null> {
    if (!app) {
      throw new Error('FastifyInstance is required for database access');
    }

    const knex = await app.getDbPool(_tenantId);

    interface GuideQueryResult {
      guiaCodigo: string;
      ssParecer: number | null;
      ItemSolServicoParecer: number;
    }

    const query = knex('dbo.SolicitacaoServico as ss')
      .leftJoin('dbo.TipoParSolServico as tpss', 'ss.Parecer', 'tpss.Codigo')
      .select(
        'ss.Codigo as guiaCodigo',
        'ss.Parecer as ssParecer',
        knex.raw(`
          (SELECT COUNT(iss.ParecerAuditoria)
           FROM dbo.ItemSolServico iss
           WHERE iss.Solicitacao = ss.AutoId
           AND (iss.ParecerAuditoria = 2 OR iss.ParecerAuditoria IS NULL)) AS ItemSolServicoParecer
        `)
      )
      .where(function () {
        this.where('ss.Codigo', authorizationPassword).orWhere(
          'ss.CodigoDocumento',
          authorizationPassword
        );
      })
      .first();

    const result = (await query) as GuideQueryResult;

    if (!result) {
      return null; // Guia não encontrada
    }

    let status: InvoiceStatus['status'];

    // Implementar a lógica do CASE statement em TypeScript
    if (result.ssParecer === 2) {
      status = 'Denied'; // Negado(a)
    } else if (result.ssParecer === 1 && result.ItemSolServicoParecer === 0) {
      status = 'Authorized'; // Liberado(a) Totalmente
    } else if (result.ssParecer === 1 && result.ItemSolServicoParecer > 0) {
      status = 'Authorized'; // Liberado(a) Parcialmente (mapeado para Authorized)
    } else if (result.ssParecer === null && result.ItemSolServicoParecer === 0) {
      status = 'Under Audit'; // Em Auditoria
    } else {
      // Caso padrão para situações não mapeadas explicitamente
      status = 'Under Audit';
    }

    return {
      status: status,
    };
  }
}
