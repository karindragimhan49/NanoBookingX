/**
 * LoginPage.jsx — User Login Page
 * Placeholder — Full implementation coming in the next phase.
 */
import { Link } from 'react-router-dom';
const LoginPage = () => (
  <div className="container-custom section-padding text-center">
    <h1 className="text-4xl font-bold text-white mb-4">Sign In</h1>
    <p className="text-slate-400 mb-4">Full login form coming soon.</p>
    <Link to="/register" className="text-teal-400 hover:underline">Don't have an account? Register →</Link>
  </div>
);
export default LoginPage;
