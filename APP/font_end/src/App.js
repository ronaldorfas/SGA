import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Home';
import SugestaoManutencao from './Sujestão_manutenção';
import RelatorioDeManutencao from './Relatorio_de_manutenção';
import Login from './Login';
import Relatorio from './Relatorio';
import DirecionamentoManutencao from './Direcionamento_de_manutenção';
import SolicitacaoDeAmbiente from './Solicitação_de_Ambiente';
import CadastroDeTurma from './Cadastro_de_turma_doscente';
import AtribuicaoDeAula from './Atribuição_de_aula';
import AlocacaoDeAmbiente from './Alocação_de_ambiente';
import RelatorioDeAlocacoes from './Relatorio_de_alocacoes';
import RelatorioDeAmbientes from './Relatorio_de_ambientes';
import RelatorioDeTurmas from './Relatorio_de_turmas';
import RelatorioDeAtribuicoes from './Relatorio_de_atribuicoes';
import Indicadores from './Indicadores';
import RequireAuth from './RequireAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sugestao-manutencao" element={<SugestaoManutencao />} />
        <Route path="/sugestao-manutencao/:id" element={<SugestaoManutencao />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Relatorio" element={<RequireAuth><Relatorio /></RequireAuth>} />
        <Route path="/Direcionamento_de_manutenção" element={<RequireAuth profiles={['manutencao']}><DirecionamentoManutencao /></RequireAuth>} />
        <Route path="/sugestao-manutencao/dashboard" element={<RequireAuth profiles={['manutencao']}><RelatorioDeManutencao /></RequireAuth>} />
        <Route path="/Solicitação_de_Ambiente" element={<RequireAuth profiles={['docente', 'coordenador']}><SolicitacaoDeAmbiente /></RequireAuth>} />
        <Route path="/Cadastro_de_turma_doscente" element={<RequireAuth profiles={['coordenador', 'secretaria']}><CadastroDeTurma /></RequireAuth>} />
        <Route path="/Atribuição_de_turma" element={<RequireAuth profiles={['coordenador']}><AtribuicaoDeAula /></RequireAuth>} />
        <Route path="/Alocação_de_ambiente" element={<RequireAuth profiles={['coordenador']}><AlocacaoDeAmbiente /></RequireAuth>} />
        <Route path="/relatorio-alocacoes" element={<RequireAuth profiles={['coordenador', 'secretaria', 'manutencao']}><RelatorioDeAlocacoes /></RequireAuth>} />
        <Route path="/relatorio-ambientes" element={<RequireAuth profiles={['coordenador', 'secretaria', 'manutencao']}><RelatorioDeAmbientes /></RequireAuth>} />
        <Route path="/relatorio-turmas" element={<RequireAuth profiles={['coordenador', 'secretaria', 'docente']}><RelatorioDeTurmas /></RequireAuth>} />
        <Route path="/relatorio-atribuicoes" element={<RequireAuth profiles={['coordenador', 'secretaria']}><RelatorioDeAtribuicoes /></RequireAuth>} />
        <Route path="/indicadores" element={<RequireAuth profiles={['coordenador', 'secretaria', 'manutencao']}><Indicadores /></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;
