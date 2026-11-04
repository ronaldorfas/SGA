# Frontend do SGA

Aplicacao React para consulta de ambientes, alocacoes e solicitacoes de manutencao.

## Executar

Instale as dependencias com `npm install`. Configure `REACT_APP_API_URL` somente quando a API nao estiver no mesmo host/proxy. Em desenvolvimento, o proxy padrao aponta para `http://localhost:3001`.

- `npm start`: inicia a aplicacao local.
- `npm run build`: gera a versao de producao.
- `npm test -- --watchAll=false`: executa os testes React.
- `npm run test:indicators`: executa os testes dos calculos dos indicadores com o Node.js.

## Indicadores

A tela **Indicadores do SGA** esta disponivel em `/indicadores` e pelo seletor do painel de relatorios.

1. **Concentracao de alocacoes** = alocacoes do ambiente com mais registros / total de alocacoes * 100. A fonte e `GET /api/alocacoes-ambiente`. O resultado mostra a participacao do ambiente lider no conjunto de alocacoes, nao a ocupacao real de todos os horarios disponiveis.
2. **Conclusao de manutencao** = solicitacoes com status `Finalizada` (incluindo os registros legados `Concluída`) / total de solicitacoes * 100. A fonte e `GET /api/sugestoes-manutencao`. Mede a proporcao no status atual, nao o tempo de atendimento ou SLA.

Os dois indicadores consideram todos os registros retornados, sem filtro de data. Alocacoes ainda nao possuem vigencia temporal. As solicitacoes agora mantem um historico de status, mas ainda nao ha metas de SLA configuradas; por isso, a interface nao apresenta estes percentuais como serie temporal ou SLA.
