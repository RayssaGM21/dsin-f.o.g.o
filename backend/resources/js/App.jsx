import { useState } from 'react';
import { useOperations } from './hooks/useOperations.js';
import Sidebar from './components/Sidebar.jsx';
import Overview from './components/Overview.jsx';
import Inventory from './components/Inventory.jsx';
import Forecast from './components/Forecast.jsx';
import ResourceDialog from './components/ResourceDialog.jsx';
import Icon from './components/Icon.jsx';
import MapWorkspace from './components/MapWorkspace.jsx';

const titles = { overview: 'Visão geral', map: 'Mapa operacional', inventory: 'Inventário', forecast: 'Análise de risco' };
const mode = document.getElementById('app')?.dataset.mode === 'clean' ? 'clean' : 'demo';

export default function App() {
  const [view, setView] = useState('overview');
  const [selection, setSelection] = useState(null);
  const { equipment, agents, dashboard, forecast, equipmentTypes, error, setError, updatedAt, refresh } = useOperations();
  const select = (kind, item = null, editing = false) => setSelection({ kind, item, editing });
  const saved = () => { setSelection(null); refresh(); };

  return <div className="shell"><Sidebar view={view} onNavigate={setView} mode={mode} userName={document.getElementById('app')?.dataset.userName} /><main className={`main main-${view}`}>
    <header className="topbar"><div><div className="eyebrow">SÃO JOSÉ DO RIO PRETO <span>/</span> CENTRAL DE OPERAÇÕES</div><h1>{titles[view]}</h1></div><div className="top-actions"><span className="updated-at">{updatedAt ? `Atualizado às ${updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Atualizando dados…'}</span><button className="icon-button" onClick={refresh} aria-label="Atualizar dados" title="Atualizar dados"><Icon name="refresh" /></button></div></header>
    {error && <div className="error" role="alert">{error}<button onClick={() => setError('')} aria-label="Fechar alerta">×</button></div>}
    {view === 'overview' && (dashboard ? <Overview data={dashboard} equipment={equipment} agents={agents} onSelect={select} onAdd={select} onNavigate={setView} /> : <p className="loading">Carregando painel…</p>)}
    {view === 'map' && <MapWorkspace equipment={equipment} agents={agents} onEdit={select} onNavigate={setView} />}
    {view === 'inventory' && <Inventory equipment={equipment} agents={agents} onSelect={select} onAdd={select} />}
    {view === 'forecast' && (forecast ? <Forecast data={forecast} onNavigate={setView} /> : <p className="loading">Carregando análise…</p>)}
  </main>{selection && <ResourceDialog key={`${selection.kind}-${selection.item?.id || 'new'}`} selection={selection} equipmentTypes={equipmentTypes} onClose={() => setSelection(null)} onSaved={saved} />}</div>;
}
