export default function Brand({ light = false }) {
  return <a className={`entry-brand ${light ? 'entry-brand-light' : ''}`} href="/" aria-label="F.O.G.O. — início">
    <span className="entry-brand-mark"><img src="/images/fogo-logo.png" alt="" width="54" height="50" /></span>
    <span><strong>F.O.G.O.</strong><small>GESTÃO OPERACIONAL</small></span>
  </a>;
}
