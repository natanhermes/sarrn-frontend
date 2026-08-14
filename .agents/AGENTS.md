# Diretrizes Arquiteturais Frontend - Portal & CMS

Especialista em React, Next.js 15 (App Router), Tailwind CSS, Zod e TanStack Query.
Esta é a fonte de verdade para a arquitetura frontend do projeto. O projeto é dividido em dois ecossistemas dentro do Next.js: `app/(public)` para a Vitrine (SSR/SSG) e `app/(admin)` para o Painel (CSR).

## [MANDATÓRIO] Estrutura e Workflow
1. **Separação de Renderização:** 
   - `app/(public)` (Vitrine): Foco em SEO, utilizando Server Components e `fetch` nativo. **O cache é estritamente controlado por On-Demand Revalidation via Tags.**
   - `app/(admin)` (Painel): Client Components (`"use client"`), consumindo a API via `TanStack Query` protegido por JWT.
2. **Schema-First (Zod):** Toda *feature* inicia pela definição do Schema Zod em `src/schemas/`.
3. **Fronteira de Dados e UI:** Estilize exclusivamente com Tailwind CSS e utilize componentes do `shadcn/ui`.
4. **Formulários:** Utilize `react-hook-form` com `zodResolver`.
5. **URL como Estado (Painel):** Filtros e paginação no painel devem refletir na URL (Search Params).
6. **Resiliência de Sessão (Refresh Token):** O cliente HTTP DEVE ter um interceptor que, ao receber `401`, chama silenciosamente a rota `/admin/auth/refresh-token` e refaz a requisição original.
7. **Tratamento de Falhas (Server Components):** Componentes de layout globais (Header, Footer) DEVEM envolver chamadas de API em `try/catch` e renderizar graciosamente em caso de erro, evitando derrubar a aplicação se a API falhar.

## [PROIBIDO] Práticas Vetadas
1. **PROIBIDO usar ISR baseado em tempo:** NUNCA utilize `revalidate: N` ou `cache: 'no-store'` em rotas públicas estáticas. Use exclusivamente Cache Tags (`next: { tags: ['nome-da-tag'] }`).
2. **PROIBIDO** utilizar `useEffect` para fetch em páginas públicas. Use Server Components.
3. **PROIBIDO** acoplar regras de negócio em componentes visuais.
4. **PROIBIDO** utilizar `useState` para paginação/busca. Use a URL.
5. **PROIBIDO** armazenar o token JWT no `localStorage`. Utilize Cookies.

## 🛠️ Fetching Público (On-Demand Cache via Tags)

### Exemplo de Fetch Padrão
```tsx
// ✅ PADRÃO OURO: Fetch com tag específica para webhook
async function getProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/posts?type=PROJECT`, { 
    next: { tags: ['projetos'] } // Tag exata correspondente ao módulo
  });
  if (!res.ok) throw new Error('Falha ao carregar projetos');
  return res.json();
}
```
