Excelente ideia. Fazer uma bateria de testes guiada (QA manual) agora é o que separa um software amador de um sistema de nível corporativo.

Preparei um roteiro de testes cobrindo **exatamente** o que foi entregue até aqui, dividido por módulos. Você pode copiar esta lista e ir marcando enquanto navega pelo sistema.

### 🛡️ Módulo 1: Autenticação e Segurança

* [x] **Login com Sucesso:** Preencher credenciais válidas e verificar se redireciona para `/dashboard` com um toast de sucesso.
* [x] **Erro de Login:** Digitar uma senha errada e confirmar se a API retorna o erro corretamente exibido no toast (sem quebrar a tela).
* [x] **Proteção de Rota:** Abrir uma aba anônima e tentar acessar `http://localhost:3000/dashboard` direto pela URL. Deve forçar o redirecionamento para o `/login`
    ** [x] Resultado do teste: ao navegar para dashboard é exibido o dashboard em estado de loading, o header sem usuario identificado("Usuario"), menus laterais apenas de dashboard e publicacoes. ao clicar no menu dashboard(atual apos login) nada acontece, ao clicar no menu "publicacoes", é redirecionado para login, porem, exibe o layout antes de redirecionar. ao acessar diretamente via url(http://localhost:3000/dashboard/posts), o mesmo acontece, exibe o layout e depois redireciona. isso torna a experiencia ruim.
* [x] **Logout:** Clicar no botão "Sair" no Header. Deve limpar a sessão e voltar para a tela de login.

### 👥 Módulo 2: Gestão de Equipe e Layout (RBAC)

*(Logado como ADMIN)*

* [x] **Visibilidade (ADMIN):** Confirmar se os menus "Usuários" e "Configurações" estão visíveis na Sidebar lateral.
* [x] **Criação de Usuário:** Acessar a tela de Usuários, abrir o modal, preencher os dados de um novo usuário (ex: um perfil `EDITOR` e um `CONTRIBUTOR`) e salvar. Confirmar se eles aparecem na tabela logo em seguida.
    Feedback dos testes: aparecem na listagem.
*(Faça logout e entre com o usuário EDITOR ou CONTRIBUTOR que você acabou de criar)*
* [x] **Ocultação (RBAC):** Confirmar se os menus "Usuários" e "Configurações" **desapareceram** da Sidebar para esses perfis.
    Feedback dos testes: desaparecem e ao tentar acessar via url, o usuario é redirecionado para o dashboard, porem o layout da tela que nao pode acessar pisca antes do redirecionamento(aparentemente isso é um problema geral nos redirecionamentos sem permissões)

### 📝 Módulo 3: Motor de Conteúdo (Posts, Projetos e Uploads)

*(Logado como ADMIN ou EDITOR)*

* [x] **Criar Notícia (NEWS):**
    - Feedback dos testes: seria interessante ter uma tela ou modal para visualizar a notícia após criação ao invés de ter que acessar a página publica para visualizar(posts em modo "draft" nao vao para a pagina publica). isso ajuda na revisao e ajustes.
* [x] Selecionar tipo "Notícia", preencher título, resumo e status.
    - Feedback dos testes: 
        - No select de status está exibido o valor(DRAFT/PUBLISHED/SCHEDULED) ao invés da label(Rascunho/Publicado/Agendado).
        - O sistema está salvando como "DRAFT" mesmo selecionando como "PUBLISHED". Na edição também.
* [x] Fazer o upload de uma Foto de Capa (verificar se a imagem carrega o preview na tela).
    - Feedback dos testes:
        - o preview da imagem aparece, porém de forma corta para se adequar ao container.
* [x] **Teste de Fogo (Tiptap):** Arrastar uma imagem do seu computador para dentro do editor de texto. Validar se ela não fica como código base64 gigantesco, mas sim como uma imagem real renderizada via URL do servidor. Salvar o post.


* [x] **Criar Projeto (PROJECT):**
* [x] Mudar o tipo para "Projeto" e confirmar se os campos condicionais apareceram na tela (Objetivo Geral, Duração, Orçamento e Status de Execução).
    - Feedback dos testes:
        - Na duracao do projeto, para garantir maior precisao, podemos adicionar inputs de calendario com data e hora. O usuario ira seleciona o dia e horario do inicio e o dia e horario do termino. o sistema deve pegar esse intervalo e calcular a duração do projeto. Não deve ser obrigatorio. Se nao preencher, nao exibe.
        - No select de status de execução está exibido o valor(ONGOING/COMPLETED) ao invés da label(Em andamento/Concluído). O mesmo problema no select de status.
        - No select de status está exibido o valor(DRAFT/PUBLISHED/SCHEDULED) ao invés da label(Rascunho/Publicado/Agendado).
        - O sistema está salvando como "DRAFT" mesmo selecionando como "PUBLISHED". Na edição também.
* [x] Preencher com dados fictícios e salvar. Checar se o post aparece na listagem principal de Posts.

* [x] **Criar Cartilha/Documento (BOOKLET/DOCUMENT):**
* [x] Mudar o tipo para "Cartilha" e confirmar se o campo de *Upload de PDF* (`attachmentUrl`) apareceu no lugar do texto rico (ou junto dele, dependendo de como ficou no layout).
    - Feedback dos testes:
        - No select de status está exibido o valor(DRAFT/PUBLISHED/SCHEDULED) ao invés da label(Rascunho/Publicado/Agendado).
        - O sistema está salvando como "DRAFT" mesmo selecionando como "PUBLISHED". Na edição também.
        - O select do tipo do "post", ao selecionar cartilha, está exibindo provavelmente o value(BOOKLET) ao inves da label(Cartilha)
* [x] Fazer upload de um PDF e salvar.


* [ ] **Filtros e Edição:**
* [ ] Na listagem, testar se o filtro da URL (ex: abas ou select de Tipo) filtra a tabela corretamente.
* [ ] Clicar em "Editar" no Projeto recém-criado, alterar o título e salvar.

* Os testes foram feitos apenas com usuario EDITOR.

Pergunta: após criado, o tipo do post deveria poder ser alterado?



### 🔒 Módulo 4: A Regra do Contributor (US33)

*(Logado como o usuário CONTRIBUTOR que você criou no Módulo 2)*

* [ ] **Autoria na Tabela:** Acessar a listagem de Posts. Tentar achar um post criado pelo ADMIN. Os botões de "Editar" e "Excluir" devem estar **ocultos** ou desabilitados para este post.
* [ ] **Bloqueio de Publicação:** Clicar em "Nova Publicação". Verificar se o campo de "Status" (Rascunho/Publicado) está desabilitado ou travado forçadamente em `DRAFT` (Rascunho).
* [ ] **Edição Própria:** Salvar esse post de teste. Voltar na tabela e confirmar que, para *este* post específico, os botões de Editar/Excluir estão liberados.

---

> **Dica de Debug:** Se durante a criação de algum post ocorrer um erro (ex: toast vermelho), abra a aba **Network (Rede)** no Inspecionar do Chrome, clique na requisição vermelha e veja a aba "Response". Ali o Spring Boot dirá exatamente qual campo o banco recusou.

Post com status agendado, deve solicitar data desejada para a publicacao e armazenar no banco. o cronjob deverá ser responsavel pela publicacao deste post.