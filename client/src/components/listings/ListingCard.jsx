import { Link } from 'react-router-dom'

export default function ListingCard({ listing }) {
  const image = listing.images?.[0]
  const rating = listing.average_rating ? Number(listing.average_rating).toFixed(1) : null

  return (
    <Link to={`/listings/${listing.id}`} className="card-hover block">
      <div className="relative overflow-hidden" style={{ height: '220px' }}>
        {image ? (
          <img
            src={image}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-aria-soft-gray flex items-center justify-center text-aria-text-light text-sm">
            No photo
          </div>
        )}
        {rating && (
          <div className="absolute bottom-2 left-2 bg-white text-aria-teal font-medium text-xs px-2.5 py-1 rounded-lg">
            ★ {rating}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif italic font-medium text-aria-teal text-[1.05rem] leading-snug line-clamp-1">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[0.8rem] text-aria-text-light">
            {listing.city}{listing.state ? `, ${listing.state}` : ''}
          </span>
          <span className="text-[0.9rem] text-aria-text-dark">
            ${listing.price_per_night} / night
          </span>
        </div>
      </div>
    </Link>
  )
}
