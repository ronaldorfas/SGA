# CI automatizada

O workflow `.github/workflows/ci.yml` executa em cada `push`, `pull_request` ou manualmente pelo GitHub Actions:

- Testes do backend com `npm ci` e `npm test`;
- Testes do frontend com `CI=true`;
- Testes dos cálculos de indicadores;
- Build de produção do frontend com `CI=true`, para que avisos do compilador quebrem a validação.

Os jobs usam Node.js 22, necessário para as dependências atuais do backend. Nenhuma chave do Supabase é necessária para esses testes; a integração com um projeto Supabase real continua sendo uma validação manual de implantação.

## Implantação

A aplicação é dividida entre o frontend React no Vercel e a API Express no Render. O manifesto [`render.yaml`](../render.yaml) configura a API com a pasta `APP/beck_end`, instalação reproduzível via `npm ci`, comando `npm start` e health check em `/api/health`.

### Publicar no Vercel e no Render

1. Crie o projeto Vercel apontando para `APP/font_end` como diretório raiz e publique-o para obter o domínio atribuído. Os comandos de build estão em `APP/font_end/vercel.json`; o build usa `npm ci`, `CI=true` e `GENERATE_SOURCEMAP=false`.
2. Importe o repositório no Render como Blueprint; o serviço `sga-api` será definido pelo `render.yaml` na raiz.
3. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nas variáveis do serviço. Configure também `CORS_ORIGINS` com a origem Vercel exata, por exemplo `https://<seu-site>.vercel.app`, sem barra ao final. As chaves são informadas diretamente no painel do Render, nunca no repositório.
4. Aguarde o deploy e confirme que `https://<servico>.onrender.com/api/health` retorna HTTP 200 e indica Supabase e autenticação configurados.
5. Configure `REACT_APP_API_URL` no Vercel como a origem pública da API Render (por exemplo `https://<servico>.onrender.com`, sem `/api` nem barra final) nos ambientes necessários e republique o frontend.
6. Teste o formulário público e o login com contas Supabase configuradas e perfis administrativos em `app_metadata`.

O health check depende das chaves do Supabase, então elas precisam estar configuradas antes de o serviço ser considerado saudável. O endpoint exibe apenas o estado de configuração, não valores das chaves.

O arquivo `APP/vercel.json` também permite selecionar `APP` como diretório raiz no Vercel, com o mesmo build do frontend. Use apenas uma das configurações de raiz por projeto Vercel. Se publicar em domínios Vercel adicionais, inclua-os em `CORS_ORIGINS` somente quando necessário e redeploye a API.

O deploy real e o login integrado ainda exigem acesso às contas Render, Vercel e Supabase.