/**
 * RegisterPage.jsx — User Registration Page
 * Placeholder — Full implementation coming in the next phase.
 */
import { Link } from 'react-router-dom';
const RegisterPage = () => (
  <div className="container-custom section-padding text-center">
    <h1 className="text-4xl font-bold text-white mb-4">Create Account</h1>
    <p className="text-slate-400 mb-4">Full registration form coming soon.</p>
    <Link to="/login" className="text-teal-400 hover:underline">Already have an account? Sign In →</Link>
  </div>
);
export default RegisterPage;
