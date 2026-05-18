/**
 * Layout.jsx — Main Application Layout Wrapper
 * -----------------------------------------------
 * Wraps every page with the shared Navbar and Footer.
 * The `<Outlet />` renders the current route's page component.
 *
 * Used in App.jsx as the parent of all page routes.
 */

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    // flex + min-h-screen ensures the footer sticks to the bottom on short pages
    <div className="flex flex-col min-h-screen">
      {/* Fixed top navigation bar */}
      <Navbar />

      {/* pt-16 accounts for the fixed navbar height so content isn't hidden behind it */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* Footer always at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
