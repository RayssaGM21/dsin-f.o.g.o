import { useMemo, useState } from 'react';
import { Status, statusLabels } from '../lib/labels.jsx';
import Icon from './Icon.jsx';
import SelectMenu from './SelectMenu.jsx';
import Pagination from './Pagination.jsx';

export default function Inventory({ equipment, agents, onSelect, onAdd }) {
  const [kind, setKind] = useState('equipment');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isEquipment = kind === 'equipment';
  const items = isEquipment ? equipment : agents;
  const neighborhoods = useMemo(() => [...new Set(items.map(item => item.location.neighborhood))].sort(), [items]);
  const statuses = useMemo(() => [...new Set(items.map(item => item.status))].sort(), [items]);
  const visible = items.filter(item => {
    const text = [item.type, item.name, item.serial_number, item.role, item.agency, item.location.neighborhood].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
    return text.includes(query.trim().toLocaleLowerCase('pt-BR')) && (!status || item.status === status) && (!neighborhood || item.location.neighborhood === neighborhood);
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / pageSize)));
  const pageItems = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const switchKind = value => { setKind(value); setQuery(''); setStatus(''); setNeighborhood(''); setPage(1); };
  const changeQuery = value => { setQuery(value); setPage(1); };
  const changeStatus = value => { setStatus(value); setPage(1); };
  const changeNeighborhood = value => { setNeighborhood(value); setPage(1); };
  const changePageSize = value => { setPageSize(value); setPage(1); };

  return <div className="inventory-workspace">
    <div className="page-intro"><div><span className="panel-kicker">RECURSOS DA CIDADE</span><h2>Todos os registros em um lugar</h2><p>Encontre, consulte e atualize equipamentos e equipes com rapidez.</p></div><div className="button-group"><button className="secondary-button" onClick={() => onAdd('agents')}><Icon name="plus" size={16} /> Novo agente</button><button className="primary-button" onClick={() => onAdd('equipment')}><Icon name="plus" size={16} /> Novo equipamento</button></div></div>
    <div className="inventory-tabs" role="tablist" aria-label="Tipo de recurso">{[['equipment', equipment.length, 'Equipamentos'], ['agents', agents.length, 'Agentes']].map(([id, count, label]) => <button key={id} role="tab" aria-selected={kind === id} className={`tab ${kind === id ? 'active' : ''}`} onClick={() => switchKind(id)}>{label} <span>{count}</span></button>)}</div>
    <section className="panel inventory-panel" aria-label={isEquipment ? 'Lista de equipamentos' : 'Lista de agentes'}>
      <div className="inventory-toolbar"><label className="search-field"><Icon name="search" size={18} /><input value={query} onChange={event => changeQuery(event.target.value)} placeholder={isEquipment ? 'Buscar tipo, série, órgão ou bairro' : 'Buscar nome, função, órgão ou bairro'} aria-label="Buscar registros" /></label><SelectMenu label="Situação" value={status} onChange={changeStatus} options={[{ value: '', label: 'Todas as situações' }, ...statuses.map(value => ({ value, label: statusLabels[value] || value }))]} /><SelectMenu label="Bairro" value={neighborhood} onChange={changeNeighborhood} options={[{ value: '', label: 'Todos os bairros' }, ...neighborhoods.map(value => ({ value, label: value }))]} /></div>
      <div className="results-line">{visible.length} {visible.length === 1 ? 'registro encontrado' : 'registros encontrados'}{(query || status || neighborhood) && <button onClick={() => { setQuery(''); setStatus(''); setNeighborhood(''); setPage(1); }}>Limpar filtros</button>}</div>
      {visible.length ? <>
        <div className="table-wrap"><table><thead><tr>{(isEquipment ? ['RECURSO', 'IDENTIFICAÇÃO', 'BAIRRO', 'SITUAÇÃO', 'ÓRGÃO', ''] : ['PROFISSIONAL', 'FUNÇÃO', 'BAIRRO', 'SITUAÇÃO', 'ÓRGÃO', '']).map((label, index) => <th key={index}>{label}</th>)}</tr></thead><tbody>{pageItems.map(item => <tr key={item.id}><td><strong>{isEquipment ? item.type : item.name}</strong>{isEquipment && <small>{item.brand} {item.model}</small>}</td><td>{isEquipment ? item.serial_number : item.role}</td><td>{item.location.neighborhood}</td><td><Status value={item.status} /></td><td>{item.agency}</td><td><button className="row-button" onClick={() => onSelect(kind, item)} aria-label={`Ver detalhes de ${item.type || item.name}`}><Icon name="arrow" size={17} /></button></td></tr>)}</tbody></table></div>
        <div className="inventory-cards">{pageItems.map(item => <button className="inventory-card" key={item.id} onClick={() => onSelect(kind, item)}><span className="inventory-card-top"><strong>{isEquipment ? item.type : item.name}</strong><Icon name="arrow" size={18} /></span><span className="inventory-card-sub">{isEquipment ? item.serial_number : item.role}</span><span className="inventory-card-bottom"><span><Icon name="pin" size={14} />{item.location.neighborhood}</span><Status value={item.status} /></span></button>)}</div>
      </> : <div className="empty-state"><Icon name={items.length ? 'search' : 'list'} size={24} /><strong>{items.length ? 'Nenhum registro encontrado' : `Ainda não há ${isEquipment ? 'equipamentos' : 'agentes'} cadastrados`}</strong><p>{items.length ? 'Tente outro termo ou ajuste os filtros para ampliar a busca.' : `Use o botão “Novo ${isEquipment ? 'equipamento' : 'agente'}” para fazer o primeiro cadastro.`}</p></div>}
      <Pagination total={visible.length} page={currentPage} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={changePageSize} />
    </section>
  </div>;
}
