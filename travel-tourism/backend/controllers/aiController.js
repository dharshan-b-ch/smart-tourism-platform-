const axios = require('axios');
const Destination = require('../models/Destination');
const TouristPlace = require('../models/TouristPlace');

// Helper to generate budget-specific fallback using MongoDB seed data
const generateDatabaseFallback = async (destinationName, daysCount, budgetLevel = 'Medium') => {
  const destObj = await Destination.findOne({ name: new RegExp(destinationName, 'i') }).lean();
  let places = [];
  if (destObj) {
    places = await TouristPlace.find({ destinationId: destObj._id }).lean();
  }

  const samplePlaces = places.length > 0 ? places : [
    { name: `${destinationName} Main Scenic Viewpoint`, category: 'Nature View' },
    { name: `${destinationName} Heritage Landmark`, category: 'Cultural Site' },
    { name: `${destinationName} Central Temple & Gardens`, category: 'Peaceful Shrine' }
  ];

  const highlights = destObj?.dayByDayHighlights || [];
  const b = budgetLevel.toLowerCase();

  let budgetTag = 'Comfort Medium Budget';
  let stayText = '3-star boutique hotel';
  let transportText = 'private AC cab';
  let foodText = 'popular local thali and family restaurants';

  if (b.includes('high') || b.includes('luxury')) {
    budgetTag = '5-Star Luxury VIP Experience';
    stayText = destObj?.recommendedHotels?.[0]?.name || '5-star luxury heritage resort';
    transportText = 'private luxury chauffeur sedan with VIP fast-track darshan/entry';
    foodText = 'fine-dining gourmet restaurants & signature chef dishes';
  } else if (b.includes('low') || b.includes('budget')) {
    budgetTag = 'Low Budget Backpacker & Free Explorer';
    stayText = 'budget eco-homestay or youth hostel';
    transportText = 'public transport bus or scenic walking trail';
    foodText = 'authentic budget street food and iconic local food stalls';
  }

  return {
    title: `${daysCount}-Day ${budgetTag} Itinerary for ${destinationName}`,
    itinerary: Array.from({ length: daysCount }).map((_, i) => {
      const dayHighlight = highlights[i % highlights.length];
      const place1 = places[i % places.length] || samplePlaces[0];
      const place2 = places[(i + 1) % places.length] || samplePlaces[1];

      return {
        day: i + 1,
        morning: `📍 Place: ${dayHighlight ? dayHighlight.placeName : place1.name} | 🕒 Perfect Time: 6:30 AM (Sunrise) | 🌲 Nature & View: Fresh morning mist with crisp atmosphere. Travel via ${transportText}. ${dayHighlight ? dayHighlight.description : 'Ideal time for serene sightseeing and photography.'}`,
        afternoon: `📍 Place: ${place2.name} | 🕒 Perfect Time: 1:30 PM | 🌲 Nature & View: Warm ambient light surrounded by regional heritage. Lunch at ${foodText}. Stay base at ${stayText}.`,
        evening: `📍 Place: ${destinationName} Sunset Viewpoint & Cultural Street | 🕒 Perfect Time: 5:45 PM (Golden Hour) | 🌲 Nature & View: Spectacular sunset hues over the skyline with cool evening breeze and ${b.includes('high') ? 'exclusive private lounge experience.' : 'bustling local market atmosphere.'}`
      };
    })
  };
};

exports.generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      days,
      interest,
      budget,
      travelType,
      language
    } = req.body;

    const daysCount = parseInt(days) || 3;
    const budgetLevel = budget || 'Medium';

    // Fallback if no API key
    if (!process.env.AI_API_KEY) {
      const fallbackData = await generateDatabaseFallback(destination, daysCount, budgetLevel);
      return res.status(200).json({
        success: true,
        isFallback: true,
        message: 'Live AI API key missing. Serving budget-tailored database itinerary.',
        data: fallbackData
      });
    }

    // Budget-specific prompt customization
    let budgetInstruction = "Boutique 3-star hotel stays, comfortable private cab rides, popular family restaurants.";
    if (budgetLevel.toLowerCase().includes('high') || budgetLevel.toLowerCase().includes('luxury')) {
      budgetInstruction = "STRICT HIGH/LUXURY BUDGET: Recommend 5-star luxury heritage resort stays (e.g. Taj/Oberoi), private chauffeur sedan transfers, VIP fast-track temple darshan/entry passes, fine dining gourmet culinary experiences, and exclusive private tours.";
    } else if (budgetLevel.toLowerCase().includes('low') || budgetLevel.toLowerCase().includes('budget')) {
      budgetInstruction = "STRICT LOW BUDGET: Recommend budget backpacker hostels/homestays, free public entry viewpoints/parks, public bus/train transport, scenic walking trails, and famous budget street food stalls.";
    }

    const prompt = `
      Create a detailed ${daysCount}-day travel itinerary for ${destination}.
      Preferences:
      - Interest: ${interest}
      - BUDGET LEVEL: ${budgetLevel.toUpperCase()}
      - Travel Type: ${travelType}
      - Language: ${language}

      BUDGET CUSTOMIZATION INSTRUCTION:
      ${budgetInstruction}
      
      STRICT MANDATORY RULES FOR EACH DAY (MORNING, AFTERNOON, EVENING):
      - You MUST include a SPECIFIC, REAL, FAMOUS place name for ${destination} (e.g. "Sri Venkateswara Swamy Temple", "Borra Caves", "Taj Mahal East Gate", "Amber Fort Sheesh Mahal").
      - DO NOT EVER use generic words like "Visit popular local attraction" or "Explore local places".
      - Tailor the transport, dining, and stay advice EXACTLY to the ${budgetLevel.toUpperCase()} budget level.
      - For EVERY morning, afternoon, and evening item, explicitly structure your response as:
        1. 📍 Specific Real Place Name
        2. 🕒 Perfect Time to Visit (e.g. "6:30 AM Sunrise", "4:30 PM Golden Hour")
        3. 🌲 Nature & Scenic View Description (including budget-tailored transport/food detail)

      Respond ONLY in valid JSON format with this structure:
      {
        "title": "String (e.g. ${daysCount}-Day ${budgetLevel} Budget Experience in ${destination})",
        "itinerary": [
          {
            "day": 1,
            "morning": "📍 Place: [Specific Real Place] | 🕒 Perfect Time: [Exact Time] | 🌲 Nature & View: [Scenic View & Budget Transport Detail]",
            "afternoon": "📍 Place: [Specific Real Place] | 🕒 Perfect Time: [Exact Time] | 🌲 Nature & View: [Scenic View & Budget Dining Detail]",
            "evening": "📍 Place: [Specific Real Place] | 🕒 Perfect Time: [Exact Time] | 🌲 Nature & View: [Scenic View & Budget Activity Detail]"
          }
        ]
      }
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.AI_API_KEY}`;
    
    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await axios.post(url, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json'
          }
        });
        break; // Success
      } catch (err) {
        if (err.response && (err.response.status === 503 || err.response.status === 429) && retries > 1) {
          retries--;
          await new Promise(res => setTimeout(res, 3000));
        } else {
          throw err;
        }
      }
    }

    const aiText = response.data.candidates[0].content.parts[0].text;
    let parsedData;
    try {
      parsedData = JSON.parse(aiText);
    } catch (e) {
      const jsonMatch = aiText.match(/```json([\s\S]*?)```/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[1]) : await generateDatabaseFallback(destination, daysCount, budgetLevel);
    }

    res.status(200).json({
      success: true,
      isFallback: false,
      data: parsedData
    });

  } catch (error) {
    console.error('AI Generation Error:', error.message);
    const fallbackData = await generateDatabaseFallback(req.body.destination || 'Tirupati', parseInt(req.body.days) || 3, req.body.budget || 'Medium');
    res.status(200).json({
      success: true,
      isFallback: true,
      message: 'AI Service temporarily unavailable. Serving budget-tailored database itinerary.',
      data: fallbackData
    });
  }
};

exports.chatAssistant = async (req, res) => {
  try {
    const { question, language = 'English' } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid question.' });
    }

    // Gather live website data for high context awareness
    const destList = await Destination.find().select('name location bestAttractions famousFoods').lean();
    const destNames = destList.map(d => d.name).join(', ');

    // Fallback answer builder
    const getFallbackAnswer = () => {
      const q = question.toLowerCase();
      if (q.includes('tirupati')) {
        return `Tirupati is India's spiritual capital in Andhra Pradesh! Key attractions include Sri Venkateswara Swamy Temple (Tirumala), Silathoranam Natural Arch, and Kapila Theertham. Don't forget to try the famous Tirupati Srivari Laddu!`;
      }
      if (q.includes('araku')) {
        return `Araku Valley is a picturesque hill station in Andhra Pradesh famous for Borra Caves, Katiki Waterfalls, organic Araku coffee, and tribal Bongu (Bamboo) Chicken.`;
      }
      if (q.includes('agra')) {
        return `Agra features the world-famous Taj Mahal, Agra Fort, and Fatehpur Sikri, along with delicious Agra Petha!`;
      }
      if (q.includes('guide') || q.includes('book')) {
        return `You can find verified local guides on our Smart Tourism platform under specific destination details or register as a guide via our Login Portal!`;
      }
      if (q.includes('photo') || q.includes('camera')) {
        return `Our platform connects you with certified landscape and portrait photographers who upload live scenic photo telemetry for top travel destinations.`;
      }
      if (q.includes('how') || q.includes('use') || q.includes('website')) {
        return `Welcome to Smart Tourism! You can explore destinations on the Destinations page, generate custom AI itineraries on the AI Planner page, register as a Tourist/Guide/Photographer, or log in to your dashboard.`;
      }
      return `Smart Tourism covers top Indian destinations including ${destNames}. You can browse destinations, generate custom multi-day AI itineraries on our Planner page, check local weather, and connect with verified local guides and photographers!`;
    };

    if (!process.env.AI_API_KEY) {
      return res.json({
        success: true,
        answer: getFallbackAnswer(),
        isFallback: true
      });
    }

    const systemPrompt = `
      You are the official AI Smart Tourism Assistant for the "Smart Tourism Intelligence Platform" website.
      Website Context & Features:
      - Featured Destinations: ${destNames}
      - Features available: Custom AI Itinerary Planner (/planner), Destination Search (/destinations), Weather and Map satellite views, Verified Local Guides, Certified Photographers, Tourist Dashboard, Admin Command Panel.
      - User asked: "${question}"
      - Preferred Response Language: ${language}

      Instructions:
      1. Answer the user's question clearly, politely, and accurately based on the website's features and Indian tourism.
      2. Respond directly in the specified language (${language}). If the requested language is an Indian language (e.g. Hindi, Telugu, Tamil, Marathi, Bengali, etc.), respond in that language using standard script.
      3. Keep the response concise (2 to 4 sentences). Do not use markdown code blocks.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.AI_API_KEY}`;
    
    let response;
    try {
      response = await axios.post(url, {
        contents: [{ parts: [{ text: systemPrompt }] }]
      });
      const aiResponseText = response.data.candidates[0].content.parts[0].text;
      return res.json({
        success: true,
        answer: aiResponseText.trim(),
        isFallback: false
      });
    } catch (err) {
      console.error('AI Chat Assistant Error:', err.message);
      return res.json({
        success: true,
        answer: getFallbackAnswer(),
        isFallback: true
      });
    }

  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

