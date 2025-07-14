import { FastifyInstance } from 'fastify';
import { MedicalGuide } from '../../../types/guide.types';
import { GuideRepository } from '../GuideRepository';

export class MockGuideRepository implements GuideRepository {
  private mockedProfessionals: MedicalGuide[] = [
    {
      name: 'Dr. Ana Silva',
      specialty: 'Cardiologia',
      address: 'Rua Exemplo, 123, Centro, Cidade, Estado',
      phone: '+55 11 98765-4321',
    },
    {
      name: 'Hospital Central',
      specialty: 'Hospital Geral',
      address: 'Av. Principal, 456, Bairro, Cidade, Estado',
      phone: '+55 11 12345-6789',
    },
    {
      name: 'Laboratório Teste',
      specialty: 'Análises Clínicas',
      address: 'Rua da Amostra, 789, Bairro, Cidade, Estado',
      phone: '+55 11 23456-7890',
    },
    {
      name: 'Clínica Bem Estar',
      specialty: 'Clínica Geral',
      address: 'Av. Secundária, 101, Bairro, Cidade, Estado',
      phone: '+55 11 34567-8901',
    },
    {
      name: 'Dra. Carla Souza',
      specialty: 'Psicologia',
      address: 'Rua da Paz, 202, Bairro, Cidade, Estado',
      phone: '+55 11 45678-9012',
    },
  ];

  async getMedicalGuide(
    _tenantId: string,
    _networkOption: string,
    _app?: FastifyInstance
  ): Promise<MedicalGuide[]> {
    // const knex = await _app.getDbPool(_tenantId);
    // return knex.select('*').from('professionals').where({ network_option: _networkOption });
    return Promise.resolve(this.mockedProfessionals);
  }
}
