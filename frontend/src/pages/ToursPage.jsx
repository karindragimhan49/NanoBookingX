/**
 * ToursPage.jsx — Tour Listings Page
 * Placeholder — Full implementation coming in the next phase.
 */
import { Link } from 'react-router-dom';
const ToursPage = () => (
  <div className="container-custom section-padding text-center">
    <h1 className="text-4xl font-bold text-white mb-4">All Tours</h1>
    <p className="text-slate-400 mb-8">Browse our curated collection of Sri Lanka adventures.</p>
    <Link to="/" className="text-teal-400 hover:underline">← Back to Home</Link>
  </div>
);
export default ToursPage;
