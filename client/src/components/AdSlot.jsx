export default function AdSlot({ label = 'Advertisement' }) {
  return <aside className="ad-slot" aria-label={label}><span>{label}</span><small>Ad space</small></aside>
}
