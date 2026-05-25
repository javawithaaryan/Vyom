import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2>VYOM</h2>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/fraud-detection">
          Fraud Detection
        </Link>

        <Link to="/scam-analyzer">
          Scam Analyzer
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;