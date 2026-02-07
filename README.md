# LinkedIn Manager

Plataforma AI-First para gestão completa de posicionamento no LinkedIn.

## 🚀 Funcionalidades

- ✅ **Dashboard de Métricas** - Acompanhamento de engajamento, alcance e performance
- ✅ **Gerador de Rascunhos com IA** - Criação automática de posts usando Groq AI
- ✅ **Editor Inteligente** - Refinamento de posts com assistente IA integrado
- ✅ **Preview LinkedIn** - Visualize como seu post ficará antes de publicar
- ✅ **Copy to Clipboard** - Copie posts prontos para publicar manualmente
- 🔄 **Planejamento Semanal** - (Em desenvolvimento)
- 🔄 **Publicação Automática** - (Em desenvolvimento)

## 🛠️ Tecnologias

- **React 19** + **Vite** - Framework e build tool
- **React Router** - Navegação
- **Zustand** - State management
- **Recharts** - Visualização de dados
- **Groq AI** - Geração de conteúdo (llama-3.1-70b)
- **Supabase** - Backend e database
- **Lucide React** - Ícones

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

## 🔑 Configuração

### 1. Supabase Setup

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API e copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon/public key` → `VITE_SUPABASE_ANON_KEY`

4. Execute o SQL abaixo no SQL Editor do Supabase:

```sql
-- Tabela de Posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Metas
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  target_posts INTEGER,
  target_engagement INTEGER,
  target_reach INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Métricas
CREATE TABLE metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Groq AI Setup

1. Crie uma conta em [console.groq.com](https://console.groq.com)
2. Gere uma API key
3. Adicione ao `.env`: `VITE_GROQ_API_KEY=your_key_here`

**Nota**: Groq oferece tier gratuito com 30 req/min, perfeito para o piloto!

## 🚀 Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📱 Uso

### 1. Dashboard
- Visualize métricas de engajamento
- Acompanhe metas semanais
- Veja posts recentes

### 2. Gerador de Rascunhos
- Escolha o tópico do post
- Selecione tom (profissional, casual, inspirador, educacional)
- Defina o tamanho (curto, médio, longo)
- Adicione contexto opcional
- Clique em "Gerar Rascunho com IA"

### 3. Editor de Posts
- Cole ou escreva seu post
- Use ações rápidas para refinamento
- Converse com o assistente IA
- Visualize preview do LinkedIn
- Copie para área de transferência
- Abra o LinkedIn para publicar

## 🎨 Design System

Baseado no design Deltax com:
- Gradientes purple/blue
- Cards com hover effects
- Tipografia Inter
- Componentes reutilizáveis
- Dark mode ready

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Card, Input)
│   ├── layout/          # Layout (Sidebar, Header, DashboardLayout)
│   ├── features/        # Features (MetricsCard)
│   └── charts/          # Gráficos (PerformanceChart)
├── pages/               # Páginas da aplicação
├── services/
│   ├── ai/             # Integração Groq AI
│   ├── linkedin/       # Serviços LinkedIn
│   └── storage/        # Supabase
├── stores/             # Zustand stores
├── styles/             # Design system
└── utils/              # Utilitários
```

## 🔮 Próximos Passos

- [ ] Implementar calendário de planejamento semanal
- [ ] Adicionar sistema de agendamento
- [ ] Integrar LinkedIn API para publicação automática
- [ ] Adicionar geração de hashtags
- [ ] Implementar análise de performance com IA
- [ ] Adicionar templates de posts
- [ ] Sistema de aprovação de posts

## 💰 Custo Estimado (Piloto)

- **Groq AI**: $0/mês (tier gratuito)
- **Supabase**: $0/mês (tier gratuito)
- **Vercel/Netlify**: $0/mês (tier gratuito)
- **Total**: $0/mês 🎉

## 📝 Licença

MIT

---

Desenvolvido com ❤️ usando React + Groq AI
