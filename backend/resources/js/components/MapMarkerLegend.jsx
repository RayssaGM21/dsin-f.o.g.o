import { MapTypeIcon, markerStatuses, markerTypes } from '../lib/mapMarkers.jsx';

const types = ['camera', 'radar', 'traffic', 'parking', 'scale', 'gate', 'scooter', 'agent'];

export default function MapMarkerLegend({ compact = false }) {
  return <div className={`map-marker-legend ${compact ? 'map-marker-legend-compact' : ''}`} aria-label="Legenda dos marcadores">
    <div className="map-marker-legend-group"><strong>Tipo de recurso</strong><div className="map-marker-legend-items">
      {types.map(type => <span key={type} className="map-marker-legend-item"><MapTypeIcon type={type} />{markerTypes[type].label}</span>)}
    </div></div>
    <div className="map-marker-legend-group"><strong>Indicador de situação</strong><div className="map-marker-legend-items">
      {markerStatuses.map(({ key, label }) => <span key={key} className="map-marker-legend-item"><i className={`map-status-key marker-status-${key}`} />{label}</span>)}
    </div></div>
  </div>;
}
