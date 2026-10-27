export async function request(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '', ...options.headers },
  });
  if (response.status === 401) {
    window.location.assign('/login');
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message : `Erro HTTP ${response.status}`;
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  postalCode: (cep, signal) => request(`postal-codes/${cep}`, { signal }),
  equipmentTypes: () => request('equipment-types'),
  equipment: () => request('equipment'),
  agents: () => request('agents'),
  dashboard: () => request('dashboard'),
  forecast: () => request('forecast'),
  save: (kind, id, data) => request(`${kind}${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(data),
  }),
  remove: (kind, id) => request(`${kind}/${id}`, { method: 'DELETE' }),
};
