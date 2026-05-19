/**
 * Layout.jsx — Application Shell Wrapper
 * ========================================
 * Wraps every page route with the global Navbar and Footer.
 * The <Outlet /> from React Router renders the current page's component.
 *
 * Structure:
 *   <div (flex column, min full-height)>
 *     <Navbar />         ← Fixed top; height = 64px (h-16)
 *     <main (flex-grow)> ← Page content fills remaining height
 *       <Outlet />
 *     </main>
 *     <Footer />         ← Always at the bottom (sticky footer pattern)
 *   </div>
 *
 * The `pt-16` on <main> compensates for the fixed navbar so page
 * content starts below it, not hidden behind it.
 *
 * The `bg-gray-50` on <main> gives each page a clean off-white
 * background that distinguishes it from the white navbar and footer.
 */

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => (
  /* flex + min-h-screen ensures Footer is always at the bottom,
     even on short pages that don't fill the full viewport height */
  <div className="flex flex-col min-h-screen bg-gray-50">

    {/* Fixed top navigation bar (z-40, white, 64px tall) */}
    <Navbar />

    {/* Page content area
        - flex-grow: expands to fill space between navbar and footer
        - pt-16: 64px top padding to clear the fixed navbar
        - bg-gray-50: very light gray page background (premium light theme)
    */}
    <main className="flex-grow pt-16 bg-gray-50" id="main-content">
      <Outlet />
    </main>

    {/* Site footer — always rendered at the bottom */}
    <Footer />
  </div>
);

export default Layout;
