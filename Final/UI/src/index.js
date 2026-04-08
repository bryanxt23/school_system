import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/App';
import './styles/globals.css';

// Inject auth headers into every API fetch call (skip truly external URLs like Cloudinary)
import API_BASE from './config';
const _nativeFetch = window.fetch.bind(window);
window.fetch = function (resource, options = {}) {
  const url = typeof resource === 'string' ? resource : resource?.url ?? '';
  const isApiCall = url.startsWith(window.location.origin) || url.includes('localhost:8080') || url.startsWith(API_BASE);
  if (url.startsWith('http') && !isApiCall) {
    return _nativeFetch(resource, options);
  }
  const headers = new Headers(options.headers || {});

  try {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');
    if (user && user.role && !headers.has('X-User-Role')) headers.set('X-User-Role', user.role);
    if (user && user.username && !headers.has('X-Username')) headers.set('X-Username', user.username);
    if (user && user.employeeCode && !headers.has('X-Employee-Code')) headers.set('X-Employee-Code', user.employeeCode);
    if (user && user.linkedEntityId != null && !headers.has('X-Linked-Entity-Id')) headers.set('X-Linked-Entity-Id', String(user.linkedEntityId));
    if (user && user.linkedEntityType && !headers.has('X-Linked-Entity-Type')) headers.set('X-Linked-Entity-Type', user.linkedEntityType);
  } catch (e) { /* ignore */ }

  return _nativeFetch(resource, { ...options, headers });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
