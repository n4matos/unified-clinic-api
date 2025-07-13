import { RegistrationData, Invoice, InvoiceStatus } from '../types/patient.types';
import { Knex } from 'knex';
import { FastifyInstance } from 'fastify';

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

export class PatientRepository {
  /**
   * Consulta de dados cadastrais
   * @param tenantId - ID do tenant
   * @param cpf - CPF do paciente (opcional)
   * @param cardNumber - Número da carteirinha (opcional)
   * @param app - Instância do Fastify (opcional)
   * @returns Dados cadastrais do paciente
   */
  async getRegistrationData(
    tenantId: string,
    cpf?: string,
    cardNumber?: string,
    app?: FastifyInstance
  ): Promise<RegistrationData> {
    // Se tivermos acesso ao app, podemos usar a conexão real
    if (app) {
      try {
        const dbPool = await app.getDbPool(tenantId);
        return await this.executeRealQuery(dbPool, cpf, cardNumber);
      } catch (error) {
        console.error(`Failed to get database connection for tenant ${tenantId}:`, error);
        throw new Error(`Database connection failed for tenant ${tenantId}`);
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
  ): Promise<RegistrationData> {
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
        this.on('p.AutoId', '=', 'emp.Pessoa')
          .andOnNull('emp.FimVigencia')
          .andOn('emp.EnviarEmail', '=', knex.raw('1'));
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
      throw new Error('Patient not found');
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
            type: patient.addressType === 1 ? 'Residential' : 'Commercial',
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
  async getInvoiceReplacement(_tenantId: string, _cpf: string, _cardNumber: string): Promise<Invoice> {
    // Mock data - em produção, faria consulta no banco de dados do tenant
    return {
      barcode: '23791.12345 67890.123456 78901.234567 1 98765432101234',
      amount: 150.75,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      contractCode: `CNT-${_tenantId}-${_cpf.slice(-4)}`,
    };
  }

  /**
   * Status da guia
   * @param tenantId - ID do tenant
   * @param authorizationPassword - Senha de autorização
   * @returns Status da guia
   */
  async getGuideStatus(_tenantId: string, _authorizationPassword: string): Promise<InvoiceStatus> {
    // Mock data - em produção, faria consulta no banco de dados do tenant
    const statuses: InvoiceStatus['status'][] = ['Authorized', 'Under Audit', 'Denied'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status: randomStatus,
    };
  }
}
