import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex gap-5 items-center">
        <h1 className="font-bold text-lg">Study me</h1>
        <ul className="flex gap-3 text-stone-600">
          <li>
            <Link href="features">Features</Link>
          </li>
          <li>
            <Link href="resources">Resources</Link>
          </li>
          <li>
            <Link href="updates">Updates</Link>
          </li>
          <li>
            <Link href="support">Support</Link>
          </li>
          <li>
            <Link href="pricing">Pricing</Link>
          </li>
        </ul>
      </div>
      <div className="flex gap-3">
        <Link href="/login" className="py-1 px-4 bg-slate-200 rounded-lg">
          Login
        </Link>
        <Link
          href="/signup"
          className="py-1 px-4 bg-indigo-500 text-white rounded-lg"
        >
          Start for free
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
