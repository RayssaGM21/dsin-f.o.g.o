import Brand from './Brand.jsx';
import Icon from './Icon.jsx';

const features = [
  { icon: 'list', number: '01', title: 'Inventário confiável', description: 'Cadastre equipamentos e agentes com localização, situação e informações de manutenção.' },
  { icon: 'map', number: '02', title: 'Território em foco', description: 'Encontre os recursos no mapa, filtre o que importa e abra os detalhes sem perder o contexto.' },
  { icon: 'activity', number: '03', title: 'Prioridades visíveis', description: 'Acompanhe indicadores, alertas e uma análise de risco explicável por região.' },
];

export default function LandingPage({ signedIn }) {
  const platformUrl = signedIn ? '/platform' : '/register';

  return <div className="entry-page landing-page">
    <header className="entry-header landing-header">
      <Brand />
      <nav aria-label="Navegação principal">
        <a href="#plataforma">A plataforma</a>
        <a href="#como-funciona">Como funciona</a>
        <a href={signedIn ? '/platform' : '/login'}>{signedIn ? 'Abrir plataforma' : 'Entrar'}</a>
        <a className="entry-header-cta" href={platformUrl}>{signedIn ? 'Ir para o painel' : 'Criar conta'} <Icon name="arrow" size={16} /></a>
      </nav>
    </header>

    <main>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <span className="landing-overline"><span className="landing-overline-rule" /> GESTÃO OPERACIONAL URBANA</span>
            <h1 id="landing-title">A cidade em foco.<br/><em>A operação em ordem.</em></h1>
            <p>Reúna equipamentos, equipes e sinais de atenção em uma visão clara do território. Da consulta à próxima ação, tudo no mesmo lugar.</p>
            <div className="landing-hero-actions">
              <a className="entry-primary" href={platformUrl}>{signedIn ? 'Abrir minha central' : 'Criar minha conta'} <Icon name="arrow" size={18} /></a>
              <a className="landing-text-link" href="#plataforma">Conhecer a plataforma <Icon name="arrow" size={16} /></a>
            </div>
            <div className="landing-hero-proof"><span><Icon name="check" size={16} /> Cadastro de recursos</span><span><Icon name="check" size={16} /> Mapa interativo</span><span><Icon name="check" size={16} /> Acesso protegido</span></div>
          </div>
        </div>
      </section>

      <section className="landing-intro" id="plataforma" aria-labelledby="platform-title">
        <div><span className="landing-section-label">UMA CENTRAL PARA A ROTINA REAL</span><h2 id="platform-title">Menos tempo procurando.<br/>Mais clareza para agir.</h2></div>
        <p>O F.O.G.O. organiza o que está distribuído pela cidade em um fluxo simples: registre os recursos, visualize a operação e identifique onde concentrar a atenção.</p>
      </section>

      <section className="landing-features" id="como-funciona" aria-label="Recursos da plataforma">
        {features.map(feature => <article className="landing-feature" key={feature.number}>
          <div className="landing-feature-top"><span className="landing-feature-icon"><Icon name={feature.icon} size={23} /></span><span className="landing-feature-number">{feature.number} / 03</span></div>
          <h3>{feature.title}</h3><p>{feature.description}</p>
        </article>)}
      </section>

      <section className="landing-final" aria-labelledby="landing-final-title">
        <div><span className="landing-section-label">COMECE PELA SUA OPERAÇÃO</span><h2 id="landing-final-title">Sua central começa com o primeiro cadastro.</h2><p>Crie uma conta, adicione seus recursos e acompanhe a cidade com mais contexto.</p></div>
        <a className="entry-primary" href={platformUrl}>{signedIn ? 'Abrir plataforma' : 'Começar agora'} <Icon name="arrow" size={18} /></a>
      </section>
    </main>

    <footer className="landing-footer"><Brand /><span>Marília - Rayssa, Victor Hugo e Maria Fernanda</span><span>© {new Date().getFullYear()} F.O.G.O.</span></footer>
  </div>;
}
