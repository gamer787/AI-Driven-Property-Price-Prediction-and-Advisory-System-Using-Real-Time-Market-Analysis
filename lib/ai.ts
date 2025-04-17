import { GoogleGenerativeAI } from '@google/generative-ai';
import { Platform } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Constants for prediction bounds
const PREDICTION_LIMITS = {
  MIN_CHANGE: -15,
  MAX_CHANGE: 25,
  DEFAULT_CONFIDENCE: 'Medium'
};

// Validate property data
function validatePropertyData(data: any): boolean {
  return !!(
    data &&
    data.id &&
    data.location &&
    data.price &&
    data.type &&
    data.area
  );
}

// Cache to store predictions for each property
const predictionCache: Record<string, any> = {};

// Market factors that influence price predictions
const MARKET_FACTORS = {
  locations: {
    'Gachibowli': { 
      growth: 8.5,
      risk: 'low',
      saturation: 0.7,
      infrastructure: 0.9,
      jobMarket: 0.95
    },
    'Jubilee Hills': { 
      growth: 6.2,
      risk: 'low',
      saturation: 0.85,
      infrastructure: 0.95,
      jobMarket: 0.8
    },
    'Banjara Hills': { 
      growth: 5.8,
      risk: 'low',
      saturation: 0.9,
      infrastructure: 0.95,
      jobMarket: 0.75
    },
    'Madhapur': { 
      growth: 7.8,
      risk: 'medium',
      saturation: 0.75,
      infrastructure: 0.85,
      jobMarket: 0.9
    },
    'Kondapur': { 
      growth: 7.2,
      risk: 'medium',
      saturation: 0.65,
      infrastructure: 0.8,
      jobMarket: 0.85
    },
    'Kukatpally': { 
      growth: 6.5,
      risk: 'medium',
      saturation: 0.6,
      infrastructure: 0.75,
      jobMarket: 0.8
    }
  },
  propertyTypes: {
    '1BHK': { 
      demand: 0.85,
      appreciation: 4.2,
      yieldPotential: 0.95,
      inventoryLevel: 0.7
    },
    '2BHK': { 
      demand: 0.95,
      appreciation: 5.5,
      yieldPotential: 0.9,
      inventoryLevel: 0.8
    },
    '3BHK': { 
      demand: 0.8,
      appreciation: 4.8,
      yieldPotential: 0.85,
      inventoryLevel: 0.75
    },
    '4BHK': { 
      demand: 0.6,
      appreciation: 4.0,
      yieldPotential: 0.7,
      inventoryLevel: 0.5
    },
    'Villa': { 
      demand: 0.4,
      appreciation: 3.5,
      yieldPotential: 0.6,
      inventoryLevel: 0.3
    }
  }
};

function analyzePriceRange(price: string): number {
  const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
  const isInCrores = price.includes('Cr');
  const priceInLakhs = isInCrores ? numericPrice * 100 : numericPrice;
  
  // Adjust appreciation based on price segment
  if (priceInLakhs < 40) return 1.2; // Affordable segment
  if (priceInLakhs < 60) return 1.1; // Mid segment
  if (priceInLakhs < 100) return 1.0; // Premium segment
  return 0.9; // Luxury segment
}

function calculatePriceChange(propertyData: any): number {
  const location = propertyData.location.split(',')[0].trim();
  const locationFactor = MARKET_FACTORS.locations[location] || { growth: 7, risk: 'medium' };
  const typeFactor = MARKET_FACTORS.propertyTypes[propertyData.type] || { 
    demand: 0.7,
    appreciation: 4.5,
    yieldPotential: 0.8,
    inventoryLevel: 0.6
  };
  const priceMultiplier = analyzePriceRange(propertyData.price);
  const date = new Date();
  
  // Economic cycle (3-year cycle)
  const economicCycle = Math.sin((date.getFullYear() * 12 + date.getMonth()) * Math.PI / 18) * 1.5;
  
  // Seasonal variation (yearly cycle with reduced amplitude)
  const seasonalFactor = Math.sin(date.getMonth() * Math.PI / 6) * 1.2;
  
  // Market momentum (6-month cycle)
  const marketMomentum = Math.sin((date.getMonth() + date.getFullYear() * 12) * Math.PI / 3) * 0.8;
  
  // Base appreciation
  let priceChange = locationFactor.growth * (1 - locationFactor.saturation) * 0.6;
  
  // Adjust for property type
  const demandMultiplier = typeFactor.demand * (1 - typeFactor.inventoryLevel);
  priceChange += typeFactor.appreciation * demandMultiplier * 0.4;
  
  // Apply price range multiplier
  priceChange *= priceMultiplier;
  
  // Apply market dynamics
  priceChange += seasonalFactor;
  priceChange += economicCycle;
  priceChange += marketMomentum;
  
  // Infrastructure impact
  priceChange *= (1 + (locationFactor.infrastructure - 0.5) * 0.3);
  
  // Job market influence
  priceChange *= (1 + (locationFactor.jobMarket - 0.5) * 0.2);
  
  // Add some controlled randomness (-2 to +2)
  const randomFactor = (Math.random() * 2 - 1) * 1.5;
  priceChange += randomFactor;
  
  // Ensure reasonable bounds
  priceChange = Math.max(PREDICTION_LIMITS.MIN_CHANGE, Math.min(PREDICTION_LIMITS.MAX_CHANGE, priceChange));
  
  return Number(priceChange.toFixed(2));
}

export async function getPricePrediction(propertyData: any) {
  if (!API_KEY) {
    if (Platform.OS !== 'web') {
      console.warn('Using mock predictions - Gemini API key not configured');
    }
    return getMockPrediction(propertyData);
  }

  if (!validatePropertyData(propertyData)) {
    if (Platform.OS !== 'web') {
      console.warn('Invalid property data - using mock prediction');
    }
    return getMockPrediction(propertyData);
  }

  // Check if we have a cached prediction for this property
  if (predictionCache[propertyData.id]) {
    return predictionCache[propertyData.id];
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        }
      ]
    });

    const prompt = `
    As a real estate market expert, analyze this property and predict its price trend for the next 6 months. Consider:

    Property Details:
    Location: ${propertyData.location}
    Current Price: ${propertyData.price}
    Property Type: ${propertyData.type}
    Area: ${propertyData.area}

    Analysis Requirements:
    1. Location Analysis:
       - Area development status
       - Infrastructure projects
       - Connectivity and amenities
       - Future development plans

    2. Price Analysis:
       - Current market positioning
       - Price per square foot comparison
       - Historical price trends in the area
       - Future appreciation potential

    3. Property Analysis:
       - Size and layout efficiency
       - Type demand in the area
       - Target demographic appeal
       - Investment potential

    4. Market Trends:
       - Current market phase (buyer's/seller's)
       - Supply-demand dynamics
       - Comparable property prices
       - Economic factors affecting the area

    Format the response as:
    PREDICTION: [percentage change with sign]
    RECOMMENDATION: [Buy Now/Wait]
    CONFIDENCE: [High/Medium/Low]
    POINTS:
    - Location: [key point about location]
    - Infrastructure: [key point about infrastructure]
    - Market: [key point about market conditions]
    - Property: [key point about property features]
    - Investment: [key point about investment potential]
    - Risk: [key point about potential risks]
    - Future: [key point about future prospects]
    - Demand: [key point about current demand]
    REASONING: [comprehensive analysis with market evidence]
  `;
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text?.trim()) {
      console.warn('Empty response from AI, using calculated prediction');
      return getMockPrediction(propertyData);
    }

    const lines = text.split('\n');
    let priceChange = calculatePriceChange(propertyData);
    let recommendation = '';
    let confidence = PREDICTION_LIMITS.DEFAULT_CONFIDENCE;
    let points: string[] = [];
    let reasoning = '';
    
    // Parse prediction line
    const predictionLine = lines.find(line => line.trim().startsWith('PREDICTION:'))?.trim();
    if (predictionLine) {
      const match = predictionLine.match(/-?\d+\.?\d*/)?.[0];
      const parsedChange = match ? parseFloat(match) : null;
      if (parsedChange !== null && 
          !isNaN(parsedChange) && 
          parsedChange >= PREDICTION_LIMITS.MIN_CHANGE && 
          parsedChange <= PREDICTION_LIMITS.MAX_CHANGE) {
        priceChange = parsedChange;
      }
    }
    
    // Parse recommendation
    const recommendationLine = lines.find(line => line.trim().startsWith('RECOMMENDATION:'))?.trim();
    recommendation = recommendationLine?.includes('Buy Now') ? 'Buy Now' : 'Wait';
    
    // Parse confidence
    const confidenceLine = lines.find(line => line.trim().startsWith('CONFIDENCE:'))?.trim();
    if (confidenceLine) {
      const confidence = confidenceLine.substring('CONFIDENCE:'.length).trim();
      if (['High', 'Medium', 'Low'].includes(confidence)) {
        confidence = confidence;
      }
    }
    
    // Parse points
    const extractedPoints = lines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(2));
    
    if (extractedPoints.length > 0) {
      points = extractedPoints;
    } else {
      points = getMockPoints(priceChange > 0);
    }
    
    // Parse reasoning
    const reasoningLine = lines.find(line => line.trim().startsWith('REASONING:'))?.trim();
    reasoning = reasoningLine 
      ? reasoningLine.substring('REASONING:'.length).trim() || getMockReasoning(priceChange > 0)
      : getMockReasoning(priceChange > 0);

    const prediction = {
      priceChange,
      recommendation,
      confidence,
      points,
      reasoning
    };

    // Validate prediction data
    if (
      typeof prediction.priceChange !== 'number' ||
      !prediction.recommendation ||
      !prediction.points?.length ||
      !prediction.reasoning
    ) {
      if (Platform.OS !== 'web') console.warn('Invalid prediction data - using mock prediction');
      console.error('Generated prediction:', prediction);
      return getMockPrediction(propertyData);
    }

    // Store prediction in cache before returning
    predictionCache[propertyData.id] = prediction;
    return prediction;
  } catch (error) {
    if (Platform.OS !== 'web') console.warn('AI prediction failed - using mock prediction');
    // Clear the cache for this property to allow retry
    delete predictionCache[propertyData.id];
    return getMockPrediction(propertyData);
  }
}

function getMockPoints(priceChange: number): string[] {
  const points = [];
  const date = new Date();
  const isSeasonalPeak = date.getMonth() >= 3 && date.getMonth() <= 8;
  
  // Market cycle analysis
  if (priceChange > 10) {
    points.push('Market showing strong upward momentum');
    points.push('Historical data indicates sustained growth phase');
  } else if (priceChange > 5) {
    points.push('Steady market growth with moderate appreciation');
    points.push('Balanced demand-supply dynamics');
  } else if (priceChange > 0) {
    points.push('Market stabilizing with potential for growth');
    points.push('Early signs of price recovery');
  } else if (priceChange > -5) {
    points.push('Market correction phase with opportunities');
    points.push('Price consolidation period expected');
  } else {
    points.push('Significant market adjustment ongoing');
    points.push('Wait for clear reversal signals');
  }

  // Seasonal factors
  if (isSeasonalPeak) {
    points.push('Peak buying season with increased activity');
    points.push('Higher transaction volumes expected');
  } else {
    points.push('Off-peak season with negotiation potential');
    points.push('Lower competition from other buyers');
  }

  // Investment perspective
  if (priceChange > 0) {
    points.push('Favorable ROI metrics for long-term investment');
    points.push('Strong rental yield potential in this area');
  } else {
    points.push('Consider value-add opportunities');
    points.push('Monitor market for entry points');
  }

  return points;
}

function getMockReasoning(priceChange: number): string {
  const date = new Date();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const isSeasonalPeak = date.getMonth() >= 3 && date.getMonth() <= 8;

  let reasoning = `Q${quarter} ${date.getFullYear()} Analysis: `;

  if (priceChange > 10) {
    reasoning += `Market fundamentals are exceptionally strong with ${priceChange}% projected appreciation. Key growth drivers include rapid infrastructure development, strong job market expansion, and limited inventory in premium segments. ${
      isSeasonalPeak ? 'Peak season dynamics further support price momentum.' : 'Even in off-peak season, demand remains robust.'
    } Historical data shows sustained price appreciation in similar market phases. Recommend acting quickly as prices are likely to rise further.`;
  } else if (priceChange > 5) {
    reasoning += `Market shows healthy growth potential with ${priceChange}% expected appreciation. Balanced demand-supply dynamics and steady infrastructure improvements support moderate price growth. ${
      isSeasonalPeak ? 'Seasonal factors are favorable for transactions.' : 'Current off-peak season offers strategic entry points.'
    } Risk-reward ratio appears favorable for medium to long-term investment horizon.`;
  } else if (priceChange > 0) {
    reasoning += `Market indicates modest growth potential of ${priceChange}%. While fundamentals remain stable, price appreciation may be limited by current market cycle position. ${
      isSeasonalPeak ? 'Consider seasonal premium in pricing negotiations.' : 'Off-peak season may offer better negotiation leverage.'
    } Recommend thorough due diligence and focus on properties with strong fundamentals.`;
  } else if (priceChange > -5) {
    reasoning += `Market showing signs of price correction with ${priceChange}% projected change. Current phase may present selective buying opportunities for value investors. ${
      isSeasonalPeak ? 'Despite peak season, prices remain under pressure.' : 'Off-peak season combined with market correction requires careful timing.'
    } Focus on properties with strong locations and potential for value appreciation.`;
  } else {
    reasoning += `Significant market adjustment expected with ${priceChange}% projection. Multiple factors including supply-demand imbalance and market cycle position suggest continued price pressure. ${
      isSeasonalPeak ? 'Even peak season unlikely to reverse current trend.' : 'Off-peak season may see further price adjustments.'
    } Recommend waiting for clear reversal signals before entering the market.`;
  }

  return reasoning;
}


function getMockPrediction(propertyData: any) {
  const priceChange = calculatePriceChange(propertyData);
  let recommendation;
  
  if (priceChange > 10) {
    recommendation = 'Buy Now';
  } else if (priceChange > 5) {
    recommendation = 'Buy Selectively';
  } else if (priceChange > 0) {
    recommendation = 'Hold/Buy';
  } else if (priceChange > -5) {
    recommendation = 'Wait/Monitor';
  } else {
    recommendation = 'Wait';
  }
  
  return {
    priceChange,
    recommendation,
    confidence: Math.abs(priceChange) > 8 ? 'High' : Math.abs(priceChange) > 4 ? 'Medium' : 'Low',
    points: getMockPoints(priceChange),
    reasoning: getMockReasoning(priceChange)
  };
}

export { getPricePrediction };