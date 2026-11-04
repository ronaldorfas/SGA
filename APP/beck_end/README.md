# Backend do SGA

## Preparar o Supabase

1. No SQL Editor do Supabase, execute `APP/Banco_de_dados/schema-relacional.sql` a partir da raiz do repositorio.
2. Gere ou revise os dados academicos com `node APP/Banco_de_dados/import-t.sql.js`.
3. Execute `APP/Banco_de_dados/t-relacional.sql` no SQL Editor para importar turmas, docentes e componentes.
4. Cadastre ao menos um ambiente com `codigo`, `nome` e `status = 'Disponível'`, e confirme que existem atribuicoes para selecionar.

O gerador cancela a criacao do SQL se encontrar dados invalidos e informa linha e motivo. O arquivo SQL resultante importa somente depois que todas as linhas forem validadas.

## Configuracao local

Crie `APP/beck_end/.env` localmente, sem versionar o arquivo:

```env
SUPABASE_URL=https://<projeto>.supabase.co
SUPABASE_ANON_KEY=<chave-publica-anon>
SUPABASE_SERVICE_ROLE_KEY=<chave-service-role>
CORS_ORIGINS=http://localhost:3000,https://<dominio-do-frontend>
PORT=3001
```

A chave `SUPABASE_SERVICE_ROLE_KEY` e privilegiada e deve permanecer somente no backend. Nunca a coloque no frontend nem em commits. A chave `SUPABASE_ANON_KEY` e usada pelo backend para autenticar usuarios, mas tambem deve ficar no servidor. `CORS_ORIGINS` deve listar somente as origens reais do frontend; sem configuracao, navegadores em outra origem nao recebem permissao CORS.

## Contas e perfis

Crie as contas de acesso no Supabase Auth; nao existe cadastro publico de usuarios. Defina o perfil no `app_metadata` administrado pelo servidor, com um destes valores: `docente`, `coordenador`, `secretaria` ou `manutencao`. Nao use `user_metadata` para autorizacao, pois o proprio usuario pode altera-lo. Para cada perfil `docente`, inclua tambem `docente_id` com o ID correspondente da tabela `docentes`.

O login aceita e-mail e senha do Supabase Auth. A API valida o access token no Supabase em cada chamada protegida, verifica o perfil e aplica autorizacao por operacao. O frontend guarda a sessao apenas na aba atual e renova o token usando o refresh token. Remova/recicle as credenciais de demonstracao antigas; elas nao devem ser recriadas como contas com senhas conhecidas.

O unico acesso sem login e o necessario para a sugestao publica: `GET /api/public/ambientes` retorna apenas IDs, codigos e nomes para preencher o formulario, e `POST /api/sugestoes-manutencao` registra a sugestao. Os demais endpoints exigem sessao. Docentes so podem listar atribuicoes vinculadas ao seu `docente_id` e solicitar alocacao para uma aula propria.

O perfil `manutencao` pode consultar `GET /api/sugestoes-manutencao`, alterar o estado via `PATCH /api/sugestoes-manutencao/:id` e consultar o historico em `GET /api/sugestoes-manutencao/:id/historico`. As transicoes sao validadas no backend. Para aprovar, e necessario registrar tipo, prioridade e resultado da analise; a aprovacao cria uma linha em `ocorrencias_manutencao` e todas as mudancas ficam em `historico_manutencao`. Execute novamente `APP/Banco_de_dados/schema-relacional.sql` no SQL Editor para aplicar essa evolucao ao Supabase.

As datas de aprovacao, inicio e finalizacao sao registradas. Como ainda nao existem metas de SLA aprovadas para cada prioridade, o sistema nao afirma se uma ocorrencia cumpriu ou excedeu um SLA.

## Executar e testar

Na pasta `APP/beck_end`:

```sh
npm install
npm test
npm start
```

O endpoint `GET /api/health` informa se o backend reconheceu a configuracao do Supabase.

## Fluxo de alocacao

1. Consulte `GET /api/ambientes` e `GET /api/atribuicoes`.
2. Envie `POST /api/alocacoes-ambiente` com os IDs selecionados e dia, periodo e horario.
3. A API valida o formato e os valores do horario, confirma que ambiente e aula existem, verifica o status do ambiente e procura conflito no mesmo ambiente/dia/horario.
4. A alocacao e persistida em `alocacoes_ambiente`; `GET /api/alocacoes-ambiente` devolve os dados gravados para consulta nos relatorios.

O banco tambem aplica chaves estrangeiras, restricoes de horario e um indice unico para impedir conflito concorrente de alocacao.
