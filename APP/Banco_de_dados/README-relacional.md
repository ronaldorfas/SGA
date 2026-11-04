# Banco relacional

O arquivo `t.sql` e uma planilha TSV exportada, nao um script SQL. A conversao foi feita para um modelo normalizado em `schema-relacional.sql`, que tambem define e atualiza as tabelas usadas pela aplicacao para ambientes, alocacoes e sugestoes de manutencao.

## Modelo

- `niveis` -> `tipos_curso` -> `cursos` -> `turmas`
- `componentes_curriculares` guarda cada componente uma vez
- `docentes` guarda cada docente uma vez
- `turma_componentes_docentes` relaciona turma, componente, docente e carga horaria
- `vw_oferta_academica` reproduz a visao tabular original com `JOIN`s
- `ambientes` guarda codigo, nome, tipo, local, capacidade e status
- `alocacoes_ambiente` relaciona ambiente e aula com dia, periodo e horario
- `sugestoes_manutencao` relaciona a solicitacao ao ambiente, registra triagem e timestamps do atendimento
- `ocorrencias_manutencao` guarda cada sugestao aprovada como uma ocorrencia
- `historico_manutencao` audita cada mudanca de status, responsavel, observacao e data

## Importar no Supabase

1. Abra o SQL Editor do Supabase.
2. Execute `schema-relacional.sql`.
3. Execute `t-relacional.sql`.

O arquivo `t-relacional.sql` e gerado pelo comando `node import-t.sql.js`. O gerador valida a estrutura das linhas, cargas horarias, datas e horarios; se houver qualquer linha invalida, informa o numero e o motivo e cancela a geracao para evitar uma importacao parcial. Docentes ausentes na planilha sao gravados como `NULL`, sem criar registros ficticios.

O fluxo de alocacao valida os identificadores e a combinacao dia/periodo/horario, verifica se o ambiente esta disponivel e se a aula existe, grava os dados em `alocacoes_ambiente` e os consulta nos relatorios. Uma restricao unica no banco tambem impede duas alocacoes para o mesmo ambiente, dia e horario. Alocacoes antigas sem esses campos permanecem como historico; nao e possivel inferir seus horarios a partir dos dados legados.

O esquema preenche codigos ausentes de ambientes legados com `AMB-<id>`. Ele tambem migra os estados antigos de manutencao, cria ocorrencias para solicitacoes previamente aprovadas/finalizadas e registra que o historico anterior dessas solicitacoes nao esta disponivel. Aplique o arquivo no SQL Editor antes de iniciar a API. A chave `SUPABASE_SERVICE_ROLE_KEY` deve permanecer somente no backend e nunca ser incluida no frontend ou no repositorio.

O fluxo de manutencao permite `Pendente de análise -> Em análise -> Aprovada/Não aprovada -> Em atendimento -> Finalizada`. A aprovacao cria a ocorrencia de forma transacional pelo trigger do banco; as transicoes e observacoes ficam em `historico_manutencao`. Ainda nao ha metas de SLA definidas, portanto os tempos registrados nao sao classificados como cumprimento/excesso de SLA.