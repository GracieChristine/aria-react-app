import { useState } from 'react'

export default function FilterBar({ onSearch }) {
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch({ location, checkIn, checkOut, guests })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-white border border-aria-soft-gray rounded-2xl shadow-aria-sm p-2 my-6"
    >
      <div className="flex-1 flex flex-col px-5 py-2.5 border-r border-aria-soft-gray">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-aria-text-dark">
          Location
        </span>
        <input
          className="border-none outline-none bg-transparent text-sm text-aria-text-dark placeholder:text-aria-text-light mt-0.5"
          type="text"
          placeholder="Where are you going?"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </div>

      <div className="flex-1 flex flex-col px-5 py-2.5 border-r border-aria-soft-gray">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-aria-text-dark">
          Check in
        </span>
        <input
          className="border-none outline-none bg-transparent text-sm text-aria-text-dark placeholder:text-aria-text-light mt-0.5"
          type="text"
          placeholder="Add dates"
          value={checkIn}
          onChange={e => setCheckIn(e.target.value)}
        />
      </div>

      <div className="flex-1 flex flex-col px-5 py-2.5 border-r border-aria-soft-gray">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-aria-text-dark">
          Check out
        </span>
        <input
          className="border-none outline-none bg-transparent text-sm text-aria-text-dark placeholder:text-aria-text-light mt-0.5"
          type="text"
          placeholder="Add dates"
          value={checkOut}
          onChange={e => setCheckOut(e.target.value)}
        />
      </div>

      <div className="flex-1 flex flex-col px-5 py-2.5">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.05em] text-aria-text-dark">
          Guests
        </span>
        <input
          className="border-none outline-none bg-transparent text-sm text-aria-text-dark placeholder:text-aria-text-light mt-0.5"
          type="text"
          placeholder="Add guests"
          value={guests}
          onChange={e => setGuests(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary shrink-0 m-1">
        Search
      </button>
    </form>
  )
}
