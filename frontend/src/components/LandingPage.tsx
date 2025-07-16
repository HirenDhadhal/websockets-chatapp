import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="flex flex-col">
      LandingPage
      <button>
        <Link to={'/login'}>Login</Link>
      </button>
      <button>
        <Link to={'/signup'}>Signup</Link>
      </button>
      <button>
        <Link to={'/dashboard'}>Dashboard</Link>
      </button>
    </div>
  );
};

export default LandingPage;
