import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FilterBar from '../components/listings/FilterBar'
import ListingCard from '../components/listings/ListingCard'

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/listings')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load listings')
        return r.json()
      })
      .then(data => setListings(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleSearch(filters) {
    // TODO: pass filters to API
    console.log('Search:', filters)
  }

  return (
    <div className="min-h-screen flex flex-col bg-aria-offwhite">
      <Navbar />
      <main className="page flex-1">
        <FilterBar onSearch={handleSearch} />

        <div className="mb-6">
          <h1 className="font-serif italic font-normal text-[2rem] text-aria-text-dark leading-snug">
            Find your place
          </h1>
          {!loading && !error && (
            <p className="text-sm text-aria-text-light mt-1">
              {listings.length > 0
                ? `${listings.length} listing${listings.length === 1 ? '' : 's'} available`
                : 'No listings yet. Check back soon.'}
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-16 text-aria-text-mid">Loading listings...</div>
        )}

        {error && (
          <div className="text-center py-16 text-aria-error">{error}</div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
