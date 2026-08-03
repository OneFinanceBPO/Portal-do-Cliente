'use client';

import Tour, { TourStep } from './tour';

const STEPS: TourStep[] = [
  {
    id: 'boas-vindas',
    titulo: 'Bem-vindo ao Portal One Finance',
    descricao: 'Este é o painel de gerenciamento onde você administra clientes e usuários do portal.',
  },
  {
    id: 'busca',
    target: 'busca-cliente',
    titulo: 'Busca em tempo real',
    descricao: 'Use este campo para encontrar clientes pelo nome, CNPJ ou segmento. Os resultados são destacados automaticamente.',
  },
  {
    id: 'novo-cliente',
    target: 'novo-cliente',
    titulo: 'Adicionar clientes',
    descricao: 'Clique aqui para cadastrar um novo cliente. Preencha nome, CNPJ e segmento para começar.',
  },
  {
    id: 'gestao-perfis',
    target: 'gestao-perfis',
    titulo: 'Gestão de perfis',
    descricao: 'Gerencie os usuários que têm acesso ao portal. Defina senhas, tipo de acesso e quais empresas cada usuário pode ver.',
    posicao: 'right',
  },
  {
    id: 'sincronizacao',
    target: 'sync-badge',
    titulo: 'Sincronização',
    descricao: 'O badge de sincronização mostra o status da conexão com o GitHub. Clique nele para configurar o token ou Worker.',
  },
];

export default function GerenciamentoTour() {
  return <Tour steps={STEPS} storageKey="tour_gerenciamento_v1" />;
}