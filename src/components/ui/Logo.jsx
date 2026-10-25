import { Link } from "react-router-dom";

export default function Logo({ to = "/" }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-extrabold flex items-center justify-center">
        T
      </span>
      <span className="text-xl font-extrabold tracking-tight">TESTU</span>
    </Link>
  );
}
