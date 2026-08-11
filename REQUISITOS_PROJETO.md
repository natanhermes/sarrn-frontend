# Documentação de Requisitos e Arquitetura - Portal Institucional 

## 1. Visão Geral do Projeto
Desenvolvimento de um Portal Institucional focado na atração de parceiros e captação de recursos, acompanhado de um Painel Administrativo (Headless CMS) customizado para gestão otimizada de conteúdo, mitigação de erros operacionais e excelência em SEO.

---

## 2. Arquitetura e Stack Tecnológica
A arquitetura segue o padrão **Decoupled (Headless CMS)** para garantir segurança no backend e performance extrema no frontend.

*   **Frontend (Vitrine Pública):** React com Next.js (SSG/ISR) e Tailwind CSS. Foco em SEO e Web Vitals.
*   **Frontend (Painel Administrativo):** React (Next.js em modo SPA/Client-Side) e Tailwind CSS. Protegido via JWT.
*   **Backend (API Restful):** Java 21 com Spring Boot 4.1. Aplicação de Clean Architecture e DDD para isolamento das regras de negócio.
*   **Banco de Dados:** PostgreSQL (Relacional).
*   **Infraestrutura Sugerida:** Vercel (Frontend) e Docker em VPS/Cloud (Backend).

---

## 3. Requisitos Não Funcionais (RNFs)
*   **RNF01 (Performance):** Largest Contentful Paint (LCP) da Vitrine deve ser < 2.5s em conexões 4G, garantido pelo uso de SSG e otimização de imagens (`next/image`).
*   **RNF02 (Segurança/Autenticação):** API Stateless utilizando JWT (JSON Web Tokens) com expiração curta e rotatividade.
*   **RNF03 (Resiliência de Upload):** Limite de payload de 10MB por requisição de mídia. Obrigatória validação de MIME Type via *magic numbers* no servidor para prevenir *spoofing* de executáveis.
*   **RNF04 (Responsividade):** Interface 100% *Mobile-First*, garantindo que a publicação de conteúdo possa ser feita via smartphone sem quebras de layout.
*   **RNF05 (Sessão Contínua):** Implementação de Refresh Token com rotação automática. O frontend deve renovar a sessão silenciosamente ao receber status 401, garantindo que o usuário não perca o trabalho não salvo no painel.


---

## 4. Épicos e Histórias de Usuário (Com Regras de Negócio)

### Épico 1: Portal Institucional (A "Vitrine")
*Foco: Velocidade, conversão e descoberta de conteúdo.*

*   **US01:** Visualizar carrossel de destaques na Home.
*   **US02:** Visualizar blocos de impacto (métricas) na Home.
*   **US03:** Acessar listagem visual de Projetos em andamento ou executados.
*   **US04:** Filtrar Projetos por área de atuação (Categoria) ou status.
*   **US05:** Acessar página detalhada do Projeto (Objetivos, Financiador, Duração, Valor, Galeria).
*   **US06:** Acessar página de listagem de Notícias visualizando *cards* padronizados (imagem, data, categoria, resumo).
    *   *RN16 (Resumo Automático):* Se não houver resumo manual, extrair os primeiros 150 caracteres do texto rico, sem tags HTML.
*   **US07:** Baixar documentos de Transparência Institucional (PDFs).
*   **US08:** Acessar página estática "Quem Somos".
*   **US09:** Preencher formulário de contato corporativo/parcerias.
*   **US10:** Acessar modal de doação (PIX Copia e Cola / QR Code em tempo real).
*   **US11:** Visualizar CTAs (Call to Actions) para doação distribuídos estrategicamente.
*   **US23:** Visualizar cards de pré-visualização ricos (Open Graph) ao compartilhar links nas redes sociais.
*   **US28:** Acessar listagens dedicadas de Publicações Ricas (Cartilhas e Documentos).
*   **US29:** Acessar detalhe da Publicação e fazer download do anexo em um botão padronizado.
    *   *RN14:* O botão "Baixe Aqui" não fica no HTML do texto, é renderizado dinamicamente caso exista um `attachment_url` no registro.
*   **US32:** Ter acesso a uma barra flutuante global com ícones das redes sociais da instituição.
*   **US33:** Como Administrador, eu quero gerenciar os usuários e definir seus níveis de acesso no sistema baseado em um modelo RBAC granular:
    RN (Roles): ADMIN (acesso total), EDITOR (acesso total a conteúdo e mídia), e CONTRIBUTOR (acesso restrito).
    RN (Regra do Contributor): Usuários CONTRIBUTOR (Estagiários/Voluntários) só podem editar e excluir publicações das quais são autores. Eles são bloqueados de publicar (status forçado para DRAFT).

### Épico 2: Painel Administrativo (Headless CMS)
*Foco: Governança de dados, usabilidade e automação de rotinas.*

**Módulo: Autenticação e Gestão de Equipe**
*   **US12:** Fazer login com e-mail e senha.
    *   *RN09:* Lockout de 15 minutos após 5 tentativas falhas.
*   **US13:** Recuperação de senha autônoma.
    *   *RN10:* Senha mínima de 8 caracteres (maiúscula, número, caractere especial).
*   **US33 (Nova):** Como Administrador, eu quero convidar novos usuários e definir seus níveis de acesso (Admin ou Editor).

**Módulo: Gestão de Mídias e Configurações**
*   **US14:** Gerenciar imagens do carrossel da Home.
*   **US17:** Upload de imagens de Capa e Galerias com crop/redimensionamento automático.
    *   *RN01:* Restrição para `.jpg`, `.jpeg`, `.png`, `.webp`.
    *   *RN02:* Conversão server-side compulsória para `.webp`.
    *   *RN03:* Crop automático (ex: 16:9) a partir do centro.
*   **US21:** Upload de documentos em PDF para a área de Transparência.
    *   *RN11/RN12:* Verificação de MIME Type obrigatória e limite de 20MB.
*   **US22:** Atualizar chave PIX, nome do recebedor e links das redes sociais.

**Módulo: Gestão de Entidades (Projetos, Notícias e Cartilhas)**
*   **US16 / US19 / US30:** Cadastrar publicações (Projetos, Notícias, Cartilhas) utilizando editor Rich Text (WYSIWYG).
    *   *RN04 (Sanitização):* Limpeza de tags maliciosas (`<script>`, `<iframe>` não autorizados) no backend.
    *   *RN13 (Entidade Única):* Tratamento das publicações como uma entidade central `Post` com discriminador de `type`.
    *   *RN18 (Responsividade):* Mídias dentro do texto rico devem ter `max-w-full`.
*   **US18:** Excluir publicações.
    *   *RN02 (Soft Delete):* Exclusão lógica (`deleted_at`) para manter integridade relacional.
*   **US20:** Agendar publicações.
    *   *RN03:* Registros com `published_at` no futuro recebem status `SCHEDULED` e não são listados na API pública.
*   **US34 (Nova):** Cadastrar Financiadores (Nome e Logo) para vinculação a Projetos.

**Módulo: Home e Impacto**
*   **US15:** Gerenciar Blocos de Impacto na Home.
    *   *RN (Cálculo Dinâmico):* Se a métrica for dinâmica, o backend ignora o valor digitado e calcula em tempo real. Opções suportadas: TOTAL_PROJECTS, TOTAL_ONGOING_PROJECTS, TOTAL_COMPLETED_PROJECTS, TOTAL_NEWS, TOTAL_FUNDERS.

### Épico 3: Automações de SEO e Descoberta
*   **US24:** Geração automática de meta-tags (Open Graph/Twitter) baseadas no conteúdo, com *fallback* automático do texto limpo (*RN07*).
*   **US25:** Geração automática de `sitemap.xml` e `robots.txt`.
    *   *RN08 (Webhook):* Transições para o status `PUBLISHED` disparam revalidação On-Demand (ISR) no Next.js.
*   **US26:** Geração automática do *slug* da URL baseado no Título.
    *   *RN05/RN06:* Tratamento de caracteres e prevenção de colisões (sufixo numérico único) no banco de dados.
*   **US27:** Configuração global de Title Tag e Meta Description.

---

## 5. Modelo de Dados (Entidade-Relacionamento)
Padrão focado em PostgreSQL.

1. **`users`**: `id`, `name`, `email` (Unique), `password_hash`, `role` (ADMIN, EDITOR, **CONTRIBUTOR**), timestamps. *(Ajustado: nova role)*
2. **`categories`**: `id`, `name`, `slug` (Unique).
3. **`posts` (Entidade Core)**: `id`, `title`, `slug`, `summary`, `rich_text_content`, `cover_image_url`, `attachment_url`, `type`, `status`, **`author_id` (FK User)**, `published_at`, `deleted_at`. *(Ajustado: controle de autoria)*
4. **`project_details` (Extensão 1:1 para Projetos)**: `id`, `post_id`, `funder_id`, `general_objective`, `duration_text`, `budget_value`, **`execution_status` (ONGOING, COMPLETED)**, **`gallery_images` (Collection/Array de URLs)**. *(Ajustado: status de execução e galeria simples)*
5. **`impact_metrics`**: `id`, `label`, `value`, `is_dynamic`, `dynamic_query_type`, `is_active`, `display_order`.
6. *(Tabelas 6, 7 e 8 de categorias, media e funder continuam iguais...)*
7. **`carousel_slides`**: `id`, `title`, `subtitle`, `image_url`, `action_url`, `is_active`, `display_order`, timestamps.
8. **`contact_messages`**: `id`, `name`, `email`, `subject`, `message`, `is_read` (Boolean), timestamps.
9. **`refresh_tokens`**: `id`, `token` (UUID), `user_id` (FK User), `expiry_date`.
10. **`password_reset_tokens`**: `id`, `token` (UUID), `user_id` (FK User), `expiry_date`.

---

## 6. Contratos de API (Endpoints RESTful / Swagger)

**Módulo Público (Vitrine) - GET & POST**

* `GET /api/v1/public/posts` *(Suporta `?type=`, `?category_slug=` e **`?executionStatus=`**)*
* `GET /api/v1/public/posts/{slug}`
* `GET /api/v1/public/impact-metrics`
* `GET /api/v1/public/settings`
* **`GET /api/v1/public/carousel`** *(Novo: Busca destaques ativos ordenados)*
* **`POST /api/v1/public/contact`** *(Novo: Recebe formulário de contato do visitante)*

**Módulo Administrativo (Painel) - Protegido (JWT)**
*Autenticação & Segurança:*

* `POST /api/v1/admin/auth/login`
* **`POST /api/v1/admin/auth/refresh-token`** *(Novo: Rotação de JWT)*
* **`POST /api/v1/admin/auth/forgot-password`** e **`reset-password`** *(Novo: Livres de token)*
* `GET/POST/PUT /api/v1/admin/users`

*Conteúdo e Extensões:*

* `GET/POST/PUT/DELETE /api/v1/admin/posts`
* `GET/POST/PUT/DELETE /api/v1/admin/categories`
* `GET/POST/PUT/DELETE /api/v1/admin/funders`
* **`GET/POST/PUT/DELETE /api/v1/admin/carousel`** *(Novo: CRUD do Carrossel)*
* `GET/PUT /api/v1/admin/impact-metrics`
* `GET/PUT /api/v1/admin/settings`
* **`GET /api/v1/admin/contacts`** e **`PUT /api/v1/admin/contacts/{id}/read`** *(Novo: Gestão de mensagens recebidas)*