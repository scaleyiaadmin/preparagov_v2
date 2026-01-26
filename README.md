
# PreparaGov - Sistema de Planejamento de Contratações Públicas

Sistema web completo para planejamento e gestão de contratações públicas conforme Lei 14.133/2021.

## 🚀 Funcionalidades

### Telas Principais
- **Dashboard**: Visão geral com indicadores e alertas
- **DFD**: Cadastro e gestão de Documentos de Formalização da Demanda
- **PCA**: Plano de Contratações Anual com cronograma
- **ETP**: Editor guiado para Estudo Técnico Preliminar
- **Mapa de Riscos**: Identificação e análise de riscos
- **Termo de Referência**: Editor colaborativo com modelos
- **Edital**: Geração automatizada de editais
- **Perfil**: Gerenciamento de usuário e configurações

### Recursos Especiais
- 🤖 **Geração por IA**: Conteúdo automático para documentos
- 📊 **Dashboards Interativos**: Métricas e indicadores em tempo real
- 📋 **Formulários Inteligentes**: Validação e preenchimento automático
- 📄 **Exportação**: PDF e Word para todos os documentos
- 🔔 **Notificações**: Alertas de prazos e pendências
- 📱 **Responsivo**: Interface adaptável para desktop e tablet

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router Dom
- **State**: React Query + React Hook Form
- **Icons**: Lucide React
- **Build**: Vite

## 🏃‍♂️ Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Acesso
- **Desenvolvimento**: http://localhost:8080
- **Usuário Padrão**: João Silva (joao.silva@gov.br)

## 📋 Funcionalidades Implementadas

### ✅ Navegação e Layout
- Menu lateral responsivo
- Navegação entre telas
- Header com notificações
- Logout funcional

### ✅ Dashboard
- Cards de estatísticas
- Lista de DFDs recentes
- Ações rápidas
- Indicadores visuais

### ✅ DFD (Documento de Formalização da Demanda)
- Formulário completo
- Validação de campos
- Geração automática por IA
- Upload de documentos (simulado)
- Lista e gestão de DFDs

### ✅ PCA (Plano de Contratações Anual)
- Visualização consolidada
- Cronograma por trimestre
- Exportação PDF (simulada)
- Resumo estatístico

### ✅ ETP (Estudo Técnico Preliminar)
- Editor em etapas (wizard)
- 8 seções estruturadas
- Geração automática por IA
- Barra de progresso
- Navegação entre etapas

### ✅ Mapa de Riscos
- Cadastro de riscos
- Classificação automática
- Matriz de probabilidade/impacto
- Planos de mitigação
- Geração de riscos por IA

### ✅ Termo de Referência
- Editor colaborativo
- Modelos pré-definidos
- Seções customizáveis
- Geração por IA
- Preview do documento
- Upload de anexos

### ✅ Geração de Edital
- Configuração de modalidades
- Seleção de cláusulas
- Escolha de anexos
- Preview em tempo real
- Exportação Word/PDF

### ✅ Perfil do Usuário
- Dados pessoais
- Alteração de senha
- Configurações de notificação
- Estatísticas de uso
- Logout

## 🎨 Design System

### Paleta de Cores
- **Primária**: Laranja (#ff6b35)
- **Secundária**: Branco (#ffffff)
- **Terciária**: Preto (#1a1a1a)
- **Neutros**: Cinzas para textos e backgrounds

### Componentes
- Cards responsivos
- Botões com estados
- Formulários estruturados
- Tabelas interativas
- Modals e popups
- Badges e indicadores

## 🔧 Dados Mockados

### Usuário Padrão
```json
{
  "nome": "João Silva Santos",
  "email": "joao.silva@gov.br",
  "cargo": "Analista de Contratações",
  "unidade": "Secretaria de Administração"
}
```

### DFDs de Exemplo
- Aquisição de Computadores Desktop
- Contratação de Consultoria em TI
- Reforma do Prédio Administrativo
- Serviços de Limpeza

### Conteúdo IA
- Justificativas técnicas
- Especificações detalhadas
- Análises de risco
- Cláusulas contratuais

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hamburger (preparado)

## 🔒 Simulações

### Autenticação
- Login automático (sem backend)
- Logout com redirecionamento
- Sessão persistente (localStorage)

### Documentos
- Geração de conteúdo por IA
- Upload de arquivos (memória)
- Exportação PDF/Word (simulada)
- Versionamento mockado

### Notificações
- Toasts informativos
- Alertas de validação
- Confirmações de ação
- Notificações de sucesso/erro

## 🎯 Casos de Uso

1. **Planejamento Anual**: Criação do PCA com cronograma
2. **Demanda Emergencial**: DFD → ETP → Edital em sequência
3. **Análise de Riscos**: Identificação e mitigação
4. **Documentação**: TR com modelos e IA
5. **Licitação**: Configuração e geração de edital

## 📊 Métricas Simuladas

- 23 DFDs criados
- 15 ETPs elaborados
- 8 Editais gerados
- 85% do PCA consolidado
- 12 Demandas pendentes

## 🔄 Fluxo de Trabalho

```
DFD → ETP → Mapa de Riscos → Termo de Referência → Edital
```

## 💡 Próximos Passos

Para implementação real:
1. Integração com backend
2. Autenticação JWT
3. Banco de dados PostgreSQL
4. API REST completa
5. Geração real de PDFs
6. Upload de arquivos
7. Integração com sistemas governamentais
8. Assinatura digital
9. Workflow de aprovação
10. Relatórios avançados
