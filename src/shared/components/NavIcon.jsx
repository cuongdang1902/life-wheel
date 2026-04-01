/**
 * NavIcon — renders the custom icon image for each app section.
 * Falls back to emoji if no matching icon exists.
 */

const ICON_MAP = {
  wheel:      '/wheel-of-life.ico',
  charts:     '/icons/Charts.ico',
  goals:      '/icons/Goals.png',
  dashboard:  '/icons/Dashboard.ico',
  dreams:     '/icons/Dreams.ico',
  bucketlist: '/icons/bucket-list.ico',
  friends:    '/icons/Friends.ico',
}

const FALLBACK = {
  wheel:      '🎡',
  charts:     '📈',
  goals:      '🎯',
  dashboard:  '📊',
  dreams:     '🌟',
  bucketlist: '📋',
  friends:    '👥',
}

/**
 * @param {string} id   - one of the keys above
 * @param {string} size - Tailwind size class, e.g. 'w-7 h-7'
 * @param {string} className - extra classes
 */
export default function NavIcon({ id, size = 'w-7 h-7', className = '' }) {
  const src = ICON_MAP[id]
  if (!src) return <span>{FALLBACK[id] ?? '?'}</span>
  return (
    <img
      src={src}
      alt={id}
      className={`object-contain inline-block ${size} ${className}`}
    />
  )
}
