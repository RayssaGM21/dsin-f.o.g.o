import { Status } from '../lib/labels.jsx';
import Icon from './Icon.jsx';

function Field({ label, value }) {
  return <div className="map-detail-field"><span>{label}</span><strong>{value || '—'}</strong></div>;
}

export default function MapResourceInspector({ selected, counts, onClear, onEdit, onNavigate }) {
  if (!selected) return <aside className="map-inspector" aria-label="Detalhes do recurso">
    <div className="map-panel-header"><span className="panel-kicker">PAINEL DE DETALHES</span><h3>Visão territorial</h3><p>Selecione um marcador ou item da lista para gerenciar o recurso.</p></div>
    <div className="map-inspector-empty"><div className="map-inspector-empty-icon"><Icon name="pin" size={27} /></div><strong>A cidade no centro da operação</strong><p>Localize equipamentos e equipes, confira o estado atual e abra a edição diretamente daqui.</p></div>
    <div className="map-inspector-totals"><div><strong>{counts.equipment}</strong><span>equipamentos</span></div><div><strong>{counts.agents}</strong><span>agentes</span></div></div>
  </aside>;

  const { kind, item } = selected;
  const isEquipment = kind === 'equipment';
  const location = item.location;
  const coordinates = `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`;
  return <aside className="map-inspector" aria-label={`Detalhes de ${item.type || item.name}`}>
    <div className="map-panel-header map-inspector-header"><div><span className="panel-kicker">{isEquipment ? 'EQUIPAMENTO' : 'AGENTE EM CAMPO'}</span><h3>{item.type || item.name}</h3></div><button className="map-dismiss" type="button" onClick={onClear} aria-label="Fechar detalhes"><Icon name="close" size={17} /></button></div>
    <div className="map-inspector-body"><Status value={item.status} />
      <div className="map-detail-group"><h4>Identificação</h4>{isEquipment ? <><Field label="Número de série" value={item.serial_number} /><Field label="Marca / modelo" value={[item.brand, item.model].filter(Boolean).join(' / ')} /></> : <Field label="Função" value={item.role} />}<Field label="Órgão responsável" value={item.agency} /></div>
      <div className="map-detail-group"><h4>Localização</h4><Field label="Bairro" value={location.neighborhood} /><Field label="Endereço" value={[location.street, location.reference].filter(Boolean).join(', ')} /><Field label="Coordenadas" value={coordinates} /></div>
      {isEquipment && <div className="map-detail-group"><h4>Manutenção</h4><Field label="Prioridade" value={{ none: 'Sem demanda', scheduled: 'Programada', immediate: 'Imediata' }[item.maintenance_priority]} /><Field label="Próxima manutenção" value={item.next_maintenance ? item.next_maintenance.slice(0, 10).split('-').reverse().join('/') : '—'} /></div>}
    </div>
    <div className="map-inspector-actions"><button type="button" className="primary-button" onClick={() => onEdit(kind, item, true)}>Editar registro <Icon name="arrow" size={16} /></button><button type="button" className="text-link" onClick={() => onNavigate('inventory')}>Abrir inventário</button></div>
  </aside>;
}
