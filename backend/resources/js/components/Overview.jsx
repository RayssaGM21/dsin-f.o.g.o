import { useMemo, useState } from 'react';
import OperationsMap from './OperationsMap.jsx';
import { statusLabels } from '../lib/labels.jsx';
import Icon from './Icon.jsx';
import SelectMenu from './SelectMenu.jsx';
import MapMarkerLegend from './MapMarkerLegend.jsx';
import GettingStarted from './GettingStarted.jsx';

function Metric({ label, value, detail, tone = '' }) {
  return <div className={`metric ${tone}`}><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export default function Overview({ data, equipment, agents, onSelect, onAdd, onNavigate }) {
  const [filters, setFilters] = useState({ type: '', status: '', neighborhood: '' });
  const options = useMemo(() => ({
    type: [...new Set(equipment.map(item => item.type))].sort(),
    status: [...new Set(equipment.map(item => item.status))].sort(),
    neighborhood: [...new Set(equipment.map(item => item.location.neighborhood))].sort(),
  }), [equipment]);
  const filtered = equipment.filter(item => (!filters.type || item.type === filters.type) &&
    (!filters.status || item.status === filters.status) &&
    (!filters.neighborhood || item.location.neighborhood === filters.neighborhood));
  const visibleAgents = filters.type || filters.status ? [] :
    agents.filter(item => !filters.neighborhood || item.location.neighborhood === filters.neighborhood);
  const hasFilters = Object.values(filters).some(Boolean);
  const resetFilters = () => setFilters({ type: '', status: '', neighborhood: '' });

  if (!equipment.length && !agents.length) return <GettingStarted onAdd={onAdd} onNavigate={onNavigate} />;

  return <div className="overview-dashboard">
    <section className="overview-lead" aria-labelledby="operation-title">
      <div><span className="kicker"><i className="live-dot" /> MONITORAMENTO EM TEMPO REAL</span><h2 id="operation-title">Situação da operação</h2><p>Acompanhe recursos em campo e identifique o que precisa de ação.</p></div>
      <button className="text-link lead-link" onClick={() => onNavigate('inventory')}>Abrir inventário <Icon name="arrow" size={16} /></button>
    </section>
    <section className="metrics" aria-label="Indicadores da operação">
      <div className="metric metric-featured"><span className="metric-label">Disponibilidade da rede</span><div className="featured-value">{data.indicators.availability_percent === null ? '—' : <>{data.indicators.availability_percent}<span>%</span></>}</div><small>{data.indicators.equipment_total ? `${data.indicators.operational} de ${data.indicators.equipment_total} equipamentos operacionais` : 'Cadastre equipamentos para acompanhar'}</small><div className="availability-track"><i style={{ width: `${data.indicators.availability_percent ?? 0}%` }} /></div></div>
      <Metric label="Equipamentos" value={data.indicators.equipment_total} detail="Recursos cadastrados" />
      <Metric label="Indisponíveis" value={data.indicators.unavailable} detail="Precisam de acompanhamento" tone="metric-alert" />
      <Metric label="Agentes ativos" value={data.indicators.agents_active} detail="Em atividade agora" />
    </section>
    <div className="content-grid">
      <section className="panel map-panel" aria-labelledby="map-title">
        <div className="panel-heading"><div><span className="panel-kicker">TERRITÓRIO</span><h3 id="map-title">Mapa operacional</h3><p>Localização dos equipamentos e agentes</p></div><button className="text-link" onClick={() => onNavigate('map')}>Abrir mapa <Icon name="arrow" size={15} /></button></div>
        <div className="filter-row">
          {Object.entries(options).map(([key, values]) => <SelectMenu key={key} label={{ type: 'Tipo de recurso', status: 'Situação', neighborhood: 'Bairro' }[key]} value={filters[key]} onChange={value => setFilters(previous => ({ ...previous, [key]: value }))} options={[{ value: '', label: { type: 'Todos os tipos', status: 'Todas as situações', neighborhood: 'Todos os bairros' }[key] }, ...values.map(value => ({ value, label: key === 'status' ? statusLabels[value] : value }))]} />)}
          {hasFilters && <button className="filter-reset" onClick={resetFilters}>Limpar filtros</button>}
        </div>
        <OperationsMap equipment={filtered} agents={visibleAgents} onSelect={onSelect} />
        <MapMarkerLegend compact />
      </section>
      <div className="side-stack">
        <section className="panel" aria-labelledby="alerts-title"><div className="panel-heading"><div><span className="panel-kicker">PRIORIDADES</span><h3 id="alerts-title">Alertas críticos</h3><p>Ocorrências que exigem atenção</p></div><span className="count">{data.alerts.length}</span></div><div className="list">{data.alerts.length ? data.alerts.slice(0, 4).map(item => <button className="list-item list-action" key={item.id} onClick={() => { const resource = equipment.find(resource => resource.serial_number === item.serial_number); if (resource) onSelect('equipment', resource); }}><span className="list-icon alert-icon"><Icon name="alert" size={17} /></span><span className="list-copy"><strong>{item.description}</strong><small>{item.neighborhood} · {item.serial_number}</small></span><time>{new Date(item.occurred_at).toLocaleDateString('pt-BR')}</time></button>) : <p className="empty"><Icon name="check" size={18} /> Nenhum alerta crítico no momento.</p>}</div></section>
        <section className="panel" aria-labelledby="maintenance-title"><div className="panel-heading"><div><span className="panel-kicker">PRÓXIMAS AÇÕES</span><h3 id="maintenance-title">Manutenção</h3><p>Intervenções imediatas ou próximas</p></div></div><div className="list">{data.maintenance_due.length ? data.maintenance_due.slice(0, 4).map(item => <button className="list-item list-action" key={item.id} onClick={() => onSelect('equipment', item)}><span className="list-icon maintenance-icon"><Icon name="tool" size={16} /></span><span className="list-copy"><strong>{item.type}</strong><small>{item.location.neighborhood} · {item.serial_number}</small></span><span className={`priority ${item.maintenance_priority === 'immediate' ? 'urgent' : ''}`}>{item.maintenance_priority === 'immediate' ? 'URGENTE' : 'PROGRAMADA'}</span></button>) : <p className="empty"><Icon name="check" size={18} /> Nenhuma manutenção próxima.</p>}</div></section>
      </div>
    </div>
    <section className="panel region-panel" aria-labelledby="regions-title"><div className="panel-heading"><div><span className="panel-kicker">DISTRIBUIÇÃO</span><h3 id="regions-title">Saúde por região</h3><p>Disponibilidade dos recursos em cada bairro</p></div></div><div className="region-list">{data.regions.map(region => { const percentage = region.equipment ? Math.round(region.operational / region.equipment * 100) : 0; return <div className="region-row" key={region.name}><strong>{region.name}</strong><span>{region.equipment} recursos</span><div className="region-bar" aria-label={`${percentage}% operacionais`}><i style={{ width: `${percentage}%` }} /></div><b>{percentage}%</b><small>{region.unavailable} indisponíveis</small></div>; })}</div></section>
  </div>;
}
