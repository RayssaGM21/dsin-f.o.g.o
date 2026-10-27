import React from 'react';

export const markerTypes = {
  camera: { label: 'Câmera', path: 'M3 8.5h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Zm14 2 5-3v11l-5-3M6 8.5l1.5-3h5l1.5 3M7.5 13h3' },
  radar: { label: 'Radar', path: 'M3 18a9 9 0 1 1 18 0M12 13l4.5-5M8 18h8M5.5 13.5l1.3.7M18.5 13.5l-1.3.7M12 9v1' },
  traffic: { label: 'Semáforo', path: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM12 5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM12 16.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z' },
  parking: { label: 'Estacionamento', path: 'M5 21V3h14v18M8.5 16V8h4a3 3 0 0 1 0 6h-4M4 21h16' },
  scale: { label: 'Balança', path: 'M3 20h18M5 20l2-8h10l2 8M4 8h16M12 8V4M9 4h6M8 15h8' },
  gate: { label: 'Cancela', path: 'M3 20h5v-7H3v7ZM5.5 13V9l14-5 1.5 3-13 5M15 20h7M18.5 16v4' },
  scooter: { label: 'Patinete', path: 'M3 19h12l2-11h3M18 8l-1-3h-3M5 19a2 2 0 1 0 4 0M16 19a2 2 0 1 0 4 0M9 15h6' },
  agent: { label: 'Agente', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2M9 20l3-3 3 3' },
  equipment: { label: 'Equipamento', path: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h4' },
};

export const markerStatuses = [
  { key: 'operational', label: 'Operacional' },
  { key: 'attention', label: 'Atenção' },
  { key: 'unavailable', label: 'Indisponível' },
  { key: 'agent', label: 'Agente em serviço' },
  { key: 'off-duty', label: 'Agente fora de serviço' },
];

export function markerType(kind, type = '') {
  if (kind === 'agents') return 'agent';
  const value = String(type).toLocaleLowerCase('pt-BR');
  if (value.includes('câmera') || value.includes('camera')) return 'camera';
  if (value.includes('radar')) return 'radar';
  if (value.includes('semáforo') || value.includes('semaforo')) return 'traffic';
  if (value.includes('totem') || value.includes('estacionamento')) return 'parking';
  if (value.includes('balança') || value.includes('balanca')) return 'scale';
  if (value.includes('cancela')) return 'gate';
  if (value.includes('patinete')) return 'scooter';
  return 'equipment';
}

export function markerStatus(status) {
  if (status === 'operational') return 'operational';
  if (status === 'planned' || status === 'maintenance') return 'attention';
  if (status === 'active' || status === 'available') return 'agent';
  if (status === 'off_duty') return 'off-duty';
  return 'unavailable';
}

export function markerSvg(type) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${markerTypes[type].path}"/></svg>`;
}

export function MapTypeIcon({ type, className = '' }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={markerTypes[type].path} /></svg>;
}
