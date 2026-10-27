import Icon from './Icon.jsx';

const levelLabels = { alto: 'Alto', moderado: 'Moderado', baixo: 'Baixo' };

export default function Forecast({ data, onNavigate }) {
  return <div className="forecast-workspace">
    <div className="page-intro"><div><span className="panel-kicker">PRÓXIMAS 24 HORAS</span><h2>Antecipe os pontos de atenção</h2><p>Uma leitura orientada por sinais recentes para apoiar a priorização das equipes.</p></div><span className="analysis-tag"><Icon name="activity" size={16} /> Análise explicável</span></div>
    <section className="forecast-context"><div className="forecast-context-icon"><Icon name="activity" size={23} /></div><div><h3>Como usar esta análise</h3><p>As regiões estão ordenadas pelo índice de risco. Compare os fatores observados e use a recomendação de cada área para orientar a próxima ação.</p></div></section>
    {!data.regions.length && <section className="panel forecast-empty" aria-label="Análise ainda sem dados"><Icon name="activity" size={26} /><h3>A análise começa com os cadastros</h3><p>Registre equipamentos e agentes com localização para visualizar os bairros. Os sinais de risco ficam mais úteis à medida que eventos de telemetria são recebidos.</p><button type="button" className="primary-button" onClick={() => onNavigate('inventory')}>Abrir inventário <Icon name="arrow" size={16} /></button></section>}
    <section className="forecast-list" aria-label="Regiões por índice de risco">{data.regions.map((region, index) => <article className="forecast-row" key={region.neighborhood}>
      <div className="forecast-rank">{String(index + 1).padStart(2, '0')}</div>
      <div className="forecast-main"><div className="forecast-title"><h3>{region.neighborhood}</h3><span className={`risk risk-${region.level}`}>Risco {levelLabels[region.level] || region.level}</span></div><div className="forecast-bar"><i className={`level-${region.level}`} style={{ width: `${region.risk_index}%` }} /></div><p className="evidence">{region.evidence}</p><p className="recommendation"><strong>Próxima ação</strong> {region.recommendation}</p></div>
      <div className="forecast-figures"><div><strong className="risk-number">{region.risk_index}<span>/ 100</span></strong><small>Índice de risco</small></div><div><strong>{region.expected_alerts_next_24h}</strong><small>alertas estimados*</small></div><div><strong>{region.unavailable_equipment}</strong><small>indisponíveis</small></div></div>
    </article>)}</section>
    <div className="panel methodology"><span className="panel-kicker">TRANSPARÊNCIA</span><h3>Sobre os indicadores</h3><p>* {data.method}</p><p>{data.limitations}</p></div>
  </div>;
}
