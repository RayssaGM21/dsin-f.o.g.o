import { useState } from 'react';
import Brand from './Brand.jsx';
import Icon from './Icon.jsx';

export default function AuthPage({ mode }) {
  const registering = mode === 'register';
  const [values, setValues] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [pending, setPending] = useState(false);
  const update = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    setPending(true); setError(''); setFieldErrors({});
    try {
      const response = await fetch(registering ? '/register' : '/login', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }, body: JSON.stringify(values) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFieldErrors(body.errors || {});
        setError(response.status === 419 ? 'A sessão expirou. Atualize a página e tente novamente.' : body.message || 'Não foi possível continuar. Tente novamente.');
        return;
      }
      window.location.assign(body.redirect || '/platform');
    } catch {
      setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    } finally { setPending(false); }
  };

  return <div className="auth-page"><div className="auth-aside"><Brand light /><div className="auth-aside-copy"><span className="entry-kicker">CENTRAL DE OPERAÇÕES</span><h2>Informação em ordem. Cidade em movimento.</h2><p>Seu espaço para acompanhar recursos, entender o território e tomar decisões com mais clareza.</p></div><span className="auth-aside-foot">F.O.G.O. · Gestão operacional</span></div><main className="auth-main"><div className="auth-mobile-brand"><Brand /></div><a className="auth-back" href="/"><Icon name="chevronLeft" size={16}/> Voltar ao início</a><div className="auth-content"><span className="entry-kicker">{registering ? 'PRIMEIRO ACESSO' : 'BEM-VINDO DE VOLTA'}</span><h1>{registering ? 'Crie sua conta' : 'Acesse sua plataforma'}</h1><p>{registering ? 'Preencha seus dados para começar a organizar a operação.' : 'Entre com suas credenciais para continuar de onde parou.'}</p><form onSubmit={submit} className="auth-form">{registering && <label>Nome completo<input name="name" autoComplete="name" value={values.name} onChange={update} required minLength={2} maxLength={100} placeholder="Seu nome" aria-invalid={Boolean(fieldErrors.name)}/>{fieldErrors.name && <small>{fieldErrors.name[0]}</small>}</label>}<label>E-mail<input name="email" type="email" autoComplete="email" value={values.email} onChange={update} required placeholder="voce@exemplo.com" aria-invalid={Boolean(fieldErrors.email)}/>{fieldErrors.email && <small>{fieldErrors.email[0]}</small>}</label><label>Senha<input name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} value={values.password} onChange={update} required minLength={registering ? 12 : undefined} placeholder={registering ? 'Mínimo de 12 caracteres' : 'Sua senha'} aria-invalid={Boolean(fieldErrors.password)}/>{fieldErrors.password && <small>{fieldErrors.password[0]}</small>}</label>{registering && <label>Confirme a senha<input name="password_confirmation" type="password" autoComplete="new-password" value={values.password_confirmation} onChange={update} required placeholder="Repita a senha" aria-invalid={Boolean(fieldErrors.password_confirmation)}/>{fieldErrors.password_confirmation && <small>{fieldErrors.password_confirmation[0]}</small>}</label>}{error && <div className="auth-error" role="alert">{error}</div>}<button className="entry-primary auth-submit" disabled={pending}>{pending ? 'Aguarde…' : registering ? 'Criar conta' : 'Entrar na plataforma'} <Icon name="arrow" size={17}/></button></form><div className="auth-switch">{registering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <a href={registering ? '/login' : '/register'}>{registering ? 'Entrar' : 'Criar conta'}</a></div></div><span className="auth-note">Acesso protegido por sessão. Os dados são compartilhados entre usuários autenticados deste ambiente.</span></main></div>;
}
