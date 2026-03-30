import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-primary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to Flower Exchange
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            A simple and efficient platform for trading flowers
          </p>
          <Link
            to="/order"
            className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-bg-light transition text-lg"
          >
            Order ▶
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="flex-1 bg-bg-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-primary mb-3">
                Submit Orders
              </h3>
              <p className="text-text-dark">
                Easily submit your flower orders with our intuitive interface or upload CSV files.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-primary mb-3">
                Real-time Matching
              </h3>
              <p className="text-text-dark">
                Orders are matched instantly using our advanced matching engine.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-primary mb-3">
                Instant Reports
              </h3>
              <p className="text-text-dark">
                Get detailed execution reports and download them as CSV files.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
