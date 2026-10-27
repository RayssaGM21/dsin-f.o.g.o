import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import LandingPage from './components/LandingPage.jsx';
import AuthPage from './components/AuthPage.jsx';

const root = document.getElementById('app');
const page = root.dataset.page;
createRoot(root).render(<React.StrictMode>{page === 'platform' ? <App /> : page === 'landing' ? <LandingPage signedIn={Boolean(root.dataset.userName)} /> : <AuthPage mode={page} />}</React.StrictMode>);
