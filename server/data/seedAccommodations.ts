export interface AccommodationEntity {
  id: string;
  name: string;
  tagline: string;
  location: string;
  country: string;
  property_type: 'eco_lodge' | 'glamping' | 'boutique_hotel' | 'treehouse' | 'cabin' | 'villa';
  description: string;
  price_per_night: number;
  rating: number;
  review_count: number;
  status: 'active' | 'draft' | 'archived';
  images: string[];
  amenities: string[];
  latitude: number;
  longitude: number;
  sustainability: {
    solar: number;
    water_conservation: number;
    waste_management: number;
    energy_efficiency: number;
    local_support: number;
    green_construction: number;
    certificationStatus?: 'verified' | 'self_reported' | 'pending';
    certificationIssuer?: string;
    highlights?: string[];
  };
  calculatedEcoScore: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  featured?: boolean;
}

export const SEED_ACCOMMODATIONS: AccommodationEntity[] = [
  {
    id: 'eco_1',
    name: 'Wayanad Canopy Bamboo Bio-Lodge',
    tagline: 'Zero-emission bamboo treehouses perched 60ft in Kerala rainforest canopy',
    location: 'Wayanad, Kerala',
    country: 'India',
    property_type: 'treehouse',
    latitude: 11.6854,
    longitude: 76.1320,
    description: 'Constructed from sustainably harvested Wayanad giant bamboo and local terracotta tiles. Features 100% solar microgrid power, gravity-fed natural mountain spring water, and an authentic organic spice farm that supplies all culinary ingredients.',
    price_per_night: 6500,
    rating: 4.96,
    review_count: 58,
    status: 'active',
    max_guests: 3,
    bedrooms: 1,
    bathrooms: 1,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'Rainwater Harvesting & Bawadi', 'Organic Ayurvedic Farm-to-Table', 'Vedic Forest Yoga Shala', 'High-speed Fiber/Starlink WiFi'],
    sustainability: {
      solar: 96,
      water_conservation: 95,
      waste_management: 94,
      energy_efficiency: 92,
      local_support: 98,
      green_construction: 99,
      certificationStatus: 'verified',
      certificationIssuer: 'Kerala Responsible Tourism Mission & GSTC Gold',
      highlights: [
        '100% indigenous Wayanad bamboo and mud-plaster architecture',
        'Phytoremediation wetland filtration for greywater reuse',
        '100% local tribal staff employment with fair profit sharing'
      ]
    },
    calculatedEcoScore: 96
  },
  {
    id: 'eco_2',
    name: 'Ladakh Passive Solar Cob Sanctuary',
    tagline: 'Off-grid thermal earth haven with panoramic views of snow-capped Stok Kangri',
    location: 'Leh, Ladakh',
    country: 'India',
    property_type: 'cabin',
    latitude: 34.1526,
    longitude: 77.5771,
    description: 'Engineered with traditional Ladakhi rammed earth, straw insulation, and Trombe passive solar walls that maintain a comfortable 22°C year-round without fossil fuel heating. Powered by high-altitude rooftop solar arrays and snowmelt filtration.',
    price_per_night: 8200,
    rating: 4.94,
    review_count: 46,
    status: 'active',
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'EV Fast Charging Station', 'GRIHA / IGBC Platinum Certified', 'High-speed Fiber/Starlink WiFi'],
    sustainability: {
      solar: 99,
      water_conservation: 92,
      waste_management: 95,
      energy_efficiency: 98,
      local_support: 92,
      green_construction: 96,
      certificationStatus: 'verified',
      certificationIssuer: 'IGBC Platinum Net-Zero Energy & Himalayan Eco Council',
      highlights: [
        'Passive Trombe solar thermal heating requires zero diesel generators',
        'Dry composting toilets saving 100,000+ litres of water annually in arid Ladakh',
        '100% solar array microgrid with salt-battery storage'
      ]
    },
    calculatedEcoScore: 96
  },
  {
    id: 'eco_3',
    name: 'Coorg Regenerative Coffee Estate Villa',
    tagline: 'Eco-certified heritage villa inside a 50-acre shade-grown organic coffee forest',
    location: 'Madikeri, Coorg, Karnataka',
    country: 'India',
    property_type: 'villa',
    latitude: 12.4244,
    longitude: 75.7382,
    description: 'Nestled amidst misty Western Ghats biodiversity, this villa uses traditional Kodagu architecture with recycled stone and teakwood. 100% organic composting feeds the coffee and black pepper agroforest.',
    price_per_night: 11500,
    rating: 4.90,
    review_count: 64,
    status: 'active',
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'Rainwater Harvesting & Bawadi', 'Organic Ayurvedic Farm-to-Table', 'Guided Western Ghats Nature Walks', 'Natural Bio-Filtered Spring Pool'],
    sustainability: {
      solar: 90,
      water_conservation: 96,
      waste_management: 92,
      energy_efficiency: 88,
      local_support: 98,
      green_construction: 94,
      certificationStatus: 'verified',
      certificationIssuer: 'Rainforest Alliance India & GSTC Verified',
      highlights: [
        'Preserves biodiversity corridor for over 120 endemic Western Ghats bird species',
        'Rainwater storage reservoir holding 500,000 liters for zero-groundwater depletion',
        'Fair-trade coffee cooperative empowerment for local Kodava workers'
      ]
    },
    calculatedEcoScore: 93
  },
  {
    id: 'eco_4',
    name: 'Rishikesh Ganga Vedic Retreat',
    tagline: 'Peaceful bioclimatic yoga sanctuary along the pristine holy foothills',
    location: 'Rishikesh, Uttarakhand',
    country: 'India',
    property_type: 'eco_lodge',
    latitude: 30.0869,
    longitude: 78.2676,
    description: 'Built overlooking the forested upper Ganges basin with lime-stone and local river slate. Powered by solar water heating and micro-hydro generation, offering certified Ayurvedic nutrition from an on-site organic kitchen garden.',
    price_per_night: 4800,
    rating: 4.88,
    review_count: 78,
    status: 'active',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'Rainwater Harvesting & Bawadi', 'Organic Ayurvedic Farm-to-Table', 'Vedic Forest Yoga Shala', 'Herbal Ayurvedic Spa & Panchakarma'],
    sustainability: {
      solar: 92,
      water_conservation: 94,
      waste_management: 96,
      energy_efficiency: 89,
      local_support: 95,
      green_construction: 90,
      certificationStatus: 'verified',
      certificationIssuer: 'Ministry of Tourism Swadesh Darshan Eco-Gold',
      highlights: [
        'Strict zero-single-use-plastic campus with natural copper/glass filtration',
        'River embankment preservation and native tree plantation drives',
        'Ayurvedic kitchen 100% sourced from Garhwal organic farmers'
      ]
    },
    calculatedEcoScore: 93
  },
  {
    id: 'eco_5',
    name: 'Spiti Valley Solar Earth-Domes',
    tagline: 'High-altitude geodesic earth pods overlooking ancient Kaza monasteries',
    location: 'Kaza, Spiti Valley, Himachal Pradesh',
    country: 'India',
    property_type: 'glamping',
    latitude: 32.2276,
    longitude: 78.0710,
    description: 'Perched at 12,500 feet, these bioclimatic domes utilize super-insulated local clay, wool cladding, and solar thermal floor radiators to withstand severe Himalayan winters with zero fossil fuels.',
    price_per_night: 5400,
    rating: 4.97,
    review_count: 41,
    status: 'active',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'GRIHA / IGBC Platinum Certified', 'High-speed Fiber/Starlink WiFi', 'Guided Western Ghats Nature Walks'],
    sustainability: {
      solar: 98,
      water_conservation: 92,
      waste_management: 94,
      energy_efficiency: 96,
      local_support: 97,
      green_construction: 96,
      certificationStatus: 'verified',
      certificationIssuer: 'EcoSphere Spiti Certified Green',
      highlights: [
        '100% solar microgrid powering underfloor heating in sub-zero climate',
        'Community-managed eco-tourism returning 30% of revenue to Spitian villages',
        'Indigenous sea-buckthorn organic farming program'
      ]
    },
    calculatedEcoScore: 96
  },
  {
    id: 'eco_6',
    name: 'Mawlynnong Living Green Cottage',
    tagline: 'Handcrafted bamboo haven in Asia’s cleanest village near living root bridges',
    location: 'Mawlynnong, East Khasi Hills, Meghalaya',
    country: 'India',
    property_type: 'cabin',
    latitude: 25.2017,
    longitude: 91.9056,
    description: 'Immerse in Khasi indigenous eco-traditions. Constructed entirely from local timber and cane with conical bamboo thatch. Uses traditional rainwater channels and 100% organic waste segregation.',
    price_per_night: 3800,
    rating: 4.93,
    review_count: 53,
    status: 'active',
    max_guests: 3,
    bedrooms: 1,
    bathrooms: 1,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Zero Waste & Bio-Compost', 'Rainwater Harvesting & Bawadi', 'Organic Ayurvedic Farm-to-Table', 'Guided Western Ghats Nature Walks', 'Traditional Clay & Brass Kitchen'],
    sustainability: {
      solar: 82,
      water_conservation: 98,
      waste_management: 99,
      energy_efficiency: 85,
      local_support: 100,
      green_construction: 98,
      certificationStatus: 'verified',
      certificationIssuer: 'Meghalaya Ecotourism Development Society',
      highlights: [
        '100% organic waste converted to manure for community gardens',
        'Zero plastic village with conical handmade bamboo dustbins',
        'Preservation of centuries-old bio-engineered living root bridges'
      ]
    },
    calculatedEcoScore: 93
  },
  {
    id: 'eco_7',
    name: 'Jaisalmer Solar Desert Eco-Camp',
    tagline: 'Off-grid sustainable desert retreat nestled among Thar golden sand dunes',
    location: 'Sam Dunes, Jaisalmer, Rajasthan',
    country: 'India',
    property_type: 'glamping',
    latitude: 26.8289,
    longitude: 70.5147,
    description: 'Features eco-tents crafted from organic desert cotton and hand-carved golden limestone. Relies on state-of-the-art solar photovoltaic battery systems and ancient Rajasthani rainwater stepwells (Bawadi).',
    price_per_night: 7500,
    rating: 4.87,
    review_count: 67,
    status: 'active',
    max_guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'Rainwater Harvesting & Bawadi', 'EV Fast Charging Station', 'Traditional Clay & Brass Kitchen'],
    sustainability: {
      solar: 98,
      water_conservation: 90,
      waste_management: 88,
      energy_efficiency: 92,
      local_support: 96,
      green_construction: 90,
      certificationStatus: 'self_reported',
      certificationIssuer: 'Rajasthan Desert Ecotourism Forum',
      highlights: [
        '100% solar powered desert micro-grid with zero diesel generator noise',
        'Traditional Rajasthani water harvesting kunds storing monsoon rain',
        'Local Manganiyar folk musician and artisan livelihood support'
      ]
    },
    calculatedEcoScore: 93
  },
  {
    id: 'eco_8',
    name: 'Kanha Forest Wildlife Bio-Lodge',
    tagline: 'Sustainable mud-and-thatch cottages bordering Kanha Tiger Reserve',
    location: 'Kanha National Park, Madhya Pradesh',
    country: 'India',
    property_type: 'boutique_hotel',
    latitude: 22.3345,
    longitude: 80.6115,
    description: 'Built with indigenous Gond tribal architecture using sun-dried clay bricks, local terracotta tiles, and reclaimed Sal timber. 100% solar powered with a dedicated tiger corridor conservation program.',
    price_per_night: 9800,
    rating: 4.95,
    review_count: 51,
    status: 'active',
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'Rainwater Harvesting & Bawadi', 'Organic Ayurvedic Farm-to-Table', 'Guided Western Ghats Nature Walks', 'Herbal Ayurvedic Spa & Panchakarma'],
    sustainability: {
      solar: 94,
      water_conservation: 93,
      waste_management: 95,
      energy_efficiency: 90,
      local_support: 99,
      green_construction: 96,
      certificationStatus: 'verified',
      certificationIssuer: 'TOFTigers PUG Eco-Rating (Outstanding)',
      highlights: [
        'Constructed by local Gond artisans using traditional thermal mud masonry',
        'Zero single-use plastic with reverse-osmosis glass bottling plant',
        '15% of guest proceeds fund tribal anti-poaching and forest patrols'
      ]
    },
    calculatedEcoScore: 94
  }
];
