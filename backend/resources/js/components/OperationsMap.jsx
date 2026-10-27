import { useEffect, useMemo, useState } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { statusLabels } from '../lib/labels.jsx';
import { markerStatus, markerSvg, markerType, markerTypes } from '../lib/mapMarkers.jsx';

const CITY_CENTER = [-20.813, -49.375];
const TILE_URL = import.meta.env.VITE_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
function resourceIcon(kind, item, selected) {
  const type = markerType(kind, item.type);
  const status = markerStatus(item.status);
  return divIcon({
    className: `resource-marker marker-status-${status} ${selected ? 'resource-marker-selected' : ''}`,
    html: `<span class="map-pin"><span class="map-pin-icon">${markerSvg(type)}</span><span class="map-pin-status"></span><span class="map-pin-label">${markerTypes[type].label}</span></span>`,
    iconSize: [42, 48],
    iconAnchor: [21, 46],
  });
}

function clusterIcon(resources) {
  const types = [...new Set(resources.map(({ kind, item }) => markerType(kind, item.type)))].slice(0, 3);
  return divIcon({
    className: 'resource-cluster',
    html: `<span class="map-cluster-icons">${types.map(markerSvg).join('')}</span><span class="map-cluster-count">${resources.length}</span>`,
    iconSize: [54, 48],
    iconAnchor: [27, 42],
  });
}

function ResourceMarkers({ resources, onSelect, selected }) {
  const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const [zoom, setZoom] = useState(map.getZoom());
  const groups = zoom < 17 ? Object.values(resources.reduce((byArea, resource) => {
    const area = resource.item.location.neighborhood;
    (byArea[area] ??= []).push(resource);
    return byArea;
  }, {})) : resources.map(resource => [resource]);

  return groups.map(group => {
    if (group.length > 1) {
      const position = [0, 1].map(index => group.reduce((sum, { item }) =>
        sum + Number(index === 0 ? item.location.latitude : item.location.longitude), 0) / group.length);
      const label = `${group.length} recursos em ${group[0].item.location.neighborhood}`;
      return <Marker key={`cluster-${group[0].item.location.neighborhood}`} position={position} icon={clusterIcon(group)} title={`${label}. Ampliar para ver cada recurso`} eventHandlers={{ click: () => map.flyTo(position, 17, { duration: 0.45 }) }}>
        <Tooltip direction="top" offset={[0, -30]}>{label} · clique para ampliar</Tooltip>
      </Marker>;
    }
    const { kind, item } = group[0];
    return <Marker key={`${kind}-${item.id}`}
      position={[Number(item.location.latitude), Number(item.location.longitude)]}
      icon={resourceIcon(kind, item, selected?.kind === kind && selected?.item.id === item.id)}
      title={`${item.type || item.name} · ${statusLabels[item.status] || item.status} · ${item.location.neighborhood}`}
      eventHandlers={{ click: () => onSelect(kind, item) }}>
      <Tooltip direction="top" offset={[0, -37]}>{item.type || item.name} · {statusLabels[item.status] || item.status}</Tooltip>
    </Marker>;
  });
}

function FitResources({ positions, workspace }) {
  const map = useMap();
  const positionKey = positions.map(([latitude, longitude]) => `${latitude},${longitude}`).join('|');
  useEffect(() => {
    if (positions.length === 1) map.setView(positions[0], 15);
    else if (positions.length > 1) {
      const sidePadding = workspace && map.getSize().x > 850 ? 310 : 40;
      map.fitBounds(latLngBounds(positions), { paddingTopLeft: [sidePadding, 40], paddingBottomRight: [sidePadding, 40], maxZoom: 15 });
    }
  }, [map, positionKey, workspace]);
  return null;
}

function FocusResource({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    map.flyTo([Number(selected.item.location.latitude), Number(selected.item.location.longitude)], Math.max(map.getZoom(), 17), { duration: 0.45 });
  }, [map, selected?.kind, selected?.item.id]);
  return null;
}

export default function OperationsMap({ equipment, agents, onSelect, selected = null, workspace = false }) {
  const [tileError, setTileError] = useState(false);
  const resources = useMemo(() => [
    ...equipment.map(item => ({ kind: 'equipment', item })),
    ...agents.map(item => ({ kind: 'agents', item })),
  ].filter(({ item }) => Number.isFinite(Number(item.location.latitude)) &&
    Number.isFinite(Number(item.location.longitude))), [equipment, agents]);
  const positions = resources.map(({ item }) => [Number(item.location.latitude), Number(item.location.longitude)]);

  return <div className="map" aria-label="Mapa interativo OpenStreetMap com recursos georreferenciados">
    <MapContainer center={CITY_CENTER} zoom={13} scrollWheelZoom={false} className="map-canvas">
      <TileLayer url={TILE_URL} attribution={OSM_ATTRIBUTION} maxZoom={19}
        eventHandlers={{ tileerror: () => setTileError(true), tileload: () => setTileError(false) }} />
      <FitResources positions={positions} workspace={workspace} />
      <FocusResource selected={selected} />
      <ResourceMarkers resources={resources} onSelect={onSelect} selected={selected} />
    </MapContainer>
    {tileError && <div className="map-error" role="status">Não foi possível carregar o mapa. Verifique a conexão com o provedor de tiles.</div>}
  </div>;
}
