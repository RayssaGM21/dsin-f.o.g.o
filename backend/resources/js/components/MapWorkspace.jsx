import { useMemo, useState } from 'react';
import OperationsMap from './OperationsMap.jsx';
import MapResourceList from './MapResourceList.jsx';
import MapResourceInspector from './MapResourceInspector.jsx';
import MapMarkerLegend from './MapMarkerLegend.jsx';

const initialFilters = { query: '', kind: 'all', status: '', neighborhood: '' };

export default function MapWorkspace({ equipment, agents, onEdit, onNavigate }) {
  const [filters, setFilters] = useState(initialFilters);
  const [selectedKey, setSelectedKey] = useState(null);
  const resources = useMemo(() => [
    ...equipment.map(item => ({ kind: 'equipment', item })),
    ...agents.map(item => ({ kind: 'agents', item })),
  ], [equipment, agents]);
  const base = filters.kind === 'all' ? resources : resources.filter(resource => resource.kind === filters.kind);
  const statuses = [...new Set(base.map(({ item }) => item.status))].sort();
  const neighborhoods = [...new Set(resources.map(({ item }) => item.location.neighborhood))].sort();
  const query = filters.query.trim().toLocaleLowerCase('pt-BR');
  const visible = base.filter(({ item }) => {
    const searchText = [item.type, item.name, item.serial_number, item.role, item.agency, item.location.neighborhood].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
    return (!query || searchText.includes(query)) && (!filters.status || item.status === filters.status) &&
      (!filters.neighborhood || item.location.neighborhood === filters.neighborhood);
  });
  const selected = visible.find(({ kind, item }) => `${kind}-${item.id}` === selectedKey) || null;
  const counts = { all: resources.length, equipment: equipment.length, agents: agents.length };

  function changeFilters(changes) {
    setFilters(previous => ({ ...previous, ...changes }));
    setSelectedKey(null);
  }

  return <section className="map-workspace" aria-label="Gerenciamento pelo mapa">
    <div className="map-workspace-intro"><div><span className="kicker"><i className="live-dot" /> VISÃO GEOGRÁFICA DA OPERAÇÃO</span><h2>Gerencie a cidade pelo mapa</h2><p>Selecione um ponto para consultar a situação do recurso e agir sem perder o contexto do território.</p></div><span className="map-live-count">{visible.length} {visible.length === 1 ? 'recurso visível' : 'recursos visíveis'}</span></div>
    <div className={`map-workspace-stage ${selected ? 'has-selection' : ''}`}>
      <OperationsMap equipment={visible.filter(resource => resource.kind === 'equipment').map(resource => resource.item)} agents={visible.filter(resource => resource.kind === 'agents').map(resource => resource.item)} selected={selected} onSelect={(kind, item) => setSelectedKey(`${kind}-${item.id}`)} workspace />
      <MapResourceList resources={visible} selected={selected} filters={filters} onFilterChange={changeFilters} onSelect={(kind, item) => setSelectedKey(`${kind}-${item.id}`)} neighborhoods={neighborhoods} statuses={statuses} counts={counts} />
      <MapResourceInspector selected={selected} counts={counts} onClear={() => setSelectedKey(null)} onEdit={onEdit} onNavigate={onNavigate} />
    </div>
    <MapMarkerLegend />
  </section>;
}
