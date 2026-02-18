export default function App() {
  return (
    <div className="page">
      <h1 className="section-title">Welcome to Aria</h1>
      <p className="text-aria-text-mid mb-6">Your perfect stay awaits.</p>

      <div className="flex gap-4 mb-8">
        <button className="btn-primary">Primary</button>
        <button className="btn-secondary">Secondary</button>
        <button className="btn-ghost">Ghost</button>
        <button className="btn-danger">Danger</button>
      </div>

      <div className="card p-6 max-w-sm">
        <h2 className="text-aria-text-dark font-semibold mb-2">Test Card</h2>
        <p className="text-aria-text-mid text-sm">Soft teal, airy whites, blush accents.</p>
        <div className="flex gap-2 mt-4">
          <span className="badge-teal">Available</span>
          <span className="badge-blush">Popular</span>
          <span className="badge-success">Confirmed</span>
        </div>
      </div>
    </div>
  )
}