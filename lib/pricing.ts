export const FLEET_TYPES = {
  economy_sedan: { name: 'Economy Sedan', passengers: 4, luggage: 2, basePrice: 1.2, emoji: '🚗' },
  luxury_sedan: { name: 'Luxury Sedan', passengers: 4, luggage: 3, basePrice: 1.8, emoji: '🏎️' },
  economy_van: { name: 'Economy Van', passengers: 8, luggage: 6, basePrice: 1.6, emoji: '🚐' },
  luxury_van: { name: 'Luxury Van', passengers: 8, luggage: 6, basePrice: 2.4, emoji: '🚌' },
  minibus: { name: 'Minibus', passengers: 16, luggage: 16, basePrice: 2.8, emoji: '🚌' },
}

export const FAMOUS_ROUTES = [
  { from: 'Barcelona Airport (BCN)', to: 'Barcelona City Center', fromLat: 41.2974, fromLng: 2.0833, toLat: 41.3851, toLng: 2.1734, distance: 18, duration: 25 },
  { from: 'Barcelona', to: 'Girona', fromLat: 41.3851, fromLng: 2.1734, toLat: 41.9794, toLng: 2.8214, distance: 101, duration: 65 },
  { from: 'Barcelona', to: 'Valencia', fromLat: 41.3851, fromLng: 2.1734, toLat: 39.4699, toLng: -0.3763, distance: 355, duration: 210 },
  { from: 'Barcelona', to: 'Andorra', fromLat: 41.3851, fromLng: 2.1734, toLat: 42.5063, toLng: 1.5218, distance: 210, duration: 150 },
  { from: 'Barcelona', to: 'Sitges', fromLat: 41.3851, fromLng: 2.1734, toLat: 41.2368, toLng: 1.8113, distance: 42, duration: 40 },
  { from: 'Barcelona', to: 'Tarragona', fromLat: 41.3851, fromLng: 2.1734, toLat: 41.1189, toLng: 1.2445, distance: 102, duration: 70 },
  { from: 'Barcelona', to: 'Costa Brava', fromLat: 41.3851, fromLng: 2.1734, toLat: 41.8036, toLng: 3.0629, distance: 125, duration: 90 },
]

export function calculatePrice(distanceKm: number, fleetType: string, hours?: number): number {
  const fleet = FLEET_TYPES[fleetType as keyof typeof FLEET_TYPES]
  if (!fleet) return 50
  
  const BASE_MINIMUM = 45
  let price = 0
  
  if (hours && hours > 0) {
    price = hours * 65 * fleet.basePrice
  } else {
    price = Math.max(BASE_MINIMUM, distanceKm * fleet.basePrice + 25)
  }
  
  return Math.round(price * 100) / 100
}

export function estimateDistance(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  const R = 6371
  const dLat = (toLat - fromLat) * Math.PI / 180
  const dLon = (toLng - fromLng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}
