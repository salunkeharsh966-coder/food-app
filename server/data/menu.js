// Single source of truth for the seeded menu. Prices are in whole rupees.
export const categories = [
  { slug: 'starters', name: 'Small Plates', tagline: 'Tandoor-fired things to tear and share', sort_order: 1 },
  { slug: 'mains', name: 'From the Handi', tagline: 'Slow-simmered curries and dum biryanis', sort_order: 2 },
  { slug: 'breads', name: 'Breads', tagline: 'Straight off the clay wall of the tandoor', sort_order: 3 },
  { slug: 'desserts', name: 'Sweets', tagline: 'The part everyone pretends they have room for', sort_order: 4 },
  { slug: 'drinks', name: 'To Drink', tagline: 'Chai, lassi, and cold things for hot days', sort_order: 5 },
];

export const menuItems = [
  // ---------------- SMALL PLATES ----------------
  {
    slug: 'punjabi-samosa', name: 'Punjabi Samosa',
    description: 'Two fat, flaky parcels packed with spiced potato and green peas, fried to a deep amber. Served with tamarind chutney and a scatter of chaat masala.',
    price: 180, category_slug: 'starters', image: 'samosa.jpg',
    is_veg: 1, spice_level: 1, rating: 4.8, review_count: 412, prep_minutes: 12, is_signature: 0,
    allergens: 'Gluten',
  },
  {
    slug: 'paneer-pakora', name: 'Paneer Pakora',
    description: 'Thick slices of fresh paneer in a gram-flour batter with ajwain and cracked pepper. Golden outside, still soft in the middle, with mint chutney for dipping.',
    price: 260, category_slug: 'starters', image: 'paneer-pakora.jpg',
    is_veg: 1, spice_level: 1, rating: 4.7, review_count: 268, prep_minutes: 14, is_signature: 0,
    allergens: 'Dairy, Gluten',
  },
  {
    slug: 'dahi-ke-kebab', name: 'Dahi ke Kebab',
    description: 'Hung curd, roasted cashew and green chilli, set and pan-seared until the outside barely holds. They collapse the moment you bite. Pomegranate and mint on top.',
    price: 290, category_slug: 'starters', image: 'dahi-ke-kebab.jpg',
    is_veg: 1, spice_level: 0, rating: 4.9, review_count: 194, prep_minutes: 16, is_signature: 1,
    allergens: 'Dairy, Nuts',
  },
  {
    slug: 'amritsari-fish-fry', name: 'Amritsari Fish Fry',
    description: 'River fish in a gram-flour and carom-seed crust, fried hot and fast so the edges shatter. Lemon, raw onion rings, and a green chutney sharp with coriander.',
    price: 420, category_slug: 'starters', image: 'amritsari-fish-fry.jpg',
    is_veg: 0, spice_level: 2, rating: 4.7, review_count: 231, prep_minutes: 18, is_signature: 0,
    allergens: 'Fish, Gluten',
  },
  {
    slug: 'chicken-65', name: 'Chicken 65',
    description: 'Bites of chicken in a chilli-red yoghurt marinade, flash-fried and tossed with curry leaves, dried red chillies and a spoon of cool yoghurt to calm it down.',
    price: 380, category_slug: 'starters', image: 'chicken-65.jpg',
    is_veg: 0, spice_level: 3, rating: 4.8, review_count: 356, prep_minutes: 16, is_signature: 0,
    allergens: 'Dairy',
  },
  {
    slug: 'paneer-tikka', name: 'Paneer Tikka',
    description: 'Paneer cubes in a hung-curd and kashmiri chilli marinade, skewered with peppers and onion, and left in the tandoor until the edges blacken.',
    price: 340, category_slug: 'starters', image: 'paneer-tikka.jpg',
    is_veg: 1, spice_level: 2, rating: 4.8, review_count: 487, prep_minutes: 18, is_signature: 0,
    allergens: 'Dairy',
  },
  {
    slug: 'tandoori-chicken', name: 'Tandoori Chicken',
    description: 'Half a chicken, scored deep, marinated overnight in yoghurt, ginger and deggi mirch, then charred in the tandoor. Smoky all the way to the bone.',
    price: 520, category_slug: 'starters', image: 'tandoori-chicken.jpg',
    is_veg: 0, spice_level: 2, rating: 4.9, review_count: 621, prep_minutes: 24, is_signature: 1,
    allergens: 'Dairy',
  },
  {
    slug: 'chicken-tikka', name: 'Chicken Tikka',
    description: 'Boneless thigh in a double marinade — ginger-garlic first, then yoghurt and spice — skewered and blistered. Six pieces, a lemon wedge, and nothing else needed.',
    price: 440, category_slug: 'starters', image: 'chicken-tikka.jpg',
    is_veg: 0, spice_level: 2, rating: 4.8, review_count: 402, prep_minutes: 20, is_signature: 0,
    allergens: 'Dairy',
  },

  // ---------------- MAINS ----------------
  {
    slug: 'butter-chicken', name: 'Butter Chicken',
    description: 'Tandoori chicken folded into a tomato gravy that has been simmering since morning, finished with cream and crushed kasuri methi. Rich, faintly sweet, impossible to stop.',
    price: 540, category_slug: 'mains', image: 'butter-chicken.jpg',
    is_veg: 0, spice_level: 1, rating: 4.9, review_count: 1284, prep_minutes: 22, is_signature: 1,
    allergens: 'Dairy, Nuts',
  },
  {
    slug: 'dal-makhani', name: 'Dal Makhani',
    description: 'Whole black urad lentils, soaked overnight and cooked low for six hours with butter and a little smoke. The one dish our kitchen will not rush.',
    price: 380, category_slug: 'mains', image: 'dal-makhani.jpg',
    is_veg: 1, spice_level: 1, rating: 4.9, review_count: 902, prep_minutes: 20, is_signature: 1,
    allergens: 'Dairy',
  },
  {
    slug: 'paneer-butter-masala', name: 'Paneer Butter Masala',
    description: 'Soft paneer in a tomato and cashew gravy with a slow bloom of red chilli, a swirl of cream and a tangle of ginger julienne on top.',
    price: 460, category_slug: 'mains', image: 'paneer-butter-masala.jpg',
    is_veg: 1, spice_level: 1, rating: 4.7, review_count: 544, prep_minutes: 20, is_signature: 0,
    allergens: 'Dairy, Nuts',
  },
  {
    slug: 'palak-paneer', name: 'Palak Paneer',
    description: 'Spinach blanched and ground coarse — never blended smooth — with garlic, green chilli and a little cream, holding cubes of paneer that stay white against the green.',
    price: 420, category_slug: 'mains', image: 'palak-paneer.jpg',
    is_veg: 1, spice_level: 1, rating: 4.6, review_count: 388, prep_minutes: 18, is_signature: 0,
    allergens: 'Dairy, Nuts',
  },
  {
    slug: 'malai-kofta', name: 'Malai Kofta',
    description: 'Paneer and potato dumplings with cashew and raisin at the centre, fried gently and laid in a pale, faintly sweet cream gravy. Soft enough to cut with a spoon.',
    price: 470, category_slug: 'mains', image: 'malai-kofta.jpg',
    is_veg: 1, spice_level: 0, rating: 4.7, review_count: 276, prep_minutes: 24, is_signature: 0,
    allergens: 'Dairy, Nuts, Gluten',
  },
  {
    slug: 'kadai-chicken', name: 'Kadai Chicken',
    description: 'Chicken cooked hot and dry in an iron karahi with onion, tomato, green chilli and coarsely crushed coriander seed. Loud, peppery, and best with roti.',
    price: 500, category_slug: 'mains', image: 'kadai-chicken.jpg',
    is_veg: 0, spice_level: 3, rating: 4.7, review_count: 341, prep_minutes: 22, is_signature: 0,
    allergens: 'Dairy',
  },
  {
    slug: 'rogan-josh', name: 'Rogan Josh',
    description: 'Lamb shoulder braised until it gives way, in a Kashmiri gravy of dried red chilli, fennel and asafoetida. The heat arrives late and stays a while.',
    price: 620, category_slug: 'mains', image: 'rogan-josh.jpg',
    is_veg: 0, spice_level: 2, rating: 4.8, review_count: 298, prep_minutes: 28, is_signature: 0,
    allergens: 'Dairy',
  },
  {
    slug: 'hyderabadi-biryani', name: 'Hyderabadi Chicken Biryani',
    description: 'Layered raw-dum biryani — marinated chicken at the bottom, half-cooked basmati with saffron milk on top, sealed and finished on low heat. Served with mirchi ka salan and raita.',
    price: 580, category_slug: 'mains', image: 'hyderabadi-biryani.jpg',
    is_veg: 0, spice_level: 2, rating: 4.9, review_count: 1103, prep_minutes: 30, is_signature: 1,
    allergens: 'Dairy, Nuts',
  },
  {
    slug: 'mutton-biryani', name: 'Mutton Biryani',
    description: 'The same dum method, with mutton on the bone so the rice takes on everything. Long grain, separate and stained orange in places. Fried onion and mint throughout.',
    price: 680, category_slug: 'mains', image: 'mutton-biryani.jpg',
    is_veg: 0, spice_level: 2, rating: 4.8, review_count: 466, prep_minutes: 34, is_signature: 0,
    allergens: 'Dairy, Nuts',
  },

  // ---------------- BREADS ----------------
  {
    slug: 'garlic-naan', name: 'Garlic Butter Naan',
    description: 'Stretched by hand and slapped onto the clay wall of the tandoor. Brushed with garlic butter the second it comes out, so it arrives glossy and blistered.',
    price: 90, category_slug: 'breads', image: 'garlic-naan.jpg',
    is_veg: 1, spice_level: 0, rating: 4.8, review_count: 731, prep_minutes: 8, is_signature: 0,
    allergens: 'Gluten, Dairy',
  },
  {
    slug: 'tandoori-roti', name: 'Tandoori Roti',
    description: 'Whole wheat, no yeast, cooked until it puffs and spots. Plain and sturdy — the right thing to have under a gravy that deserves it.',
    price: 60, category_slug: 'breads', image: 'tandoori-roti.jpg',
    is_veg: 1, spice_level: 0, rating: 4.6, review_count: 402, prep_minutes: 7, is_signature: 0,
    allergens: 'Gluten',
  },

  // ---------------- SWEETS ----------------
  {
    slug: 'gulab-jamun', name: 'Gulab Jamun',
    description: 'Three warm dumplings of reduced milk, fried dark and left to drink up cardamom and rose syrup until they are almost too soft to lift.',
    price: 200, category_slug: 'desserts', image: 'gulab-jamun.jpg',
    is_veg: 1, spice_level: 0, rating: 4.8, review_count: 588, prep_minutes: 10, is_signature: 0,
    allergens: 'Dairy, Gluten',
  },
  {
    slug: 'rasmalai', name: 'Rasmalai',
    description: 'Flat discs of fresh chenna poached in milk, then chilled in saffron and cardamom cream with pistachio and almond scattered over. Cold, soft, faintly floral.',
    price: 240, category_slug: 'desserts', image: 'rasmalai.jpg',
    is_veg: 1, spice_level: 0, rating: 4.9, review_count: 342, prep_minutes: 10, is_signature: 1,
    allergens: 'Dairy, Nuts',
  },
  {
    slug: 'gajar-halwa', name: 'Gajar ka Halwa',
    description: 'Grated carrot cooked down in milk and ghee for a long time, until it turns deep orange and jammy. Finished with khoya, cashew and a little cardamom.',
    price: 220, category_slug: 'desserts', image: 'gajar-halwa.jpg',
    is_veg: 1, spice_level: 0, rating: 4.7, review_count: 214, prep_minutes: 12, is_signature: 0,
    allergens: 'Dairy, Nuts',
  },

  // ---------------- DRINKS ----------------
  {
    slug: 'masala-chai', name: 'Masala Chai',
    description: 'Assam leaf boiled hard with milk, ginger, green cardamom and clove. Poured from a height into a small glass, the way it should be.',
    price: 120, category_slug: 'drinks', image: 'masala-chai.jpg',
    is_veg: 1, spice_level: 0, rating: 4.7, review_count: 503, prep_minutes: 8, is_signature: 0,
    allergens: 'Dairy',
  },
  {
    slug: 'mango-lassi', name: 'Mango Lassi',
    description: 'Alphonso pulp and thick curd, whisked with a pinch of cardamom and served over ice. Cold enough to put out a chilli-based fire.',
    price: 160, category_slug: 'drinks', image: 'mango-lassi.jpg',
    is_veg: 1, spice_level: 0, rating: 4.8, review_count: 419, prep_minutes: 6, is_signature: 0,
    allergens: 'Dairy',
  },
];

export const restaurant = {
  name: 'Saffron & Smoke',
  tagline: 'Slow-fired Indian, delivered warm.',
  deliveryFee: 4900,      // paise-free: rupees stored as integers below instead
};
