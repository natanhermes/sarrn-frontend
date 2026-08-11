
## Cronograma de Desenvolvimento Frontend (Absolute Zero)

* **Fase 1: Infraestrutura Core e Autenticação.** Inicialização do projeto, configuração do cliente HTTP resiliente (interceptors para Refresh Token), gerenciamento de estado (Zustand) e a construção da tela de Login funcional.
* **Fase 2: Layout Administrativo e Fundações.** Criação do esqueleto do painel (Sidebar responsiva, proteção de rotas) e implementação dos CRUDs mais diretos (Usuários, Categorias e Configurações Globais).
* **Fase 3: Motor de Conteúdo e Mídias.** O núcleo do CMS. Implementação do editor Rich Text, pipeline de upload de imagens (integrando com nosso backend de WebP) e o CRUD de Projetos/Notícias aplicando o RBAC e as regras do `CONTRIBUTOR`.
* **Fase 4: A Vitrine Pública (SSG/ISR).** Construção do layout aberto ao público (Header/Footer), consumindo as APIs sem token. Integração das métricas dinâmicas na Home, listagens otimizadas para SEO e páginas de detalhe do projeto.
