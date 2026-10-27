import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

export function usePostalCodeLookup(initialCode, setForm) {
  const [postalCode, setPostalCode] = useState(initialCode || '');
  const [lookupEnabled, setLookupEnabled] = useState(false);
  const [lookup, setLookup] = useState({ state: 'idle', message: '' });
  const manuallyEdited = useRef(new Set());

  const changePostalCode = value => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    manuallyEdited.current.clear();
    setPostalCode(formatted);
    setLookupEnabled(true);
    setLookup({ state: 'idle', message: '' });
    setForm(previous => ({ ...previous, location: { ...previous.location, postal_code: formatted } }));
  };

  const markManualEdit = field => manuallyEdited.current.add(field);

  useEffect(() => {
    if (!lookupEnabled || postalCode.replace(/\D/g, '').length !== 8) return;

    const digits = postalCode.replace(/\D/g, '');
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLookup({ state: 'loading', message: 'Consultando CEP…' });
      try {
        const address = await api.postalCode(digits, controller.signal);
        if (controller.signal.aborted) return;
        setForm(previous => {
          if (previous.location.postal_code.replace(/\D/g, '') !== digits) return previous;
          const location = { ...previous.location };
          for (const field of ['street', 'neighborhood', 'city', 'state', 'latitude', 'longitude']) {
            if (address[field] !== null && address[field] !== '' && !manuallyEdited.current.has(field)) {
              location[field] = address[field];
            }
          }
          return { ...previous, location };
        });
        setLookup({
          state: 'success',
          message: address.latitude === null || address.longitude === null
            ? 'Dados do CEP preenchidos. Complete campos vazios e informe as coordenadas para o mapa.'
            : 'Dados do CEP e coordenadas aproximadas preenchidos. Revise antes de salvar.',
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setLookup({ state: 'error', message: error.message === 'CEP não encontrado.'
          ? 'CEP não encontrado. Preencha o endereço manualmente.'
          : 'Não foi possível consultar o CEP. Você pode preencher o endereço manualmente.' });
      }
    }, 400);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [lookupEnabled, postalCode, setForm]);

  return { postalCode, changePostalCode, markManualEdit, lookup };
}
