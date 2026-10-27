export const statusLabels = {
  operational: 'Operacional', planned: 'Não instalado', malfunction: 'Mau funcionamento',
  maintenance: 'Em manutenção', disabled: 'Desativado', stolen: 'Furtado',
  active: 'Em atividade', available: 'Disponível', off_duty: 'Fora de serviço',
};

export function Status({ value }) {
  return <span className={`status status-${value}`}><i />{statusLabels[value] || value}</span>;
}
