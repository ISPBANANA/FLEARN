import { UserProvider } from '@auth0/nextjs-auth0/client';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <div className="app">
        <Component {...pageProps} />
      </div>
    </UserProvider>
  );
}
