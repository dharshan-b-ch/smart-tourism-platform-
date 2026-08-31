const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');
const Destination = require('../models/Destination');
const TouristPlace = require('../models/TouristPlace');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih_travel_tourism';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear db
    await User.deleteMany();
    await Destination.deleteMany();
    await TouristPlace.deleteMany();

    // Create default test accounts
    await User.create([
      { 
        name: 'Platform Admin', 
        email: 'admin@test.com', 
        password: 'password123', 
        role: 'ADMIN', 
        status: 'APPROVED',
        phone: '+91 9876543210'
      },
      { 
        name: 'John Tourist', 
        email: 'tourist@test.com', 
        password: 'password123', 
        role: 'TOURIST', 
        status: 'APPROVED',
        phone: '+91 9876543211',
        preferredLanguage: 'English'
      },
      { 
        name: 'Ravi Guide (Approved)', 
        email: 'guide@test.com', 
        password: 'password123', 
        role: 'GUIDE', 
        status: 'APPROVED',
        phone: '+91 9876543212',
        serviceLocation: 'Araku Valley',
        languages: ['English', 'Telugu', 'Hindi'],
        experience: '5 Years',
        description: 'Certified hill station tour guide with deep local history knowledge.'
      },
      { 
        name: 'Priya Photographer (Approved)', 
        email: 'photo@test.com', 
        password: 'password123', 
        role: 'PHOTOGRAPHER', 
        status: 'APPROVED',
        phone: '+91 9876543214',
        serviceLocation: 'Araku Valley',
        photographyType: 'Landscape & Nature',
        experience: '4 Years',
        description: 'Specializes in high-altitude landscape and scenic sunrise photography.'
      }
    ]);

    // 1. Tirupati (Andhra Pradesh)
    const destTirupati = await Destination.create({
      name: 'Tirupati',
      location: 'Chittoor District',
      state: 'Andhra Pradesh',
      coordinates: { lat: 13.6288, lng: 79.4192 },
      description: 'Tirupati is India\'s spiritual capital, world-famous for the sacred Sri Venkateswara Swamy Temple atop Tirumala Hills, attracting millions of devotees worldwide.',
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Sri Venkateswara Swamy Temple', 'Silathoranam Natural Arch', 'Kapila Theertham', 'Sri Padmavathi Ammavari Temple'],
      popularActivities: ['Temple Darshan', 'Tirumala Hill Trekking', 'Heritage Walk'],
      localExperiences: ['Tirupati Srivari Laddu Prasadam', 'South Indian Temple Sadhya'],
      recommendedHotels: [
        { name: 'Taj Tirupati', rating: '4.8 ★', priceRange: '₹6,000 - ₹10,000 / night', address: 'Tiruchanoor Road, Tirupati', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Tirupati Srivari Laddu', description: 'World-famous sacred sweet prasadam made of pure ghee, cashew nuts, raisins, and cardamom.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Sacred Hilltop Darshan', placeName: 'Sri Venkateswara Swamy Temple (Tirumala)', description: 'Experience divine blessings at one of the world\'s most revered pilgrimage shrines atop Tirumala hills.', bestTimeToVisit: 'Early Morning 6:00 AM' },
        { dayNumber: 2, title: 'Geological Wonder & Waterfalls', placeName: 'Silathoranam & Kapila Theertham', description: 'Visit the millions-of-years-old natural rock arch formation and Lord Shiva\'s waterfall temple.', bestTimeToVisit: 'Morning 10:00 AM' },
        { dayNumber: 3, title: 'Goddess Shrine & Handicrafts', placeName: 'Sri Padmavathi Ammavari Temple (Tiruchanur)', description: 'Seek blessings at Padmavathi temple and shop for traditional brassware and wooden handicrafts.', bestTimeToVisit: 'Evening 5:00 PM' }
      ]
    });

    // 2. Araku Valley (Andhra Pradesh)
    const destAraku = await Destination.create({
      name: 'Araku Valley',
      location: 'Visakhapatnam District',
      state: 'Andhra Pradesh',
      coordinates: { lat: 18.3273, lng: 82.8775 },
      description: 'Araku Valley is a serene hill station nestled in the Eastern Ghats, famous for its lush coffee plantations, ancient limestone caves, waterfalls, and tribal heritage.',
      imageUrl: 'https://images.unsplash.com/photo-1506461883276-594a12b11cb3?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Borra Caves', 'Coffee Museum', 'Katiki Waterfalls', 'Chaparai Water Cascade'],
      popularActivities: ['Trekking', 'Coffee Tasting', 'Tribal Dhimsa Dance'],
      localExperiences: ['Bongu Chicken (Bamboo Chicken)', 'Organic Araku Coffee Tasting'],
      recommendedHotels: [
        { name: 'Haritha Valley Resort (APTDCL)', rating: '4.4 ★', priceRange: '₹2,500 - ₹4,000 / night', address: 'Main Road, Araku Valley', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Bongu Chicken (Bamboo Chicken)', description: 'Local tribal specialty chicken marinated in wild spices, stuffed inside fresh bamboo stalks and coal-roasted.', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Limestone Caverns & Coffee aroma', placeName: 'Borra Caves & Coffee Museum', description: 'Explore million-year-old speleothem rock formations in Borra Caves followed by fresh Araku coffee tasting.', bestTimeToVisit: 'Morning 9:30 AM' },
        { dayNumber: 2, title: 'Cascading Waterfalls & Jungle Trek', placeName: 'Katiki Waterfalls & Chaparai Stream', description: 'Trek to Katiki waterfalls and relax near the natural granite rock water cascades of Chaparai.', bestTimeToVisit: 'Morning 10:00 AM' },
        { dayNumber: 3, title: 'Tribal Culture & Botanical Gardens', placeName: 'Tribal Museum & Padmapuram Gardens', description: 'Witness traditional Dhimsa tribal dance performance and explore tree-top huts in Padmapuram Gardens.', bestTimeToVisit: 'Afternoon 2:00 PM' }
      ]
    });

    // 3. Arunachalam / Thiruvannamalai (Tamil Nadu)
    const destArunachalam = await Destination.create({
      name: 'Arunachalam',
      location: 'Thiruvannamalai District',
      state: 'Tamil Nadu',
      coordinates: { lat: 12.2253, lng: 79.0747 },
      description: 'Arunachalam (Thiruvannamalai) is one of India\'s holiest spiritual sanctuaries, centered around the sacred Arunachala Hill (Agni Lingam) and the grand Annamalaiyar Temple.',
      imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010e423b961?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Annamalaiyar Temple', 'Girivalam Path', 'Ramana Maharshi Ashram', 'Virupaksha Cave', 'Skandashram'],
      popularActivities: ['14km Girivalam Circumambulation', 'Meditation at Ramana Ashram', 'Gopuram Exploration'],
      localExperiences: ['Thiruvannamalai Temple Prasadam', 'Traditional Filter Coffee'],
      recommendedHotels: [
        { name: 'Arunai Anantha Resort', rating: '4.6 ★', priceRange: '₹3,500 - ₹6,000 / night', address: 'Chengam Road, Thiruvannamalai', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Temple Puliyodarai (Tamarind Rice)', description: 'Traditional aromatic tamarind rice prasadam prepared with roasted sesame and groundnuts.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Grand Annamalaiyar Temple Darshan', placeName: 'Annamalaiyar Temple (Agni Stalam)', description: 'Explore the 25-acre temple complex with 11 towering gopurams dedicated to Lord Shiva as Fire.', bestTimeToVisit: 'Early Morning 6:00 AM' },
        { dayNumber: 2, title: 'Sacred Hillside Caves & Ashram', placeName: 'Ramana Ashram, Virupaksha Cave & Skandashram', description: 'Trek up Arunachala hill to visit Virupaksha Cave where Bhagavan Ramana Maharshi meditated for 17 years.', bestTimeToVisit: 'Morning 7:00 AM' },
        { dayNumber: 3, title: 'Holy Girivalam Circumambulation', placeName: '14km Girivalam Path & Ashta Lingams', description: 'Perform the sacred 14 km walk around the holy Arunachala mountain, seeking blessings at all 8 cardinal Lingams.', bestTimeToVisit: 'Evening / Full Moon Night' }
      ]
    });

    // 4. Kedarnath (Uttarakhand)
    const destKedarnath = await Destination.create({
      name: 'Kedarnath',
      location: 'Rudraprayag District',
      state: 'Uttarakhand',
      coordinates: { lat: 30.7346, lng: 79.0669 },
      description: 'Kedarnath is one of the holiest Char Dham pilgrimage sites, standing at 3,583m in the Garhwal Himalayas near the Mandakini River, surrounded by snow-capped Himalayan peaks.',
      imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Kedarnath Temple', 'Bhairavnath Temple', 'Vasuki Tal', 'Sonprayag', 'Gaurikund'],
      popularActivities: ['Himalayan Trekking', 'Panch Kedar Pilgrimage', 'Helicopter Yatra'],
      localExperiences: ['Garhwali Mandua Roti & Phaanu', 'Kedar Valley Pahadi Tea'],
      recommendedHotels: [
        { name: 'GMVN Kedar Deluxe Huts', rating: '4.5 ★', priceRange: '₹3,000 - ₹5,500 / night', address: 'Kedarnath Temple Complex', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Garhwali Phaanu & Mandua Roti', description: 'Wholesome Pahadi lentil stew served with hot ragi bread for high-altitude mountain warmth.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Sacred Trek from Gaurikund', placeName: 'Gaurikund to Kedarnath Base', description: 'Scenic 16km Himalayan trek alongside Mandakini River surrounded by waterfalls and mountain vistas.', bestTimeToVisit: 'Early Morning 5:00 AM' },
        { dayNumber: 2, title: 'Divine Jyotirlinga Darshan & Aarti', placeName: 'Kedarnath Jyotirlinga Temple & Bhairav Temple', description: 'Offer prayers at the ancient stone Shiva temple and trek to Bhairavnath Temple for panoramic valley views.', bestTimeToVisit: 'Morning 6:00 AM' },
        { dayNumber: 3, title: 'High-Altitude Glacial Lake Trek', placeName: 'Vasuki Tal Glacial Lake (4,135m)', description: 'Trek to the pristine crystal-clear Vasuki Tal lake offering breathtaking views of Chaukhamba peaks.', bestTimeToVisit: 'Morning 7:00 AM' }
      ]
    });

    // 5. Kashi Varanasi (Uttar Pradesh)
    const destVaranasi = await Destination.create({
      name: 'Varanasi',
      location: 'Varanasi District',
      state: 'Uttar Pradesh',
      coordinates: { lat: 25.3176, lng: 82.9739 },
      description: 'Varanasi (Kashi) is the world\'s oldest living city, famous for its sacred Ganga Ghats, ancient Kashi Vishwanath Jyotirlinga, and mesmerizing Ganga Aarti.',
      imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Sarnath Stupa', 'Assi Ghat', 'Manikarnika Ghat'],
      popularActivities: ['Sunrise Ganges Boat Ride', 'Evening Ganga Aarti Ceremony', 'Sarnath Buddhist Tour'],
      localExperiences: ['Varanasi Banarasi Paan', 'Kachori Sabzi & Malaiyo Sweet'],
      recommendedHotels: [
        { name: 'BrijRama Palace (Heritage)', rating: '4.9 ★', priceRange: '₹12,000 - ₹22,000 / night', address: 'Darbhanga Ghat, Varanasi', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Varanasi Banarasi Paan & Kachori', description: 'Iconic mouth-freshening paan and crisp fried kachoris served with spicy potato curry.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Kashi Vishwanath & Evening Aarti', placeName: 'Kashi Vishwanath Corridor & Dashashwamedh Ghat', description: 'Seek blessings at the Golden Shiva Temple and witness the magical grand Ganga Aarti at sunset.', bestTimeToVisit: 'Evening 6:00 PM' },
        { dayNumber: 2, title: 'Sunrise Boat Cruise & Sarnath', placeName: 'Assi Ghat to Manikarnika & Sarnath Dhamek Stupa', description: 'Take a quiet early morning boat ride along 84 ghats followed by an excursion to Buddha\'s first sermon site in Sarnath.', bestTimeToVisit: 'Early Morning 5:30 AM' },
        { dayNumber: 3, title: 'Old City Alleyways & Banarasi Silk', placeName: 'Chowk Bazaar & Banarasi Silk Weaving Village', description: 'Explore ancient winding heritage lanes, taste kulhad rabri, and observe master weavers creating silk sarees.', bestTimeToVisit: 'Afternoon 3:00 PM' }
      ]
    });

    // 6. Agra (Uttar Pradesh)
    const destAgra = await Destination.create({
      name: 'Agra',
      location: 'Agra District',
      state: 'Uttar Pradesh',
      coordinates: { lat: 27.1767, lng: 78.0081 },
      description: 'Agra is home to the world-famous Taj Mahal, one of the Seven Wonders of the World, along with majestic Mughal red-sandstone forts and gardens.',
      imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Akbar\'s Tomb (Sikandra)'],
      popularActivities: ['Sunrise Taj Mahal Photography', 'Mughal Heritage Walk', 'Marble Inlay Workshop'],
      localExperiences: ['Agra Petha Tasting', 'Mughlai Biryani & Bedai'],
      recommendedHotels: [
        { name: 'The Oberoi Amarvilas Agra', rating: '4.9 ★', priceRange: '₹30,000 - ₹50,000 / night', address: 'Taj East Gate Road, Agra', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Agra Petha & Bedai Puri', description: 'Iconic translucent ash gourd sweet petha served alongside crisp bedai puris with spiced potato curry.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Sunrise at the Taj Mahal', placeName: 'Taj Mahal & Mehtab Bagh', description: 'Behold the white marble monument of love bathed in morning golden light, followed by sunset river views from Mehtab Bagh.', bestTimeToVisit: 'Sunrise 5:45 AM' },
        { dayNumber: 2, title: 'Royal Mughal Fortresses', placeName: 'Agra Fort & Akbar\'s Tomb Sikandra', description: 'Explore Diwan-i-Khas, Jahangiri Mahal inside Agra Fort and marvel at Akbar\'s grand mausoleum.', bestTimeToVisit: 'Morning 9:30 AM' },
        { dayNumber: 3, title: 'Ghost City of Fatehpur Sikri', placeName: 'Buland Darwaza & Salim Chishti Dargah', description: 'Visit Emperor Akbar\'s 16th-century sandstone capital city featuring the world\'s highest gateway.', bestTimeToVisit: 'Morning 9:00 AM' }
      ]
    });

    // 7. Jaipur (Rajasthan)
    const destJaipur = await Destination.create({
      name: 'Jaipur',
      location: 'Jaipur District',
      state: 'Rajasthan',
      coordinates: { lat: 26.9124, lng: 75.7873 },
      description: 'Jaipur, the Pink City of India, is famous for magnificent royal palaces, hilltop forts, vibrant bazaars, and rich Rajput architectural grandeur.',
      imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Amber Fort', 'Hawa Mahal (Palace of Winds)', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort'],
      popularActivities: ['Amber Fort Elephant Ride', 'Pink City Heritage Walk', 'Rajasthani Block Printing Workshop'],
      localExperiences: ['Dal Baati Churma Feast', 'Pyaz Kachori at Rawat'],
      recommendedHotels: [
        { name: 'Rambagh Palace (Taj)', rating: '4.9 ★', priceRange: '₹25,000 - ₹45,000 / night', address: 'Bhawani Singh Road, Jaipur', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Rajasthani Dal Baati Churma', description: 'Authentic royal dish of baked wheat balls dipped in desi ghee with spiced lentils and sweet churma.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Hilltop Forts & Sheesh Mahal', placeName: 'Amber Fort & Jaigarh Fort', description: 'Marvel at mirror palace architecture at Amber Fort and see the world\'s largest cannon on wheels at Jaigarh.', bestTimeToVisit: 'Morning 9:00 AM' },
        { dayNumber: 2, title: 'Palace of Winds & Royal Museums', placeName: 'Hawa Mahal, City Palace & Jantar Mantar', description: 'Photograph the honeycomb facade of Hawa Mahal and explore UNESCO astronomical instruments at Jantar Mantar.', bestTimeToVisit: 'Morning 10:00 AM' },
        { dayNumber: 3, title: 'Sunset over Pink City Skyline', placeName: 'Nahargarh Fort & Johari Bazaar', description: 'Enjoy panoramic sunset views of Jaipur city from Nahargarh Fort and shop for silver jewelry and textiles.', bestTimeToVisit: 'Late Afternoon 4:30 PM' }
      ]
    });

    // 8. Munnar & Alleppey (Kerala)
    const destKerala = await Destination.create({
      name: 'Kerala (Munnar & Alleppey)',
      location: 'Idukki & Alappuzha Districts',
      state: 'Kerala',
      coordinates: { lat: 10.0889, lng: 77.0595 },
      description: 'Kerala, "God\'s Own Country", features emerald tea plantations in Munnar, serene backwater houseboats in Alleppey, and pristine Arabian Sea beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Alleppey Backwater Houseboats', 'Munnar Tea Gardens', 'Eravikulam National Park', 'Mattupetty Dam'],
      popularActivities: ['Overnight Houseboat Cruise', 'Tea Tasting Tour', 'Ayurvedic Massage Therapy'],
      localExperiences: ['Kerala Sadya on Banana Leaf', 'Karimeen Pollichathu (Pearlspot Fish)'],
      recommendedHotels: [
        { name: 'Spice Tree Munnar Resort', rating: '4.8 ★', priceRange: '₹8,000 - ₹14,000 / night', address: 'Muttukad-Periakanal Road, Munnar', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Kerala Sadya & Appam with Stew', description: 'Authentic 26-dish vegetarian feast served on banana leaf alongside fluffy rice appams with coconut stew.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Mist-clad Tea Plantations', placeName: 'Munnar Tea Gardens & Eravikulam National Park', description: 'Walk through rolling green tea estates and spot the endangered Nilgiri Tahr mountain goat.', bestTimeToVisit: 'Morning 8:30 AM' },
        { dayNumber: 2, title: 'Serene Houseboat Cruise', placeName: 'Alleppey Backwaters & Vembanad Lake', description: 'Board a traditional luxury Kettuvallam houseboat gliding past palm-fringed canals and paddy fields.', bestTimeToVisit: 'Afternoon 12:00 PM' },
        { dayNumber: 3, title: 'Spices & Marari Beach Sunset', placeName: 'Spice Plantation Tour & Marari Beach', description: 'Learn about cardamom, pepper, and cinnamon cultivation followed by sunset at tranquil Marari beach.', bestTimeToVisit: 'Evening 4:00 PM' }
      ]
    });

    // 9. Goa
    const destGoa = await Destination.create({
      name: 'Goa',
      location: 'North & South Goa',
      state: 'Goa',
      coordinates: { lat: 15.2993, lng: 74.1240 },
      description: 'Goa is India\'s sun-kissed beach paradise, renowned for golden coastlines, Portuguese colonial architecture, Dudhsagar waterfalls, and vibrant nightlife.',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Baga Beach', 'Fort Aguada', 'Basilica of Bom Jesus', 'Dudhsagar Waterfalls', 'Anjuna Flea Market'],
      popularActivities: ['Parasailing & Jet Skiing', 'Dolphin Cruise', 'Spice Plantation Buffet'],
      localExperiences: ['Goan Fish Curry Rice', 'Bebinca Layered Dessert'],
      recommendedHotels: [
        { name: 'Taj Exotica Resort & Spa Goa', rating: '4.8 ★', priceRange: '₹14,000 - ₹28,000 / night', address: 'Benaulim Beach, South Goa', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Goan Fish Curry Rice', description: 'Fresh catch cooked in coconut milk, dried red chilies, and tangy kokum served with steamed rice.', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Portuguese Heritage & Churches', placeName: 'Basilica of Bom Jesus & Fontainhas Latin Quarter', description: 'Explore UNESCO 16th-century cathedrals and stroll through colorful Portuguese alleys in Panjim.', bestTimeToVisit: 'Morning 9:30 AM' },
        { dayNumber: 2, title: 'Coastal Forts & Water Sports', placeName: 'Fort Aguada & Baga Beach Watersports', description: 'Visit 17th-century lighthouse fort overlooking Arabian Sea and enjoy jet skiing and parasailing.', bestTimeToVisit: 'Afternoon 2:30 PM' },
        { dayNumber: 3, title: 'Majestic Waterfall Safari', placeName: 'Dudhsagar Waterfalls & Spice Plantation', description: 'Jeep safari through Bhagwan Mahavir Wildlife Sanctuary to view the 4-tiered milky Dudhsagar waterfalls.', bestTimeToVisit: 'Early Morning 7:00 AM' }
      ]
    });

    // 10. Amritsar (Punjab)
    const destAmritsar = await Destination.create({
      name: 'Amritsar',
      location: 'Amritsar District',
      state: 'Punjab',
      coordinates: { lat: 31.6340, lng: 74.8723 },
      description: 'Amritsar is the spiritual heart of Sikhism, famous for the breathtaking Golden Temple (Sri Harmandir Sahib), Jallianwala Bagh, and patriotic Wagah Border ceremony.',
      imageUrl: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Golden Temple (Sri Harmandir Sahib)', 'Jallianwala Bagh', 'Wagah Border', 'Durgiana Temple', 'Gobindgarh Fort'],
      popularActivities: ['Langar Community Kitchen Service', 'Wagah Border Beating Retreat Ceremony', 'Heritage Walk'],
      localExperiences: ['Amritsari Kulcha & Chole with Lassi', 'Phulkari Dupatta Shopping'],
      recommendedHotels: [
        { name: 'Taj Swarna Amritsar', rating: '4.7 ★', priceRange: '₹7,000 - ₹12,000 / night', address: 'Fatehgarh Churian Road, Amritsar', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Amritsari Kulcha & Chole with Creamy Lassi', description: 'Crispy tandoori stuffed kulcha served with spicy chickpeas and tall glass of sweet churned lassi.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Divine Golden Temple & Langar', placeName: 'Sri Harmandir Sahib & Guru Ram Das Langar', description: 'Seek serenity at the glowing golden shrine in the sacred sarovar pool and participate in the world\'s largest free kitchen.', bestTimeToVisit: 'Early Morning 5:00 AM' },
        { dayNumber: 2, title: 'Patriotic Ceremony & History', placeName: 'Jallianwala Bagh & Wagah Border Flag Ceremony', description: 'Pay homage to freedom martyrs at Jallianwala Bagh and feel high national pride at the BSF Wagah border parade.', bestTimeToVisit: 'Afternoon 3:30 PM' },
        { dayNumber: 3, title: 'Historic Forts & Local Bazaars', placeName: 'Gobindgarh Fort & Hall Bazaar Shopping', description: 'Experience sound and light laser shows at Maharaja Ranjit Singh\'s fort and shop for handmade Punjabi juttis.', bestTimeToVisit: 'Evening 5:00 PM' }
      ]
    });

    // 11. Bodh Gaya (Bihar)
    const destBodhGaya = await Destination.create({
      name: 'Bodh Gaya',
      location: 'Gaya District',
      state: 'Bihar',
      coordinates: { lat: 24.6961, lng: 84.9869 },
      description: 'Bodh Gaya is the supreme pilgrimage site of Buddhism, where Prince Siddhartha Gautama attained Enlightenment beneath the sacred Bodhi Tree over 2,500 years ago.',
      imageUrl: 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Mahabodhi Temple', 'Sacred Bodhi Tree', '80ft Great Buddha Statue', 'Thai Monastery', 'Royal Bhutan Monastery'],
      popularActivities: ['Meditation beneath Bodhi Tree', 'International Monastic Circuit Tour', 'Heritage Meditation Walk'],
      localExperiences: ['Bihari Litti Chokha', 'Tilkut Sweet'],
      recommendedHotels: [
        { name: 'Hotel Marasa Sarovar Premiere', rating: '4.6 ★', priceRange: '₹5,000 - ₹9,000 / night', address: 'Bodhgaya Bypass Road', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Bihari Litti Chokha & Tilkut', description: 'Traditional roasted sattu wheat balls served with smoked eggplant mash and sesame sweet tilkut.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Enlightenment Site & Mahabodhi Temple', placeName: 'Mahabodhi Temple Complex & Bodhi Tree', description: 'Meditate near the Vajrasana (Diamond Throne) where Lord Buddha attained supreme awakening.', bestTimeToVisit: 'Early Morning 6:00 AM' },
        { dayNumber: 2, title: 'Giant Buddha Statue & Monasteries', placeName: '80ft Great Buddha Statue & Thai Monastery', description: 'Visit the towering stone Buddha statue and admire traditional pagoda architectural styles of international monasteries.', bestTimeToVisit: 'Morning 9:00 AM' },
        { dayNumber: 3, title: 'Gaya Ancestral Shrines & Dungeshwari', placeName: 'Vishnupad Temple & Dungeshwari Cave Temples', description: 'Explore ancient rock temples where Buddha spent years of ascetism prior to enlightenment.', bestTimeToVisit: 'Morning 8:00 AM' }
      ]
    });

    // 12. Dwarka (Gujarat)
    const destDwarka = await Destination.create({
      name: 'Dwarka',
      location: 'Devbhumi Dwarka District',
      state: 'Gujarat',
      coordinates: { lat: 22.2442, lng: 68.9685 },
      description: 'Dwarka is Lord Krishna\'s legendary ancient golden kingdom on the western coast of Gujarat, home to the magnificent 5-storey Dwarkadhish Temple.',
      imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Dwarkadhish Temple (Jagat Mandir)', 'Bet Dwarka Island', 'Nageshwar Jyotirlinga', 'Rukmini Devi Temple', 'Gomti Ghat'],
      popularActivities: ['Gomti Ghat Holy Dip', 'Ferry Ride to Bet Dwarka', 'Sunset Coastal Walk'],
      localExperiences: ['Gujarati Thali with Shrikhand', 'Dwarka Dry Fruit Sweets'],
      recommendedHotels: [
        { name: 'Hawthorn Suites by Wyndham Dwarka', rating: '4.7 ★', priceRange: '₹6,000 - ₹11,000 / night', address: 'Dwarka-Okha Highway', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Traditional Gujarati Thali & Dhokla', description: 'Sumptuous multi-dish thali with sweet dal, kadhi, fresh rotlis, dhokla, and creamy shrikhand.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Jagat Mandir & Flag Hoisting Aarti', placeName: 'Dwarkadhish Temple & Gomti Ghat', description: 'Witness the iconic 52-yard flag changing ceremony atop the 78m temple spire overlooking Gomti River.', bestTimeToVisit: 'Morning 6:30 AM' },
        { dayNumber: 2, title: 'Holy Island Ferry & Nageshwar', placeName: 'Bet Dwarka Island Ferry & Nageshwar Jyotirlinga', description: 'Take a scenic boat ride to Krishna\'s residential island kingdom and visit the giant 85ft Shiva statue.', bestTimeToVisit: 'Morning 8:00 AM' },
        { dayNumber: 3, title: 'Ancient Coastal Shrines', placeName: 'Rukmini Devi Temple & Shivrajpur Blue Flag Beach', description: 'Admire 12th-century carvings at Rukmini temple and relax at India\'s pristine Blue Flag certified beach.', bestTimeToVisit: 'Afternoon 3:30 PM' }
      ]
    });

    // 13. Hampi (Karnataka)
    const destHampi = await Destination.create({
      name: 'Hampi',
      location: 'Vijayanagara District',
      state: 'Karnataka',
      coordinates: { lat: 15.3350, lng: 76.4600 },
      description: 'Hampi is a UNESCO World Heritage Site featuring dramatic boulder-strewn landscapes and magnificent 14th-century ruins of the Vijayanagara Empire.',
      imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010e423b961?q=80&w=800&auto=format&fit=crop',
      bestAttractions: ['Vittala Temple Stone Chariot', 'Virupaksha Temple', 'Matanga Hill', 'Elephant Stables', 'Lotus Mahal'],
      popularActivities: ['Tungabhadra Coracle Boat Ride', 'Matanga Hill Sunrise Trek', 'Heritage Bouldering'],
      localExperiences: ['South Indian Thali at Mango Tree', 'Fresh Tender Coconut'],
      recommendedHotels: [
        { name: 'Evolve Back Kamalapura Palace Hampi', rating: '4.9 ★', priceRange: '₹22,000 - ₹38,000 / night', address: 'Kamalapura, Hampi', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600' }
      ],
      famousFoods: [
        { dishName: 'Karnataka Bisi Bele Bath & Dosa', description: 'Spiced rice lentil delicacy cooked with vegetables and ghee, served alongside crispy dosas.', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600' }
      ],
      dayByDayHighlights: [
        { dayNumber: 1, title: 'Iconic Stone Chariot & Musical Pillars', placeName: 'Vittala Temple Complex & Stone Chariot', description: 'Marvel at the world-famous carved granite Stone Chariot and acoustic musical pillars of Vijayanagara kings.', bestTimeToVisit: 'Morning 8:30 AM' },
        { dayNumber: 2, title: 'Active Shrine & Royal Enclosure', placeName: 'Virupaksha Temple, Elephant Stables & Lotus Mahal', description: 'Seek blessings from temple elephant Lakshmi and explore Indo-Islamic royal pavilions.', bestTimeToVisit: 'Morning 9:00 AM' },
        { dayNumber: 3, title: 'Sunrise Trek & Coracle River Cruise', placeName: 'Matanga Hill Sunrise & Tungabhadra Coracle Ride', description: 'Trek up Matanga hill for breathtaking 360-degree panorama of boulder ruins followed by a traditional round boat ride.', bestTimeToVisit: 'Early Morning 5:45 AM' }
      ]
    });

    console.log('Seeded core major destinations with high-definition Unsplash CDN URLs!');

    // Create sample tourist places for Tirupati
    await TouristPlace.create([
      { destinationId: destTirupati._id, name: 'Sri Venkateswara Swamy Temple', category: 'Temple', coordinates: { lat: 13.6833, lng: 79.3500 }, description: 'Sacred hilltop shrine of Lord Venkateswara.' },
      { destinationId: destTirupati._id, name: 'Silathoranam', category: 'Geological Wonder', coordinates: { lat: 13.6850, lng: 79.3450 }, description: 'Prehistoric natural arch formation.' },
      { destinationId: destAraku._id, name: 'Borra Caves', category: 'Caves', coordinates: { lat: 18.2800, lng: 83.0400 }, description: 'Million-year-old limestone cave formations.' },
      { destinationId: destArunachalam._id, name: 'Annamalaiyar Temple', category: 'Temple', coordinates: { lat: 12.2310, lng: 79.0670 }, description: 'Spiritual Fire shrine of Lord Shiva.' },
      { destinationId: destKedarnath._id, name: 'Kedarnath Temple', category: 'Temple', coordinates: { lat: 30.7346, lng: 79.0669 }, description: 'Himalayan Jyotirlinga shrine at 3,583m altitude.' }
    ]);

    console.log('Database Seeding Completed Cleanly!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
