import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="page flex-1">
        <section className="flex flex-col items-center text-center py-24 px-4">
          <h1 className="text-5xl font-serif font-medium text-aria-text-dark tracking-tight mb-4">
            Find your perfect stay
          </h1>
          <p className="text-aria-text-mid text-lg mb-10 max-w-md">
            Discover unique places to stay, from cozy cottages to city apartments.
          </p>
          <div className="flex gap-3">
            <Link to="/register" className="btn-primary px-8">
              Get started
            </Link>
            <Link to="/login" className="btn-secondary px-8">
              Log in
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}