// pages/_app.js
import Router from 'next/router';
import NProgress from 'nprogress';
import '../styles/nprogress.css';
import '../styles/globals.css';
import { PasswordProvider } from '../contexts/PasswordContext';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <PasswordProvider>
      <Component {...pageProps} />
      <footer className="text-center p-4 text-xs text-gray-500" style={{ fontFamily: 'Lexend, sans-serif' }}>
        Esta página es de uso exclusivo para el personal autorizado de la Institución Educativa Centenario. El acceso o uso indebido del sitio puede acarrear sanciones disciplinarias conforme a las normativas internas.
      </footer>
    </PasswordProvider>
  );
}


export default MyApp;
