import Icon from './Icon.jsx';

const navigation = [
  ['overview', 'grid', 'Visão geral'],
  ['map', 'map', 'Mapa operacional'],
  ['inventory', 'list', 'Inventário'],
  ['forecast', 'activity', 'Análise de risco'],
];

export default function Sidebar({ view, onNavigate, mode, userName }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><img src="/images/fogo-logo.png" alt="" width="54" height="50" /></div><div><strong>F.O.G.O.</strong><small>GESTÃO OPERACIONAL</small></div></div>
    <div className="sidebar-label">CENTRAL DE OPERAÇÕES</div>
    <nav aria-label="Navegação principal">{navigation.map(([id, icon, label]) =>
      <button key={id} type="button" className={`nav-item ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => onNavigate(id)}>
        <Icon name={icon} size={18} /><span>{label}</span>
      </button>)}</nav>
    <div className="sidebar-account"><span className="sidebar-account-label">CONECTADO COMO</span><strong>{userName}</strong><form method="POST" action="/logout"><input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content || ''} /><button type="submit">Sair da plataforma</button></form></div>
    <div className="sidebar-bottom"><span className="live-dot" /><div><strong>{mode === 'clean' ? 'Ambiente de teste' : 'Ambiente demonstrativo'}</strong><small>{mode === 'clean' ? 'Banco isolado · cadastros próprios' : 'Dados sintéticos · atualização a cada 15 s'}</small></div></div>
  </aside>;
}
