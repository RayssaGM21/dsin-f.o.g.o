import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { statusLabels } from '../lib/labels.jsx';
import { usePostalCodeLookup } from '../hooks/usePostalCodeLookup.js';
import SelectMenu from './SelectMenu.jsx';
import Icon from './Icon.jsx';

const fields = [
  ['neighborhood', 'Bairro', 'text'],
  ['city', 'Cidade', 'text'], ['state', 'UF', 'text'], ['street', 'Rua / avenida', 'text'],
  ['reference', 'Referência', 'text'], ['latitude', 'Latitude', 'number'], ['longitude', 'Longitude', 'number'],
];

function EditForm({ kind, item, equipmentTypes, onDone, onError }) {
  const isEquipment = kind === 'equipment';
  const [form, setForm] = useState(item || {
    type: '', serial_number: '', brand: '', model: '', agency: '', name: '', role: '',
    status: isEquipment ? 'planned' : 'available', maintenance_priority: 'none',
    next_maintenance: '', attributes: {}, location: {
      postal_code: '', neighborhood: '', city: 'São José do Rio Preto', state: 'SP',
      street: '', reference: '', latitude: '', longitude: '',
    },
  });
  const { postalCode, changePostalCode, markManualEdit, lookup } = usePostalCodeLookup(item?.location?.postal_code, setForm);
  const [attributesText, setAttributesText] = useState(JSON.stringify(item?.attributes || {}, null, 2));
  const input = (name, label, type = 'text') => <label key={name}>{label}<input type={type} step={type === 'number' ? 'any' : undefined} required={name !== 'next_maintenance'} value={form[name] || ''} onChange={event => setForm({ ...form, [name]: event.target.value })} /></label>;
  const select = (name, label, values) => <SelectMenu key={name} label={label} value={form[name]} onChange={value => setForm(previous => ({ ...previous, [name]: value }))} options={values.map(value => ({ value, label: statusLabels[value] || ({ none: 'Sem demanda', scheduled: 'Programada', immediate: 'Imediata' }[value]) || value }))} />;
  async function submit(event) {
    event.preventDefault();
    try {
      if (isEquipment && !form.type) { onError('Selecione o tipo de equipamento.'); return; }
      const payload = { ...form, location: { ...form.location } };
      for (const key of ['latitude', 'longitude']) payload.location[key] = Number(payload.location[key]);
      if (isEquipment) {
        payload.attributes = JSON.parse(attributesText);
        payload.next_maintenance ||= null;
      } else {
        for (const key of ['type', 'serial_number', 'brand', 'model', 'maintenance_priority', 'next_maintenance', 'attributes']) delete payload[key];
      }
      delete payload.id; delete payload.created_at; delete payload.updated_at;
      await api.save(kind, item?.id, payload);
      onDone();
    } catch (cause) { onError(cause.message); }
  }
  return <form onSubmit={submit}><div className="form-grid">
    {isEquipment ? <><SelectMenu label="Tipo de equipamento" value={form.type} onChange={value => setForm(previous => ({ ...previous, type: value }))} options={[{ value: '', label: equipmentTypes.length ? 'Selecione um tipo' : 'Carregando tipos…' }, ...equipmentTypes.map(type => ({ value: type, label: type }))]} required />{input('serial_number', 'Número de série')}{input('brand', 'Marca')}{input('model', 'Modelo')}{input('agency', 'Órgão responsável')}{select('status', 'Situação', ['planned', 'operational', 'malfunction', 'maintenance', 'disabled', 'stolen'])}{select('maintenance_priority', 'Manutenção', ['none', 'scheduled', 'immediate'])}{input('next_maintenance', 'Próxima manutenção', 'date')}</> : <>{input('name', 'Nome')}{input('role', 'Função')}{input('agency', 'Órgão responsável')}{select('status', 'Situação', ['active', 'available', 'off_duty'])}</>}
    <div className="form-section">LOCALIZAÇÃO</div>
    <label className="postal-code-field">CEP<input type="text" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" maxLength={9} pattern="[0-9]{5}-?[0-9]{3}" required value={postalCode} onChange={event => changePostalCode(event.target.value)} />{lookup.message && <span className={`postal-lookup-message is-${lookup.state}`} role="status" aria-live="polite">{lookup.message}</span>}</label>
    {fields.map(([name, label, type]) => <label key={name}>{label}<input type={type} step={type === 'number' ? 'any' : undefined} required value={form.location[name] ?? ''} onChange={event => { markManualEdit(name); setForm(previous => ({ ...previous, location: { ...previous.location, [name]: event.target.value } })); }} /></label>)}
    {isEquipment && <label className="full-width">Características específicas (JSON)<textarea rows="3" value={attributesText} onChange={event => setAttributesText(event.target.value)} /></label>}
  </div><div className="dialog-actions"><button type="submit" className="primary-button">Salvar registro</button></div></form>;
}

function Detail({ kind, item, onEdit, onDelete }) {
  const rows = kind === 'equipment' ? [
    ['Situação', statusLabels[item.status]], ['Série', item.serial_number], ['Marca / modelo', `${item.brand} / ${item.model}`],
    ['Órgão', item.agency], ['Manutenção', ({ none: 'Sem demanda', scheduled: 'Programada', immediate: 'Imediata' })[item.maintenance_priority]], ['Próxima manutenção', item.next_maintenance ? item.next_maintenance.slice(0, 10).split('-').reverse().join('/') : '—'],
  ] : [['Situação', statusLabels[item.status]], ['Função', item.role], ['Órgão', item.agency]];
  rows.push(['Endereço', `${item.location.street}, ${item.location.reference}`], ['Bairro / cidade', `${item.location.neighborhood}, ${item.location.city}/${item.location.state}`], ['CEP', item.location.postal_code], ['Coordenadas', `${item.location.latitude}, ${item.location.longitude}`]);
  return <><div className="detail-grid">{rows.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>{kind === 'equipment' && <div className="attributes"><small>CARACTERÍSTICAS</small><pre>{JSON.stringify(item.attributes, null, 2)}</pre></div>}<div className="dialog-actions"><button className="danger-button" onClick={onDelete}>Excluir</button><button className="secondary-button" onClick={onEdit}>Editar</button></div></>;
}

export default function ResourceDialog({ selection, equipmentTypes, onClose, onSaved }) {
  const [editing, setEditing] = useState(selection.editing || !selection.item);
  const [dialogError, setDialogError] = useState('');
  const dialogRef = useRef(null);
  const { kind, item } = selection;
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialogRef.current?.showModal();
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('.dialog-close')?.focus();
    return () => {
      dialogRef.current?.close();
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  async function remove() {
    if (!window.confirm(`Excluir ${item.type || item.name}?`)) return;
    try { await api.remove(kind, item.id); onSaved(); } catch (cause) { setDialogError(cause.message); }
  }
  return <dialog ref={dialogRef} className="dialog" aria-label={item?.type || item?.name || 'Novo registro'} onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="dialog-heading"><div><span className="eyebrow">INVENTÁRIO</span><h2>{editing ? `${item ? 'Editar' : 'Novo'} ${kind === 'equipment' ? 'equipamento' : 'agente'}` : item.type || item.name}</h2></div><button className="icon-button dialog-close" onClick={onClose} aria-label="Fechar"><Icon name="close" size={18} /></button></div>
    <div className="dialog-content">{dialogError && <div className="error dialog-error" role="alert">{dialogError}<button onClick={() => setDialogError('')} aria-label="Fechar alerta"><Icon name="close" size={16} /></button></div>}{editing ? <EditForm kind={kind} item={item} equipmentTypes={equipmentTypes} onDone={onSaved} onError={setDialogError} /> : <Detail kind={kind} item={item} onEdit={() => { setDialogError(''); setEditing(true); }} onDelete={remove} />}</div>
  </dialog>;
}
