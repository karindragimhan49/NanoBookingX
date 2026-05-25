import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '70px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
