import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition">
            <span>🌸</span>
            <span>Flower Exchange</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="hover:text-accent transition"
            >
              Home
            </Link>
            <Link
              to="/order"
              className="hover:text-accent transition"
            >
              Order
            </Link>
            <Link
              to="/contact"
              className="hover:text-accent transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
