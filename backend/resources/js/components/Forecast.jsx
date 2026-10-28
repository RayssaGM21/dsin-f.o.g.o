import Icon from './Icon.jsx';

const levelLabels = { alto: 'Alto', moderado: 'Moderado', baixo: 'Baixo' };
const signalLabels = {
  increase: 'Aumento recente',
  stable: 'Sem aumento recente',
  insufficient_data: 'Base de alertas insuficiente',
};

export default function Forecast({ data, onNavigate }) {
  const increases = data.regions.filter((region) => region.signal === 'increase').length;

  return <div className="forecast-workspace">
    <div className="page-intro"><div><span className="panel-kicker">ANÁLISE OPERACIONAL</span><h2>Onde a operação pede atenção</h2><p>Prioridade atual, mudança recente de alertas e qualidade do histórico por região.</p></div><span className="analysis-tag"><Icon name="activity" size={16} /> Indicadores explicáveis</span></div>
    <section className="forecast-context" aria-label="Resumo da análise"><div className="forecast-context-icon"><Icon name="activity" size={23} /></div><div><h3>{increases ? `${increases} ${increases === 1 ? 'região com aumento recente' : 'regiões com aumento recente'}` : 'Acompanhe os sinais por região'}</h3><p>O índice ordena a prioridade operacional. A estimativa só aparece quando há histórico mínimo; ela não representa probabilidade de ocorrência.</p></div></section>
    {!data.regions.length && <section className="panel forecast-empty" aria-label="Análise ainda sem dados"><Icon name="activity" size={26} /><h3>A análise começa com os cadastros</h3><p>Registre equipamentos e agentes com localização para visualizar os bairros. Os sinais temporais precisam de eventos de telemetria ao longo dos dias.</p><button type="button" className="primary-button" onClick={() => onNavigate('inventory')}>Abrir inventário <Icon name="arrow" size={16} /></button></section>}
    <section className="forecast-list" aria-label="Regiões por prioridade operacional">{data.regions.map((region, index) => <article className="forecast-row" key={region.neighborhood}>
      <div className="forecast-rank">{String(index + 1).padStart(2, '0')}</div>
      <div className="forecast-main"><div className="forecast-title"><h3>{region.neighborhood}</h3><span className={`risk risk-${region.level}`}>Risco {levelLabels[region.level] || region.level}</span></div><div className="forecast-bar" aria-label={`Índice de prioridade ${region.risk_index} de 100`}><i className={`level-${region.level}`} style={{ width: `${region.risk_index}%` }} /></div><span className={`forecast-signal signal-${region.signal}`}>{signalLabels[region.signal]}</span><p className="evidence">{region.evidence}</p><p className="recommendation"><strong>Próxima ação</strong> {region.recommendation}</p></div>
      <div className="forecast-figures"><div><strong className="risk-number">{region.risk_index}<span>/ 100</span></strong><small>Índice de prioridade</small></div><div><strong>{region.expected_alerts_next_24h ?? '—'}</strong><small>Alertas estimados em 24h</small></div><div><strong>{region.unavailable_equipment}</strong><small>Indisponíveis</small></div></div>
      <div className="forecast-data-quality"><span>Base diária: <strong>{region.baseline_alerts_per_day ?? '—'}</strong></span><span>Dias com telemetria: <strong>{region.observed_days_28d}/28</strong></span><span>Erro retrospectivo: <strong>{region.backtest_mae ?? '—'}</strong></span></div>
    </article>)}</section>
    <details className="panel methodology"><summary>Metodologia e limites da análise</summary><p>{data.method}</p><p>{data.limitations}</p><p>O erro retrospectivo é o desvio médio absoluto em alertas por dia. “—” indica base insuficiente de alertas ou dias com telemetria para calcular ou validar a estimativa.</p></details>
  </div>;
}
