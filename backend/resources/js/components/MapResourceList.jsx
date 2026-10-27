import { Status, statusLabels } from '../lib/labels.jsx';
import Icon from './Icon.jsx';
import SelectMenu from './SelectMenu.jsx';
import { MapTypeIcon, markerType } from '../lib/mapMarkers.jsx';

export default function MapResourceList({ resources, selected, filters, onFilterChange, onSelect, neighborhoods, statuses, counts }) {
  return <aside className="map-list-panel" aria-label="Explorar recursos no mapa">
    <div className="map-panel-header"><span className="panel-kicker">EXPLORAR RECURSOS</span><h3>Localizar no mapa</h3><p>Busque um recurso ou selecione um marcador.</p></div>
    <div className="map-list-controls">
      <label className="search-field"><Icon name="search" size={17} /><input value={filters.query} onChange={event => onFilterChange({ query: event.target.value })} placeholder="Nome, série ou bairro" aria-label="Buscar recurso no mapa" /></label>
      <div className="map-kind-tabs" role="group" aria-label="Tipo de recurso">
        {[['all', 'Todos', counts.all], ['equipment', 'Equipamentos', counts.equipment], ['agents', 'Agentes', counts.agents]].map(([kind, label, count]) => <button key={kind} type="button" className={filters.kind === kind ? 'active' : ''} aria-pressed={filters.kind === kind} onClick={() => onFilterChange({ kind, status: '' })}>{label}<span>{count}</span></button>)}
      </div>
      <div className="map-list-filters"><SelectMenu label="Situação" value={filters.status} onChange={status => onFilterChange({ status })} options={[{ value: '', label: 'Todas as situações' }, ...statuses.map(value => ({ value, label: statusLabels[value] || value }))]} /><SelectMenu label="Bairro" value={filters.neighborhood} onChange={neighborhood => onFilterChange({ neighborhood })} options={[{ value: '', label: 'Todos os bairros' }, ...neighborhoods.map(value => ({ value, label: value }))]} /></div>
    </div>
    <div className="map-list-heading"><strong>{resources.length} {resources.length === 1 ? 'recurso' : 'recursos'} no mapa</strong>{(filters.query || filters.status || filters.neighborhood || filters.kind !== 'all') && <button type="button" onClick={() => onFilterChange({ query: '', kind: 'all', status: '', neighborhood: '' })}>Limpar</button>}</div>
    <div className="map-resource-list">{resources.length ? resources.map(({ kind, item }) => <button key={`${kind}-${item.id}`} type="button" className={`map-resource-item ${selected?.kind === kind && selected.item.id === item.id ? 'active' : ''}`} aria-pressed={selected?.kind === kind && selected.item.id === item.id} onClick={() => onSelect(kind, item)}>
      <span className="resource-item-icon"><MapTypeIcon type={markerType(kind, item.type)} /></span>
      <span className="resource-item-copy"><strong>{item.type || item.name}</strong><small>{item.location.neighborhood} · {item.serial_number || item.role}</small><Status value={item.status} /></span><Icon name="chevronRight" size={16} className="resource-item-arrow" />
    </button>) : <div className="map-list-empty"><Icon name={counts.all ? 'search' : 'pin'} size={23} /><strong>{counts.all ? 'Nenhum recurso encontrado' : 'O mapa ainda está vazio'}</strong><p>{counts.all ? 'Experimente outros filtros para ampliar a busca.' : 'Cadastre equipamentos ou agentes no inventário para vê-los aqui.'}</p></div>}</div>
  </aside>;
}
