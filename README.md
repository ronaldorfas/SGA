# 🏢 Projeto — SGA: Sistema de Gestão de Ambientes

> **Sistema de Gestão de Ambientes | Organização • Controle • Eficiência**

**👥 Nome do grupo:** TechFlow 📥
**📅 Reunião de definição do escopo:** 08/09/2026
**🎓 Etapa:** Segundo semestre
**📄 Documento:** Escopo inicial — Versão 01

---
## 👥 Integrantes

| Foto | Nome | GitHub | Função no Projeto |
|------|------|--------|-------------------|
| <img src="https://github.com/fabiobitencourt93.png" width="50px"> | **Fabio Bitencourt** | [fabiobitencourt93](https://github.com/fabiobitencourt93) | Em andamento |
| <img src="https://github.com/guilhermelleiteads.png" width="50px"> | **Guilherme Leite** | [guilhermeleiteads](https://github.com/guilhermelleiteads) | Em andamento |
| <img src="https://github.com/ronaldorfas.png" width="50px"> | **Ronaldo Soares** | [Ronaldo Soares](https://github.com/ronaldorfas) | Em andamento |
| <img src="https://github.com/vfazano.png" width="50px"> | **Vitor Fazano** | [vfazano](https://github.com/vfazano) | Em andamento |
| <img src="https://github.com/edilainesolde.png" width="50px"> | **Edilaine Paulino** | [edilainesolde](https://github.com/edilainesolde) | Em andamento |
| <img src="https://github.com/biancaciriloads.png" width="50px"> | **Bianca Cirilo** | [biancacirilo](https://github.com/biancaciriloads) | Em andamento |


---



# 🎯 1. Contexto

O projeto **SGA – Sistema de Gestão de Ambientes** tem como objetivo aperfeiçoar a solução desenvolvida no primeiro semestre, ampliando suas funcionalidades para facilitar a **gestão, ocupação, consulta, reserva e manutenção dos espaços físicos da instituição**.

A proposta é centralizar as informações sobre **salas, turmas, docentes, horários, reservas, patrimônio e manutenção**, proporcionando maior organização, controle e eficiência na utilização dos ambientes.

Além das funcionalidades administrativas, o sistema contará com um **canal público para comunicação de necessidades de manutenção**, permitindo que qualquer usuário informe um problema identificado em um ambiente sem necessidade de possuir acesso ou login no sistema.

As informações enviadas pelo canal público serão encaminhadas ao **setor de Manutenção**, que realizará uma análise e determinará se a solicitação é procedente e se deverá ser convertida em uma ocorrência de manutenção.

---

# 🚀 2. Objetivo Geral

Desenvolver uma solução para gerenciamento dos espaços físicos, permitindo:

* 🏫 Cadastro de salas, turmas e docentes;
* 📅 Alocação de aulas e ambientes;
* 🔎 Consulta da disponibilidade das salas;
* 📌 Controle e reserva de ambientes;
* 📊 Relatórios de utilização;
* 🏷️ Controle patrimonial por **RFID e/ou QR Code**;
* 🔧 Registro e acompanhamento de ocorrências de manutenção;
* 🌐 Canal público para sugestão de manutenção;
* 🔎 Triagem e validação das solicitações pelo setor de manutenção;
* ⏱️ Monitoramento de **SLA** e indicadores.

> **Objetivo central:** tornar a gestão dos ambientes mais organizada, integrada e eficiente, facilitando também a comunicação de problemas relacionados à infraestrutura.

---

# 🔐 3. Perfis de Acesso

## 🌐 Acesso Público

O SGA disponibilizará, diretamente na **página principal**, um ícone de acesso rápido:

> 🔧 **Sugerir Manutenção**

Essa funcionalidade será **pública**, não exigindo login ou autenticação.

O objetivo é permitir que qualquer usuário que identifique um problema em um ambiente possa comunicar a situação ao setor responsável.

O acesso público ficará limitado ao envio da sugestão, não permitindo acesso às demais funcionalidades administrativas do sistema.

---

## 👔 Coordenação

Responsável pelas principais funções administrativas:

* Cadastrar docentes, turmas e salas;
* Gerenciar horários;
* Alocar salas;
* Relacionar aula, turma, docente, sala e horário;
* Consultar relatórios de utilização.

---

## 🗂️ Secretaria

Poderá:

* Cadastrar docentes e turmas;
* Consultar disponibilidade e utilização das salas;
* Pesquisar informações por sala, turma, docente e período.

---

## 👨‍🏫 Docente

Poderá:

* Consultar sua alocação;
* Consultar salas disponíveis;
* Filtrar salas e horários;
* Realizar reservas de ambientes.

A reserva deverá considerar:

**Sala + Data + Horário + Docente + NIF + Finalidade**

> ℹ️ **Observação:** a informação de turma será opcional.

---

## 🔧 Manutenção
Responsável por:

* Receber sugestões de manutenção;
* Analisar as solicitações recebidas;
* Validar a existência do problema;
* Classificar as ocorrências;
* Definir prioridade;
* Aprovar ou não a solicitação;
* Transformar uma sugestão aprovada em ocorrência;
* Acompanhar o atendimento;
* Registrar as etapas da manutenção;
* Finalizar ocorrências;
* Acompanhar SLA e indicadores.

---

## 🔑 Autenticação na implementação

O acesso autenticado usa contas do Supabase Auth. O perfil autorizado (`docente`, `coordenador`, `secretaria` ou `manutencao`) deve ser definido em `app_metadata`, e as rotas da API validam o token e a permissão no backend. Contas docentes também precisam de `docente_id` para limitar as aulas e alocações ao cadastro correspondente. Não há senhas de demonstração no frontend nem cadastro público de usuários.

O único fluxo público da API é o formulário de sugestão de manutenção, incluindo a consulta mínima de ambientes necessária para selecionar o local. Consulte [APP/beck_end/README.md](./APP/beck_end/README.md) para configurar as chaves do servidor, as origens CORS e os perfis.

---

# ⚙️ 4. Funcionalidades Principais

## 🏫 Gestão de Salas

* Cadastro de salas;
* Cadastro de turmas;
* Cadastro de docentes;
* Controle de horários;
* Alocação de ambientes;
* Consulta de disponibilidade;
* Relatório central de utilização.

---

# 📅 Reserva de Salas

## 🔄 Fluxo da Reserva

**Selecionar sala**

↓

**Selecionar data**

↓

**Selecionar horário**

↓

**🔎 Verificar status da sala**

↓

**Informar dados**

↓

**✅ Confirmar reserva**

Após a seleção da **data e do horário**, o sistema deverá consultar automaticamente o status da sala.

---

## 📊 Status da Sala

|        Status        | Situação                                   | Ação do sistema                    |
| :------------------: | ------------------------------------------ | ---------------------------------- |
|     🟢 **LIVRE**     | Sala disponível para o horário selecionado | ✅ Permitir continuar com a reserva |
|    🔴 **OCUPADA**    | Sala possui reserva ou alocação no horário | 🚫 Bloquear nova reserva           |
| 🟠 **EM MANUTENÇÃO** | Sala indisponível para utilização          | 🚫 Bloquear nova reserva           |

---

## 🟢 Sala Livre

Quando a sala estiver disponível:

> **Status: 🟢 LIVRE**
>
> A sala está disponível para o horário selecionado.
>
> **O usuário poderá prosseguir com a reserva.**

---

## 🔴 Sala Ocupada

Quando existir uma reserva ou alocação:

> **Status: 🔴 OCUPADA**
>
> A sala já possui uma reserva ou alocação para este horário.
>
> **Não será possível realizar uma nova reserva.**

---

## 🟠 Sala em Manutenção

Quando a sala estiver indisponível para manutenção:

> **Status: 🟠 EM MANUTENÇÃO**
>
> Esta sala está indisponível devido a uma manutenção programada ou ocorrência em andamento.
>
> **Não será possível realizar uma reserva.**

---

## 🔒 Validação da Reserva

O sistema deverá realizar uma **nova validação da disponibilidade no momento da confirmação da reserva**, evitando conflitos ou reservas simultâneas para o mesmo ambiente, data e horário.

A reserva deverá considerar:

**Sala + Data + Horário + Docente + NIF + Finalidade**

> ℹ️ A informação de turma será opcional.

---

# 🌐 5. Canal Público — Sugestão de Manutenção

O sistema deverá disponibilizar na **página principal** um ícone de acesso rápido para comunicação de problemas relacionados aos ambientes.

### 🔧 Sugerir Manutenção

O usuário poderá acessar essa funcionalidade **sem realizar login**.

A finalidade é facilitar a comunicação de problemas identificados nas salas e demais ambientes da instituição.

### 📝 Informações da Sugestão

O formulário poderá solicitar:

* 👤 Nome do solicitante;
* 📧 E-mail ou contato, quando aplicável;
* 📍 Local/sala;
* 📝 Descrição do problema;
* ⚠️ Tipo de ocorrência;
* 📅 Data e hora da identificação;
* 📷 Foto opcional;
* 💬 Observações adicionais.

---

## 🔄 Fluxo da Sugestão

**🔧 Usuário acessa "Sugerir Manutenção"**

↓

**📝 Preenche o formulário**

↓

**📤 Envia a sugestão**

↓

**📥 Setor de Manutenção recebe**

↓

**🔎 Manutenção realiza a análise**

↓

**❓ Problema é considerado válido?**

### ❌ Não

**Sugestão não aprovada**

↓

Registro da análise

### ✅ Sim

**Sugestão aprovada**

↓

**🔧 Geração de ocorrência de manutenção**

↓

**▶️ Atendimento**

↓

**✅ Finalização**

---

# 🔎 6. Triagem e Validação da Manutenção

As informações enviadas pelo acesso público **não serão consideradas automaticamente como ocorrências de manutenção**.

O setor de Manutenção será responsável pela análise inicial da solicitação.

Durante a triagem, poderá verificar:

* Se o problema realmente existe;
* Se a informação fornecida é suficiente;
* Se o local informado está correto;
* Se a solicitação pertence ao setor de Manutenção;
* Qual o tipo de problema;
* Qual a prioridade;
* Se é necessária uma vistoria;
* Se será necessário algum recurso para o atendimento.

---

## 📊 Status da Solicitação

|           Status           | Descrição                                                           |
| :------------------------: | ------------------------------------------------------------------- |
| 🟡 **PENDENTE DE ANÁLISE** | Sugestão recebida e aguardando avaliação                            |
|     ❌ **NÃO APROVADA**     | Problema não identificado ou solicitação considerada não procedente |
|       ✅ **APROVADA**       | Problema validado pela Manutenção                                   |
|    🔧 **EM ATENDIMENTO**   | Atendimento ou manutenção iniciado                                  |
|      🏁 **FINALIZADA**     | Problema solucionado                                                |

---

# 🔧 7. Módulo de Manutenção

O Módulo de Manutenção poderá ser desenvolvido como alternativa ou evolução do projeto, principalmente caso a implantação do RFID não seja viável dentro do prazo.

O módulo será responsável por transformar as **sugestões validadas** em ocorrências de manutenção.

---

## 📝 Registro de Ocorrências

Após a validação pelo setor de Manutenção, a sugestão poderá ser convertida em uma ocorrência.

A ocorrência poderá conter:

* 👤 Solicitante;
* 👥 Turma, quando aplicável;
* 📍 Local/sala;
* 📝 Descrição;
* 🕐 Data e hora;
* 📷 Foto;
* ⚠️ Tipo de ocorrência;
* 🔎 Resultado da análise;
* 👷 Responsável pelo atendimento;
* 🚦 Prioridade;
* 📊 Status.

---

## Exemplos de ocorrências

* 💧 Vazamento;
* ❄️ Ar-condicionado com defeito;
* 💡 Lâmpada queimada;
* 🖥️ Equipamento danificado;
* ⚡ Problemas elétricos;
* 🏗️ Problemas estruturais;
* 🚪 Problemas em portas ou fechaduras;
* 🪑 Problemas em mesas, cadeiras ou mobiliário;
* 🧹 Problemas relacionados à infraestrutura do ambiente.

---

# 🔄 8. Fluxo de Atendimento

Após a validação da solicitação:

**📝 Sugestão recebida**

↓

**📥 Pendente de análise**

↓

**🔎 Em análise**

↓

**✅ Aprovada**

↓

**🔧 Em atendimento / Em manutenção**

↓

**🏁 Finalizada**

O sistema deverá registrar o histórico de cada etapa, incluindo:

* Data;
* Hora;
* Responsável;
* Status;
* Observações;
* Ações realizadas.

---

# ⏱️ 9. SLA e Indicadores

O módulo de manutenção deverá permitir acompanhar:

* ⏱️ Tempo de resposta;
* ▶️ Tempo até o início do atendimento;
* 🛠️ Tempo de solução;
* ⌛ Tempo total;
* 🟢 SLA cumprido;
* 🔴 SLA excedido.

> ℹ️ **Importante:** os indicadores de SLA deverão considerar as ocorrências **aprovadas/validadas pela Manutenção**, evitando contabilizar como tempo de atendimento o período em que a solicitação ainda estava em análise.

---

## 📈 Indicadores

Também poderão ser apresentados:

* Total de sugestões recebidas;
* Total de sugestões aprovadas;
* Total de sugestões não aprovadas;
* Total de ocorrências;
* Ocorrências em andamento;
* Ocorrências finalizadas;
* Tempo médio de atendimento;
* Locais com maior número de ocorrências;
* Tipos de problemas mais recorrentes;
* Quantidade de solicitações por período;
* Percentual de sugestões convertidas em ocorrências;
* Percentual de SLA cumprido;
* Percentual de SLA excedido.

### Indicadores implementados nesta versão

A tela **Indicadores do SGA** apresenta duas métricas calculadas sobre os registros atuais:

1. **Concentração de alocações:** (alocações do ambiente líder ÷ total de alocações) × 100. Indica a participação do ambiente com mais registros; não representa a ocupação de todos os horários disponíveis.
2. **Conclusão de manutenção:** (solicitações com status “Finalizada” ÷ total de solicitações) × 100. Reflete o status atual das solicitações e não mede tempo de atendimento ou SLA.

As fontes são `alocacoes_ambiente` e `sugestoes_manutencao`, respectivamente. Nesta versão, os cálculos usam o histórico completo, sem filtro por data: as alocações ainda não têm vigência temporal. As mudanças de status da manutenção são auditadas, mas ainda não há metas de SLA configuradas.

---

# 🏷️ 10. Controle Patrimonial

Será analisada a utilização de tecnologias para identificação e controle dos patrimônios existentes nos ambientes.

## 📡 RFID

Para identificação e controle dos patrimônios existentes nos ambientes.

## 📱 QR Code

Como alternativa ou complemento ao RFID, permitindo acessar um **checklist patrimonial por sala**.

### Exemplo — Sala 203

☑️ Computador

☑️ Projetor

☑️ Ar-condicionado

☑️ Mesa

☑️ Cadeiras

☑️ Quadro

☑️ Outros equipamentos

---

# 📊 11. Relatórios

O sistema deverá permitir consultas e relatórios por:

* Sala;
* Turma;
* Docente;
* Período;
* Status;
* Tipo de ocorrência;
* Local;
* Responsável;
* Prioridade;
* SLA.

As informações poderão incluir:

**Sala + Turma + Docente + Data + Horário + Status**

Para manutenção:

**Local + Tipo de ocorrência + Data + Status + Prioridade + Responsável + SLA**

---

# ⭐ 12. Prioridades do Projeto

## 🥇 Prioridade 1 — Essencial

* Mapeamento dos espaços;
* Análise de requisitos;
* Login e controle de acesso;
* Cadastro de salas;
* Cadastro de docentes;
* Cadastro de turmas;
* Alocação de salas;
* Controle de horários;
* Relatório de utilização.

---

## 🥈 Prioridade 2 — Evolução

* 📅 Reserva de salas;
* 🔎 Verificação automática do status da sala;
* 🔒 Bloqueio de reserva para salas ocupadas;
* 🔧 Bloqueio de reserva para salas em manutenção;
* 🔍 Filtros;
* 📱 QR Code;
* ☑️ Checklist patrimonial;
* 🌐 Acesso público para sugestão de manutenção;
* 📥 Recebimento e triagem das sugestões pelo setor de Manutenção.

---

## 🥉 Prioridade 3 — Conforme viabilidade

* 📡 RFID;
* 🏷️ Controle patrimonial;
* 🔧 Módulo de manutenção;
* 📚 Histórico de ocorrências;
* ⏱️ SLA;
* 📊 Indicadores;
* 📷 Upload de fotos;
* 🔎 Validação e classificação das solicitações.

---

# 🗺️ 13. Roadmap

### 🔹 Fase 1 — Levantamento

* Mapeamento;
* Processos;
* Requisitos;
* Validação.

---

### 🔹 Fase 2 — Modelagem

* Estrutura do sistema;
* Perfis;
* Banco de dados;
* Fluxos;
* Modelagem das ocorrências;
* Fluxo de triagem da manutenção.

---

### 🔹 Fase 3 — Desenvolvimento

* Login;
* Perfis;
* Cadastros;
* Salas;
* Turmas;
* Docentes;
* Alocações;
* Reservas;
* Verificação de disponibilidade;
* Relatórios.

---

### 🔹 Fase 4 — Canal Público

* Página pública de sugestão;
* Formulário de manutenção;
* Registro da solicitação;
* Encaminhamento para o setor de Manutenção;
* Triagem;
* Aprovação ou não aprovação.

---

### 🔹 Fase 5 — Evoluções

* QR Code;
* Checklist;
* Estudo/implantação do RFID.

---

### 🔹 Fase 6 — Plano Alternativo

* Módulo de manutenção;
* Ocorrências;
* Atendimento;
* Histórico;
* SLA;
* Relatórios;
* Indicadores.

---

### 🔹 Fase 7 — Testes

* Testes funcionais;
* Testes de perfis;
* Testes de reservas;
* Testes de disponibilidade e conflitos;
* Testes de bloqueio de salas ocupadas;
* Testes de bloqueio de salas em manutenção;
* Testes do acesso público;
* Testes do formulário de manutenção;
* Testes da triagem;
* Testes de aprovação e não aprovação;
* Testes de conversão de sugestão em ocorrência;
* Testes de relatórios;
* Validação com usuários.

---

# 🏆 14. Resultado Esperado

Ao final do projeto, espera-se disponibilizar uma **solução integrada para facilitar a gestão dos ambientes da instituição**, proporcionando maior controle sobre utilização, disponibilidade, reservas, patrimônio e manutenção.

### 👔 Coordenação

**Cadastrar turma/docente** 
**Alocar de ambiente** 
**Atribuição de aula** 
**Relatórios**

### 🗂️ Secretaria

**Cadastrar turma/docente**
**Relatórios**

### 👨‍🏫 Docente

**Solicitação de ambiente** 
**Reslatorio**

### 🔧 Manutenção

**Visualização de sugestões**
**Direcionamento de manutenção**

### 👥 Publico

**Home page** 
**Sujestão de manutenção**

---

# 🔐 15. Regra de Negócio — Sugestão x Ocorrência

Uma das principais regras do módulo de manutenção será a separação entre **sugestão** e **ocorrência**.

A sugestão enviada pelo usuário representa apenas uma **comunicação de um possível problema**.

Ela somente será transformada em uma ocorrência oficial após a análise do setor de Manutenção.

### Fluxo:

**🌐 Sugestão pública**

↓

**📥 Recebimento**

↓

**🔎 Triagem**

↓

**❌ Não aprovada**

**OU**

**✅ Aprovada**

↓

**🔧 Ocorrência de manutenção**

↓

**▶️ Atendimento**

↓

**🏁 Finalização**

Essa regra permitirá que os relatórios e indicadores do sistema trabalhem com informações mais confiáveis, evitando que relatos não confirmados sejam contabilizados como problemas reais de manutenção.

---

# 💡 16. Visão do Projeto

> **SGA — Sistema de Gestão de Ambientes**
>
> Uma solução pensada para transformar informações dispersas em **controle, organização e eficiência na gestão dos ambientes institucionais**.
>
> O sistema também busca aproximar os usuários do setor responsável pela infraestrutura, permitindo que problemas identificados nos ambientes sejam comunicados de forma simples, mesmo sem acesso ao sistema.
>
> **Comunicar → Analisar → Validar → Atender → Resolver**

---

# 📄 Informações do Documento

**Documento:** Escopo inicial — Versão 01
**Data de referência:** 08/09/2026
**Projeto:** SGA — Sistema de Gestão de Ambientes
**Grupo:** TechFlow 📥
