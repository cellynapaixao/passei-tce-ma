# Passei TCE-MA

Uma aplicação web moderna construída com TypeScript, React e TanStack Start para auxiliar com o TCE-MA (Tribunal de Contas do Estado - Maranhão).

## 🚀 Tecnologias

- **Frontend Framework**: [TanStack Start](https://tanstack.com/start)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CVA
- **Database**: PostgreSQL (Supabase)
- **Component Library**: Radix UI + shadcn/ui
- **Form Handling**: React Hook Form + Zod
- **State Management**: TanStack React Query
- **Routing**: TanStack React Router
- **Build Tool**: Vite

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (para desenvolvimento)

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/cellynapaixao/passei-tce-ma.git
cd passei-tce-ma

# Instale as dependências
npm install
```

## 📝 Scripts Disponíveis

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Build em modo desenvolvimento
npm run build:dev

# Preview da build
npm run preview

# Lint do código
npm run lint

# Formatar código com Prettier
npm run format
```

## 🎨 Componentes

O projeto utiliza componentes de UI de alta qualidade:

- Accordion, Alert Dialog, Avatar
- Checkbox, Dialog, Dropdown Menu
- Select, Slider, Tabs, Toggle
- Navigation Menu, Popover, Progress
- Scroll Area, Separator, Tooltip
- E muitos mais...

## 🗄️ Banco de Dados

O projeto usa PostgreSQL via Supabase. A estrutura do banco incluir:

- Migrations em PL/pgSQL
- Schemas e tipos customizados

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Estrutura do Projeto

```
src/
├── app/              # Aplicação principal
├── components/       # Componentes reutilizáveis
├── pages/           # Páginas da aplicação
├── lib/             # Utilitários e helpers
└── server/          # API e lógica do servidor
```

## 🚀 Deploy

O projeto está configurado para ser hospedado na Lovable (nota: evite reescrever histórico de commits para manter sincronização com Lovable).

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado.

## 📧 Contato

- GitHub: [@cellynapaixao](https://github.com/cellynapaixao)

---

**Nota**: Este projeto é sincronizado com [Lovable](https://lovable.dev). Evite fazer rebase, amend ou squash de commits já realizados no push para manter o histórico consistente.
