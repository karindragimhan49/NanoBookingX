/**
 * TourDetailPage.jsx — Single Tour Detail Page
 * Placeholder — Full implementation coming in the next phase.
 */
import { useParams, Link } from 'react-router-dom';
const TourDetailPage = () => {
  const { id } = useParams();
  return (
    <div className="container-custom section-padding text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Tour Details</h1>
      <p className="text-slate-400 mb-2">Tour ID: {id}</p>
      <Link to="/tours" className="text-teal-400 hover:underline">← Back to Tours</Link>
    </div>
  );
};
export default TourDetailPage;
