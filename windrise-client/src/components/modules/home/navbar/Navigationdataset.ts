export type NavigationCategoryId =
  | 'men'
  | 'women'
  | 'kids'
  | 'gifts'
  | 'home-decor'

export type NavigationGroup = {
  name: string
  items: readonly string[]
}

export type NavigationCategory = {
  id: NavigationCategoryId
  label: string
  groups: readonly NavigationGroup[]
  collections: readonly string[]
  promo: {
    title: string
    description: string
    cta: string
    image: string
    imageAlt: string
  }
}

export const navigationData: readonly NavigationCategory[] = [
  {
    id: 'men',
    label: 'Men',
    groups: [
      {
        name: 'Clothing',
        items: [
          'Formal Shirts',
          'Casual Shirts',
          'Overshirts',
          'T-Shirts',
          'Polos',
          'Jeans',
          'Cargo Pants'
        ],
      },
      {
        name: 'Footwear',
        items: [
          'Sneakers',
          'Loafers',
          'Formal Shoes',
          'Boots',
          'Sandals',
          'Running Shoes',
        ],
      },
      
    ],
    collections: [
      'Best Selling',
      'New Arrivals',
      'Summer Collection',
      'Office Wear',
      'Trending',
      'Luxury Essentials',
    ],
    promo: {
      title: 'New Season Collection',
      description:
        'Refined layers and enduring tailoring for the modern wardrobe.',
      cta: 'Shop menswear',
      image:
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=88',
      imageAlt: 'Man wearing tailored neutral clothing',
    },
  },
  {
    id: 'women',
    label: 'Women',
    groups: [
      {
        name: 'Clothing',
        items: [
          'Dresses',
          'Tops',
          'Shirts',
          'Blouses',
          'Jeans',
          'Skirts',
          'Trousers',
          'Ethnic Wear',
          'Abayas',
          'Hijabs',
          'Outerwear',
        ],
      },
      {
        name: 'Footwear',
        items: ['Heels', 'Sneakers', 'Boots', 'Sandals'],
      },
      {
        name: 'Accessories',
        items: ['Handbags', 'Jewelry', 'Scarves', 'Perfume', 'Watches'],
      },
    ],
    collections: [
      'New Arrival',
      "Luxury Editor's Picks",
      'Wedding Collection',
      'Evening Edit',
      'Quiet Luxury',
    ],
    promo: {
      title: 'The Women’s Edit',
      description:
        'A composed wardrobe of considered silhouettes and beautiful finishes.',
      cta: 'Discover the edit',
      image:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=88',
      imageAlt: 'Woman in a contemporary fashion boutique',
    },
  },
  {
    id: 'kids',
    label: 'Kids',
    groups: [
      {
        name: 'Boys',
        items: ['T-Shirts', 'Shirts', 'Denim', 'Trousers', 'Sets', 'Outerwear'],
      },
      {
        name: 'Girls',
        items: ['Dresses', 'Tops', 'Skirts', 'Leggings', 'Sets', 'Cardigans'],
      },
      {
        name: 'Baby & Essentials',
        items: [
          'Baby Wear',
          'School Wear',
          'Winter Wear',
          'Shoes',
          'Toys',
          'Accessories',
          'School Bags',
        ],
      },
    ],
    collections: [
      'Playful Layers',
      'Back to School',
      'Weekend Wear',
      'Mini Essentials',
      'Gifting for Little Ones',
    ],
    promo: {
      title: 'Little Moments, Beautifully Made',
      description:
        'Comfort-first pieces designed for adventure, play, and growing up.',
      cta: 'Shop kids',
      image:
        'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=88',
      imageAlt: 'Children walking together outdoors',
    },
  },
  {
    id: 'gifts',
    label: 'Gifts',
    groups: [
      {
        name: 'Gift Ideas',
        items: [
          'Birthday',
          'Wedding',
          'Anniversary',
          'Thank You',
          'For Him',
          'For Her',
        ],
      },
      {
        name: 'Luxury Gifting',
        items: [
          'Luxury Gift Box',
          'Perfume Gift',
          'Personalized Gifts',
          'Curated Sets',
          'Limited Editions',
        ],
      },
      {
        name: 'Gift Services',
        items: [
          'Gift Cards',
          'Gift Wrapping',
          'Personal Notes',
          'Corporate Gifting',
        ],
      },
    ],
    collections: [
      'The Art of Giving',
      'Understated Indulgence',
      'Occasion Gifts',
      'Signature Scents',
      'Gift Card Collection',
    ],
    promo: {
      title: 'A Gift to Remember',
      description:
        'Thoughtful objects and personal details, presented with care.',
      cta: 'Explore gifting',
      image:
        'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=88',
      imageAlt: 'Luxury gift boxes tied with ribbon',
    },
  },
  {
    id: 'home-decor',
    label: 'Home Decor',
    groups: [
      {
        name: 'Furniture',
        items: [
          'Living Room',
          'Bedroom',
          'Dining',
          'Accent Chairs',
          'Side Tables',
          'Storage',
        ],
      },
      {
        name: 'Home Spaces',
        items: [
          'Kitchen',
          'Bathroom',
          'Wall Decor',
          'Plants',
          'Decorative Objects',
        ],
      },
      {
        name: 'Atmosphere',
        items: [
          'Lighting',
          'Candles',
          'Textiles',
          'Tableware',
          'Seasonal Styling',
        ],
      },
    ],
    collections: [
      'The New Home',
      'Quiet Interiors',
      'Dining Rituals',
      'Warm Minimalism',
      'Objects of Interest',
    ],
    promo: {
      title: 'Spaces with a Sense of Ease',
      description:
        'Sculptural essentials for rooms that feel calm, lived-in, and personal.',
      cta: 'Shop home',
      image:
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=88',
      imageAlt: 'A calm modern living room interior',
    },
  },
]

export function getNavigationCategory(
  id: NavigationCategoryId,
): NavigationCategory {
  const category = navigationData.find((item) => item.id === id)

  if (!category) {
    throw new Error(`Missing navigation category: ${id}`)
  }

  return category
}
