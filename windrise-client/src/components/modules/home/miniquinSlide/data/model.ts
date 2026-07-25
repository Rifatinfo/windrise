export interface ModelItem {
  id: number
  name: string
  category: string
  image: string
  imageScale: number
}

/**
 * The order intentionally matches the visual lineup around the opening centre look:
 * left outer → left inner → centre → right inner → right outer.
 */
export const MODELS: ModelItem[] = [
  {
    id: 1,
    name: 'The Oxford Stripe',
    category: 'COMFORT',
    image: '/assets/01.png',
    imageScale: 1,
  },
  {
    id: 2,
    name: 'The Bomber Edit',
    category: 'MODERN',
    image: '/assets/03.png',
    imageScale: 0.9,
  },
  {
    id: 3,
    name: 'The Relaxed Shirt',
    category: 'SIGNATURE',
    image: '/assets/02.png',
    imageScale: 1.13,
  },
  {
    id: 4,
    name: 'The Layered Casual',
    category: 'ESSENTIALS',
    image: '/assets/05.png',
    imageScale: 1.14,
  },
  {
    id: 5,
    name: 'The Everyday Polo',
    category: 'COMFORT',
    image: '/assets/04.png',
    imageScale: 0.9,
  },
]
