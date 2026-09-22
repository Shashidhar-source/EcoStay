import { StandardRestaurant } from '../utils/osmParser';

export const SEED_RESTAURANTS: StandardRestaurant[] = [
  {
    id: 'rest_wayanad_1',
    name: 'Malabar Heritage Organic Thali House',
    category: 'restaurant',
    cuisine: ['Kerala', 'South Indian', 'Ayurvedic', 'Organic'],
    vegetarian: true,
    nonVegetarian: false,
    dietInfo: 'pure_vegetarian',
    latitude: 11.6880,
    longitude: 76.1345,
    address: 'Near Pookode Lake Road, Wayanad, Kerala, 673576',
    phone: '+91 4936 255120',
    website: 'https://malabarorganicthali.in',
    openingHours: 'Mo-Su 11:30-22:00',
    priceRange: 'budget',
    averageMealCostInr: 280,
    source: 'Verified Partner',
    menu: [
      {
        id: 'm1_1',
        name: 'Grand Wayanad Organic Sadhya Thali',
        description: 'Traditional 24-item feast served on banana leaf with organic red rice, avial, sambar, olan, and payasam',
        priceInr: 280,
        category: 'thali',
        isVegetarian: true,
        isVegan: false
      },
      {
        id: 'm1_2',
        name: 'Kerala Malabar Appam with Vegetable Stew',
        description: 'Fermented rice hoppers served with coconut milk spice stew',
        priceInr: 160,
        category: 'mains',
        isVegetarian: true,
        isVegan: true
      },
      {
        id: 'm1_3',
        name: 'Tender Coconut Cardamom Payasam',
        description: 'Slow-cooked local jaggery and tender coconut milk pudding',
        priceInr: 120,
        category: 'desserts',
        isVegetarian: true,
        isVegan: true
      },
      {
        id: 'm1_4',
        name: 'Ayurvedic Herbal Jeera Water (Pathimugham)',
        description: 'Traditional pink herbal infused boiling drinking water',
        priceInr: 40,
        category: 'beverages',
        isVegetarian: true,
        isVegan: true
      }
    ]
  },
  {
    id: 'rest_leh_1',
    name: 'Gesmo Traditional Ladakhi Organic Kitchen',
    category: 'cafe',
    cuisine: ['Tibetan', 'Ladakhi', 'Himalayan', 'Continental'],
    vegetarian: true,
    nonVegetarian: true,
    dietInfo: 'vegetarian_friendly',
    latitude: 34.1642,
    longitude: 77.5848,
    address: 'Fort Road, Main Market, Leh, Ladakh, 194101',
    phone: '+91 1982 252453',
    website: 'https://gesmocafeleh.com',
    openingHours: 'Mo-Su 08:00-21:30',
    priceRange: 'moderate',
    averageMealCostInr: 420,
    source: 'Verified Partner',
    menu: [
      {
        id: 'm2_1',
        name: 'Steamed Himalayan Vegetable Momos (8 pcs)',
        description: 'Handmade momos stuffed with garden cabbage, local cheese (Chhurpi) and wild herbs',
        priceInr: 180,
        category: 'starters',
        isVegetarian: true,
        isVegan: false
      },
      {
        id: 'm2_2',
        name: 'Ladakhi Vegetable Skyu',
        description: 'Traditional root vegetable and handmade whole-wheat pasta stew cooked in clay pot',
        priceInr: 220,
        category: 'mains',
        isVegetarian: true,
        isVegan: true
      },
      {
        id: 'm2_3',
        name: 'Sea-Buckthorn Wild Berry Juice',
        description: 'Freshly pressed organic Ladakh sea-buckthorn high in Vitamin C',
        priceInr: 150,
        category: 'beverages',
        isVegetarian: true,
        isVegan: true
      },
      {
        id: 'm2_4',
        name: 'Organic Apricot Crumble Pie',
        description: 'Baked pie made with sun-dried Sham valley sweet apricots',
        priceInr: 160,
        category: 'desserts',
        isVegetarian: true,
        isVegan: false
      }
    ]
  },
  {
    id: 'rest_coorg_1',
    name: 'Coorg Kodava Heritage Spice Kitchen',
    category: 'restaurant',
    cuisine: ['South Indian', 'Kodava', 'Karnataka', 'Grill'],
    vegetarian: true,
    nonVegetarian: true,
    dietInfo: 'vegetarian_friendly',
    latitude: 12.4208,
    longitude: 75.7412,
    address: 'Kollur Road, Madikeri, Coorg, Karnataka, 571201',
    phone: '+91 8272 228940',
    website: null,
    openingHours: 'Mo-Su 12:00-22:30',
    priceRange: 'moderate',
    averageMealCostInr: 550,
    source: 'Verified Partner',
    menu: [
      {
        id: 'm3_1',
        name: 'Akki Roti with Kaad Maange Curry (Wild Mango)',
        description: 'Crisp rice flatbread with wild forest mango sweet-and-sour gravy',
        priceInr: 220,
        category: 'mains',
        isVegetarian: true,
        isVegan: true
      },
      {
        id: 'm3_2',
        name: 'Noolputtu (Rice String Hoppers) with Veg Kurma',
        description: 'Delicate steamed rice noodles with coconut and cardamom spiced stew',
        priceInr: 190,
        category: 'mains',
        isVegetarian: true,
        isVegan: true
      },
      {
        id: 'm3_3',
        name: 'Traditional Coorg Shade-Grown Filter Coffee',
        description: 'Brewed from on-site hand-roasted Arabica and Robusta beans',
        priceInr: 80,
        category: 'beverages',
        isVegetarian: true,
        isVegan: false
      }
    ]
  },
  {
    id: 'rest_rishikesh_1',
    name: 'Chotiwala Pure Veg Ghat Restaurant',
    category: 'restaurant',
    cuisine: ['North Indian', 'South Indian', 'Sattvic', 'Ayurvedic'],
    vegetarian: true,
    nonVegetarian: false,
    dietInfo: 'pure_vegetarian',
    latitude: 30.1228,
    longitude: 78.3182,
    address: 'Swarg Ashram, Ram Jhula, Rishikesh, Uttarakhand, 249304',
    phone: '+91 135 2440070',
    website: 'https://chotiwalarestaurant.in',
    openingHours: 'Mo-Su 07:00-23:00',
    priceRange: 'budget',
    averageMealCostInr: 220,
    source: 'Verified Partner',
    menu: [
      {
        id: 'm4_1',
        name: 'Special Garhwali Pahadi Thali',
        description: 'Authentic local Himalayan feast with Koda (Ragi) roti, Gahat dal, Jhangora kheer, and Aloo ke Gutke',
        priceInr: 240,
        category: 'thali',
        isVegetarian: true,
        isVegan: false
      },
      {
        id: 'm4_2',
        name: 'Sattvic Paneer Bhurji (No Onion, No Garlic)',
        description: 'Fresh farm cottage cheese tossed with tomatoes, cumin and Himalayan pink salt',
        priceInr: 180,
        category: 'mains',
        isVegetarian: true,
        isVegan: false
      },
      {
        id: 'm4_3',
        name: 'Masala Chaas (Spiced Buttermilk)',
        description: 'Fresh churned cooling yogurt drink with roasted cumin and mint',
        priceInr: 50,
        category: 'beverages',
        isVegetarian: true,
        isVegan: false
      }
    ]
  }
];
