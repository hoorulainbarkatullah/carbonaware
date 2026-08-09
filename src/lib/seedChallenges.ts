import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultBadges = [
  {
    name: "Eco Beginner",
    description: "Score 70% or more",
    scoreReq: 70,
    icon: "CheckCircle",
    color: "emerald",
  },
  {
    name: "Eco Explorer",
    description: "Score 80% or more",
    scoreReq: 80,
    icon: "Globe",
    color: "blue",
  },
  {
    name: "Eco Expert",
    description: "Score 90% or more",
    scoreReq: 90,
    icon: "Shield",
    color: "purple",
  },
  {
    name: "Eco Champion",
    description: "Score 100%",
    scoreReq: 100,
    icon: "Trophy",
    color: "amber",
  },
];

const defaultChallenges = [
  {
    title: "Eco Quiz Challenge",
    description: "Test your knowledge about climate change, sustainability, and eco-friendly living.",
    fullDescription: "Dive deep into environmental concepts, personal carbon emissions, sustainable travel, and waste reduction strategies. Test your sustainability IQ and unlock exclusive badges!",
    difficulty: "Easy",
    category: "Quiz",
    estimatedTime: "5 min",
    rewardPoints: 100,
    xpReward: 150,
    badgeReward: "Eco Beginner",
    topicsCovered: "Climate change, renewable energy, waste management, sustainable living and more.",
    rules: "Answer all 10 questions. Score 70% or higher to pass. You may retry as many times as needed.",
    totalQuestions: 10,
    passingScore: 70,
    deadline: "Ends in 6d 12h 30m",
    status: "Active",
    isFeatured: true,
    questions: [
      {
        question: "Which sector is typically the largest contributor to personal carbon footprints?",
        options: ["Transportation and fossil fuel travel", "Digital messaging and emails", "Clothing manufacturing", "Paper consumption"],
        correctIndex: 0,
        explanation: "Transportation (passenger cars and flights) makes up over 40% of an average individual's carbon footprint.",
      },
      {
        question: "How many kilograms of CO₂ are emitted per liter of gasoline burned?",
        options: ["0.5 kg", "2.31 kg", "5.0 kg", "10.2 kg"],
        correctIndex: 1,
        explanation: "Burning 1 liter of gasoline releases approximately 2.31 kg of CO₂ directly into the atmosphere.",
      },
      {
        question: "Which dietary choice has the lowest carbon intensity per gram of protein?",
        options: ["Plant-based legumes and lentils", "Beef and red meat", "Farm-raised salmon", "Processed dairy cheese"],
        correctIndex: 0,
        explanation: "Lentils and beans produce under 0.9 kg CO₂e per kg, compared to beef which produces over 60 kg CO₂e.",
      },
      {
        question: "What is the primary greenhouse gas released by organic food waste in landfills?",
        options: ["Nitrous Oxide", "Methane (CH₄)", "Chlorofluorocarbons", "Carbon Monoxide"],
        correctIndex: 1,
        explanation: "Anaerobic decomposition of food waste produces Methane, which is 28x more potent than CO₂ over 100 years.",
      },
      {
        question: "What percentage of carbon emissions can carpooling 3 days a week reduce for commuters?",
        options: ["5%", "15%", "40%", "80%"],
        correctIndex: 2,
        explanation: "Sharing rides 3 days a week cuts single-occupancy vehicle emissions by roughly 40% monthly.",
      },
      {
        question: "Which renewable energy source yields the lowest lifetime carbon intensity?",
        options: ["Coal with CCS", "Onshore Wind Power", "Natural Gas Peaker", "Diesel Generator"],
        correctIndex: 1,
        explanation: "Onshore wind energy generates around 11-12g CO₂e per kWh over its complete lifecycle.",
      },
      {
        question: "What is phantom load (vampire draw) in household energy?",
        options: ["Power consumed by electronic devices while turned off or standby", "Lightning strikes on solar panels", "Overcharging phone batteries", "Inefficient refrigerator compressors"],
        correctIndex: 0,
        explanation: "Standby power drawn by plugged-in appliances accounts for up to 10% of household electricity bills.",
      },
      {
        question: "How much energy does recycling aluminum save compared to producing new aluminum from ore?",
        options: ["10%", "30%", "60%", "95%"],
        correctIndex: 3,
        explanation: "Recycling aluminum consumes 95% less energy than refining raw bauxite ore.",
      },
      {
        question: "What is single-use plastic's main environmental threat to ocean life?",
        options: ["Microplastic ingestion and habitat degradation", "Increasing ocean temperature", "Desalination of seawater", "Algal bloom depletion"],
        correctIndex: 0,
        explanation: "Plastics break down into microplastics that enter the ocean food web, harming marine life.",
      },
      {
        question: "Which habit produces the fastest reduction in your daily carbon footprint?",
        options: ["Switching to LED lights", "Replacing 3 car commutes with walking/biking", "Using bamboo toothbrushes", "Unplugging toaster"],
        correctIndex: 1,
        explanation: "Avoiding motor vehicle trips directly eliminates active fuel combustion and tailpipe emissions.",
      },
    ],
  },
  {
    title: "Carbon Footprint Basics",
    description: "Learn the foundational principles of calculating and reducing greenhouse gas emissions.",
    fullDescription: "Master the basics of Scope 1, 2, and 3 personal emissions and discover simple everyday optimizations.",
    difficulty: "Easy",
    category: "Carbon Footprint Basics",
    estimatedTime: "4 min",
    rewardPoints: 120,
    xpReward: 160,
    badgeReward: "Eco Beginner",
    topicsCovered: "Scope 1-3 emissions, carbon equivalencies, footprint calculation.",
    rules: "Complete all questions and achieve at least 70% to pass.",
    totalQuestions: 5,
    passingScore: 70,
    deadline: "Ends in 5d 10h",
    status: "Active",
    isFeatured: false,
    questions: [
      {
        question: "What are Scope 1 emissions for an individual or household?",
        options: ["Direct emissions from owned or controlled sources like driving a car", "Indirect emissions from purchased electricity", "Emissions from supply chain manufacturing", "Off-grid solar generation"],
        correctIndex: 0,
        explanation: "Direct emissions from fuel burned in owned vehicles or gas heaters belong to Scope 1.",
      },
      {
        question: "What is CO₂ equivalent (CO₂e)?",
        options: ["A metric unit used to compare emissions from various greenhouse gases on the basis of their GWP", "Pure carbon gas", "Carbon monoxide in smog", "Plant photosynthesis output"],
        correctIndex: 0,
        explanation: "CO₂e standardizes different gases like methane and nitrous oxide into equivalent warming power of CO₂.",
      },
      {
        question: "Which activity generates highest personal carbon footprint per hour?",
        options: ["Short-haul commercial flight", "Watching 4K streaming TV", "Hot shower for 10 min", "Using electric oven"],
        correctIndex: 0,
        explanation: "Aviation releases intense fossil fuel emissions directly into the upper atmosphere.",
      },
      {
        question: "What is a carbon sink?",
        options: ["Anything that absorbs more carbon from the atmosphere than it releases", "A kitchen sink made of carbon fiber", "A coal mine shaft", "An oil refinery flare"],
        correctIndex: 0,
        explanation: "Forests, oceans, and soils absorb atmospheric CO₂, acting as natural carbon sinks.",
      },
      {
        question: "What does carbon neutrality mean?",
        options: ["Balancing emitted carbon with an equivalent amount absorbed or offset", "Using zero electricity", "Stopping all transportation", "Only eating raw food"],
        correctIndex: 0,
        explanation: "Achieving carbon neutrality means net zero greenhouse gas emissions.",
      },
    ],
  },
  {
    title: "Sustainable Transport",
    description: "Commit to low-carbon mobility choices like cycling, walking, public transit, and carpooling.",
    fullDescription: "Explore eco-friendly urban mobility, electric vehicle efficiency, and active transportation health benefits.",
    difficulty: "Medium",
    category: "Sustainable Transport",
    estimatedTime: "5 min",
    rewardPoints: 150,
    xpReward: 200,
    badgeReward: "Eco Explorer",
    topicsCovered: "Active commuting, public transit efficiency, EV charging.",
    rules: "Answer questions accurately. Passing score is 70%.",
    totalQuestions: 5,
    passingScore: 70,
    deadline: "Ends in 4d 08h",
    status: "Active",
    isFeatured: false,
    questions: [
      {
        question: "What is the greenest mode of urban transport?",
        options: ["Walking or bicycling", "Hybrid electric car", "Electric scooter", "Diesel bus"],
        correctIndex: 0,
        explanation: "Human-powered active transport generates zero direct operational carbon emissions.",
      },
      {
        question: "How much lower are life-cycle emissions of an EV compared to a petrol car on average grids?",
        options: ["10-20% lower", "50-70% lower", "Same emissions", "Higher emissions"],
        correctIndex: 1,
        explanation: "Even on mixed electricity grids, EVs produce roughly 50-70% fewer lifetime emissions.",
      },
      {
        question: "What does eco-driving involve?",
        options: ["Smooth acceleration, maintaining steady speed, and proper tire inflation", "Driving as fast as possible to reach home sooner", "Idling engine at red lights", "Carrying extra weight in trunk"],
        correctIndex: 0,
        explanation: "Eco-driving techniques optimize fuel consumption and cut tailpipe emissions by 15%.",
      },
      {
        question: "Why does public transit reduce traffic congestion emissions?",
        options: ["It moves many passengers per vehicle, reducing emissions per person-mile", "Buses don't burn fuel", "Trains travel underground", "Trams run on water"],
        correctIndex: 0,
        explanation: "High-capacity buses and trains replace dozens of individual passenger cars.",
      },
      {
        question: "What is telecommuting's environmental benefit?",
        options: ["Eliminates daily vehicle trips, cutting commute emissions completely", "Increases office air conditioning", "Uses more road space", "Requires more parking spots"],
        correctIndex: 0,
        explanation: "Working from home eliminates fuel consumed in daily highway traffic gridlock.",
      },
    ],
  },
  {
    title: "Reduce Food Waste",
    description: "Minimize household kitchen waste, plan plant-rich meals, and master composting.",
    fullDescription: "Food production accounts for over 25% of global emissions. Learn actionable ways to shop smarter and store food.",
    difficulty: "Medium",
    category: "Reduce Food Waste",
    estimatedTime: "4 min",
    rewardPoints: 140,
    xpReward: 180,
    badgeReward: "Eco Explorer",
    topicsCovered: "Food storage techniques, meal planning, composting basics.",
    rules: "Complete the quiz with 70% or higher score.",
    totalQuestions: 5,
    passingScore: 70,
    deadline: "Ends in 5d 14h",
    status: "Active",
    isFeatured: false,
    questions: [
      {
        question: "What fraction of all global food produced for human consumption is wasted?",
        options: ["About 1/3 (33%)", "Around 5%", "Over 80%", "Less than 1%"],
        correctIndex: 0,
        explanation: "Roughly 1.3 billion tons of food (one-third globally) is lost or wasted every year.",
      },
      {
        question: "What is the best way to prevent food spoilage at home?",
        options: ["Meal planning and proper refrigeration/storage", "Buying double items on sale", "Leaving fruits in direct sunlight", "Storing milk in door shelves"],
        correctIndex: 0,
        explanation: "Planning meals beforehand ensures you buy only what you consume before expiration.",
      },
      {
        question: "What does composting organic waste achieve?",
        options: ["Prevents methane production in landfills and creates nutrient-rich soil", "Turns food into plastic", "Releases heavy carbon smoke", "Purifies tap water"],
        correctIndex: 0,
        explanation: "Aerobic composting prevents anaerobic decay, eliminating methane emissions while nourishing crops.",
      },
      {
        question: "Difference between 'Use By' and 'Best Before' dates?",
        options: ["'Use By' relates to safety; 'Best Before' relates to peak quality", "They mean exact same thing", "'Best Before' means throw away immediately", "'Use By' is optional"],
        correctIndex: 0,
        explanation: "'Best Before' indicates freshness/flavor, whereas 'Use By' indicates food safety thresholds.",
      },
      {
        question: "Which food item has highest carbon footprint per kg?",
        options: ["Beef", "Poultry", "Rice", "Tofu"],
        correctIndex: 0,
        explanation: "Bovine cattle production releases high methane volumes and requires extensive land and feed resources.",
      },
    ],
  },
  {
    title: "Energy Saving",
    description: "Optimize home power usage, switch to efficient lighting, and lower utility bills.",
    fullDescription: "Learn to identify energy vampire devices, program smart thermostats, and transition to green power tariffs.",
    difficulty: "Medium",
    category: "Energy Saving",
    estimatedTime: "5 min",
    rewardPoints: 130,
    xpReward: 170,
    badgeReward: "Eco Explorer",
    topicsCovered: "LED lighting, HVAC efficiency, smart power strips.",
    rules: "Score at least 70% to complete the challenge.",
    totalQuestions: 5,
    passingScore: 70,
    deadline: "Ends in 3d 10h",
    status: "Active",
    isFeatured: false,
    questions: [
      {
        question: "How much energy do LED light bulbs save compared to incandescent bulbs?",
        options: ["75% to 80% less energy", "10% less", "50% more", "No difference"],
        correctIndex: 0,
        explanation: "LED bulbs convert most energy into light rather than heat, lasting up to 25x longer.",
      },
      {
        question: "What is the recommended summer thermostat setting for optimal energy efficiency?",
        options: ["24°C (75°F) or 25°C (78°F)", "16°C (60°F)", "20°C (68°F)", "30°C (86°F)"],
        correctIndex: 0,
        explanation: "Setting AC thermostats to 24-25°C balances cooling comfort with minimal compressor power load.",
      },
      {
        question: "How do smart power strips prevent phantom energy draw?",
        options: ["By cutting power to standby devices automatically when primary device is off", "By generating free solar energy", "By boosting voltage", "By dimming room lights"],
        correctIndex: 0,
        explanation: "Smart power strips detect standby states and shut down power flow to peripheral accessories.",
      },
      {
        question: "What household appliance consumes the most energy on average?",
        options: ["Heating and Air Conditioning (HVAC)", "Microwave", "LED Television", "Laptop charger"],
        correctIndex: 0,
        explanation: "Heating and cooling account for over 45% of total household utility energy usage.",
      },
      {
        question: "What does washing clothes in cold water achieve?",
        options: ["Saves up to 90% of energy used by washing machines", "Makes clothes fade faster", "Uses double detergent", "Shrinks cotton fabric"],
        correctIndex: 0,
        explanation: "Water heating accounts for roughly 90% of the energy consumed in running laundry cycles.",
      },
    ],
  },
  {
    title: "Recycling Challenge",
    description: "Master waste sorting, circular economy practices, and proper material disposal.",
    fullDescription: "Learn what can and cannot be recycled in municipal systems, avoiding contamination of recyclable streams.",
    difficulty: "Easy",
    category: "Recycling Challenge",
    estimatedTime: "4 min",
    rewardPoints: 110,
    xpReward: 140,
    badgeReward: "Eco Beginner",
    topicsCovered: "Plastic Resin Identification Codes, paper recycling, glass circularity.",
    rules: "Score 70% or more to earn your recycling badge.",
    totalQuestions: 5,
    passingScore: 70,
    deadline: "Ends in 6d 00h",
    status: "Active",
    isFeatured: false,
    questions: [
      {
        question: "Should you rinse food containers before placing them in recycling bins?",
        options: ["Yes, food residue contaminates recyclable material batches", "No, water is wasted", "Only if it is metal", "It does not matter"],
        correctIndex: 0,
        explanation: "Rinsing removes oils and organic debris that can spoil entire cardboard/plastic recycling batches.",
      },
      {
        question: "Can greasy pizza boxes be recycled with clean paper?",
        options: ["No, oil ruins paper fiber recycling processes", "Yes, grease improves paper strength", "Yes, all cardboard is fine", "Only if folded"],
        correctIndex: 0,
        explanation: "Grease prevents paper fibers from binding during pulping; tear off clean box tops to recycle instead.",
      },
      {
        question: "Which material can be recycled endlessly without loss of quality?",
        options: ["Glass and Aluminum", "Soft plastic bags", "Paper towels", "Styrofoam"],
        correctIndex: 0,
        explanation: "Glass and aluminum retain 100% of their structural integrity through infinite melting cycles.",
      },
      {
        question: "What is wishcycling?",
        options: ["Tossing non-recyclable items into recycling bins hoping they will get recycled", "Wishing for clean air", "Burying trash in garden", "Using paper straws"],
        correctIndex: 0,
        explanation: "Wishcycling clogs sorting equipment and causes valid recyclable loads to be landfilled.",
      },
      {
        question: "What do the numbers inside chasing arrows on plastic indicate?",
        options: ["Plastic resin type / material code", "How many times it was recycled", "Product price tier", "Warranty months"],
        correctIndex: 0,
        explanation: "Resin identification codes (1 to 7) specify the specific polymer chemistry used in manufacture.",
      },
    ],
  },
  {
    title: "Plastic Free Week",
    description: "Eliminate single-use plastics, adopt reusable alternatives, and combat ocean pollution.",
    fullDescription: "Take actionable steps to audit your plastic footprint, replace plastic bags, cutlery, and water bottles with sustainable options.",
    difficulty: "Hard",
    category: "Plastic Free Week",
    estimatedTime: "6 min",
    rewardPoints: 180,
    xpReward: 250,
    badgeReward: "Eco Expert",
    topicsCovered: "Single-use plastic alternatives, microplastics, ocean health.",
    rules: "Complete the quiz with 70% score.",
    totalQuestions: 5,
    passingScore: 70,
    deadline: "Ends in 7d 12h",
    status: "Active",
    isFeatured: false,
    questions: [
      {
        question: "How long does a typical plastic bottle take to decompose in nature?",
        options: ["450 years", "5 years", "50 years", "Never breaks down fully, turns into microplastics"],
        correctIndex: 3,
        explanation: "Petroleum plastics fragment into microscopic plastic particles rather than organically biodegrading.",
      },
      {
        question: "What is a eco-friendly replacement for single-use plastic grocery bags?",
        options: ["Reusable organic cotton or canvas tote bags", "Thicker plastic bags", "Paper bags discarded after 1 use", "Foil wrap"],
        correctIndex: 0,
        explanation: "Durable tote bags used hundreds of times replace thousands of disposable plastic checkout sacks.",
      },
      {
        question: "Which personal hygiene product often contains hidden microplastics?",
        options: ["Exfoliating microbead scrubs & synthetic wet wipes", "Solid bar soap", "Wooden hairbrush", "Pure coconut oil"],
        correctIndex: 0,
        explanation: "Synthetic scrubs and non-woven polyester wipes shed microfibers directly down drain pipes.",
      },
      {
        question: "Why are plastic straws particularly hazardous to marine wildlife?",
        options: ["Their small size easily lodges in airways and digestive tracts of marine animals", "They dissolve into acid", "They block sunlight", "They sink ships"],
        correctIndex: 0,
        explanation: "Narrow plastic straws cannot be sorted by recycling machinery and easily reach waterways.",
      },
      {
        question: "What is the principle of 'Refuse' in zero-waste living?",
        options: ["Declining unnecessary single-use items like extra plastic utensils and double bags", "Refusing to recycle", "Refusing to talk about eco issues", "Refusing to buy food"],
        correctIndex: 0,
        explanation: "Refusing unwanted plastic at the source prevents waste from being created in the first place.",
      },
    ],
  },
  {
    title: "Climate Action & Green Lifestyle",
    description: "Engage in community sustainability, renewable advocacy, and holistic green habits.",
    fullDescription: "Explore how individual choices scale into community impact through advocacy, carbon offsets, and eco lifestyle habits.",
    difficulty: "Hard",
    category: "Climate Action",
    estimatedTime: "6 min",
    rewardPoints: 200,
    xpReward: 300,
    badgeReward: "Eco Champion",
    topicsCovered: "Climate activism, community greening, renewable advocacy.",
    rules: "Score 70% or higher to pass.",
    totalQuestions: 5,
    passingScore: 70,
    deadline: "Ends in 8d 00h",
    status: "Active",
    isFeatured: false,
    questions: [
      {
        question: "What is urban tree canopy planting's dual benefit?",
        options: ["Sequestration of CO₂ and mitigation of urban heat island effect", "Increasing car traffic", "Consuming all rainwater", "Eliminating wind"],
        correctIndex: 0,
        explanation: "Trees absorb CO₂, shade buildings, lower ambient city temperatures, and filter air pollutants.",
      },
      {
        question: "What is circular economy?",
        options: ["An economic model designed to eliminate waste and continual use of resources", "Buying goods on circle credit cards", "Only trading coins", "Burning waste for power"],
        correctIndex: 0,
        explanation: "Circular economies prioritize repair, reuse, remanufacture, and recycling over take-make-dispose models.",
      },
      {
        question: "How does eating locally grown seasonal produce lower emissions?",
        options: ["Reduces food-miles transportation emissions and energy-intensive cold storage", "Local food has no carbon", "Farmers don't use tractors", "Seasonal food never spoils"],
        correctIndex: 0,
        explanation: "Short supply chains eliminate long-distance air/refrigerated freight emissions.",
      },
      {
        question: "What is fast fashion's environmental burden?",
        options: ["Massive water pollution, high carbon emissions, and microplastic fiber shedding", "Uses too much silk", "Handmade tailoring", "Organic wool growth"],
        correctIndex: 0,
        explanation: "Fast fashion produces 10% of global emissions and discards millions of tons of synthetic garments yearly.",
      },
      {
        question: "What is the most effective single step a consumer can take to promote renewable energy?",
        options: ["Switching home electric tariff to 100% certified renewable energy supplier", "Turning off laptop at night", "Using paper plates", "Buying a gas generator"],
        correctIndex: 0,
        explanation: "Demanding 100% green power tariffs shifts capital directly toward wind and solar generator expansion.",
      },
    ],
  },
];

async function seed() {
  console.log("Seeding Badges...");
  for (const b of defaultBadges) {
    const existingBadge = await (prisma as any).badge.findFirst({
      where: { name: b.name },
    });
    if (existingBadge) {
      await (prisma as any).badge.update({
        where: { id: existingBadge.id },
        data: b,
      });
    } else {
      await (prisma as any).badge.create({
        data: b,
      });
    }
  }

  console.log("Seeding Challenges and Questions...");
  for (const item of defaultChallenges) {
    const { questions, ...challengeData } = item;
    
    let existing = await (prisma as any).challenge.findFirst({
      where: { title: challengeData.title },
    });

    if (!existing) {
      existing = await (prisma as any).challenge.create({
        data: challengeData,
      });
    }

    const existingQCount = await (prisma as any).challengeQuestion.count({
      where: { challengeId: existing.id },
    });

    if (existingQCount === 0 && questions) {
      for (const q of questions) {
        await (prisma as any).challengeQuestion.create({
          data: {
            challengeId: existing.id,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

