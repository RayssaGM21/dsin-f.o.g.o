import Icon from './Icon.jsx';

const steps = [
  ['01', 'Cadastre um equipamento', 'Informe identificação, situação e localização para posicioná-lo no mapa.'],
  ['02', 'Adicione sua equipe', 'Registre agentes e associe cada pessoa ao bairro onde atua.'],
  ['03', 'Acompanhe a operação', 'O mapa e os indicadores passam a refletir seus próprios registros.'],
];

export default function GettingStarted({ onAdd, onNavigate }) {
  return <section className="getting-started" aria-labelledby="getting-started-title">
    <div className="getting-started-hero panel">
      <span className="panel-kicker">PRIMEIRO ACESSO</span>
      <h2 id="getting-started-title">Comece sua operação do zero</h2>
      <p>Este ambiente está vazio e separado da demonstração. Cadastre seus recursos para construir o inventário, preencher o mapa e acompanhar os indicadores.</p>
      <div className="getting-started-actions">
        <button type="button" className="primary-button" onClick={() => onAdd('equipment')}><Icon name="plus" size={17} /> Cadastrar equipamento</button>
        <button type="button" className="secondary-button" onClick={() => onAdd('agents')}><Icon name="plus" size={17} /> Cadastrar agente</button>
      </div>
    </div>
    <div className="getting-started-steps">{steps.map(([number, title, description]) => <div className="panel getting-started-step" key={number}><span>{number}</span><strong>{title}</strong><p>{description}</p></div>)}</div>
    <button type="button" className="text-link" onClick={() => onNavigate('inventory')}>Explorar inventário <Icon name="arrow" size={16} /></button>
  </section>;
}
