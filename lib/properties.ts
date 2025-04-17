// Property database simulation
const propertyDatabase = [
  {
    id: '1',
    title: 'Modern 2BHK Apartment',
    location: 'Gachibowli, Hyderabad',
    price: '45L',
    type: '2BHK',
    area: '1200 sqft',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=400',
    amenities: ['Gym', 'Swimming Pool', 'Security'],
    yearBuilt: 2022,
  },
  {
    id: '2',
    title: 'Luxury 3BHK Villa',
    location: 'Jubilee Hills, Hyderabad',
    price: '85L',
    type: '3BHK',
    area: '2200 sqft',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400',
    amenities: ['Garden', 'Club House', '24/7 Security'],
    yearBuilt: 2023,
  },
  {
    id: '3',
    title: 'Spacious 4BHK Penthouse',
    location: 'Banjara Hills, Hyderabad',
    price: '1.2Cr',
    type: '4BHK',
    area: '3000 sqft',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400',
    amenities: ['Terrace Garden', 'Private Pool', 'Smart Home'],
    yearBuilt: 2023,
  },
  {
    id: '4',
    title: 'Cozy 1BHK Studio',
    location: 'Madhapur, Hyderabad',
    price: '35L',
    type: '1BHK',
    area: '650 sqft',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400',
    amenities: ['Modular Kitchen', 'Power Backup', 'Car Parking'],
    yearBuilt: 2022,
  },
  {
    id: '5',
    title: 'Premium 3BHK Apartment',
    location: 'Kondapur, Hyderabad',
    price: '65L',
    type: '3BHK',
    area: '1800 sqft',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=400',
    amenities: ['Kids Play Area', 'Gym', 'Community Hall'],
    yearBuilt: 2023,
  },
  {
    id: '6',
    title: 'Modern 2BHK Flat',
    location: 'Kukatpally, Hyderabad',
    price: '42L',
    type: '2BHK',
    area: '1150 sqft',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=400',
    amenities: ['Covered Parking', 'Security', 'Park'],
    yearBuilt: 2022,
  }
];

export type Property = typeof propertyDatabase[0];

export function searchProperties(params: {
  location?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
}) {
  let filteredProperties = [...propertyDatabase];

  if (params.location) {
    const locationLower = params.location.toLowerCase();
    filteredProperties = filteredProperties.filter(property =>
      property.location.toLowerCase().includes(locationLower)
    );
  }

  if (params.type) {
    filteredProperties = filteredProperties.filter(property =>
      property.type === params.type
    );
  }

  if (params.minPrice || params.maxPrice) {
    filteredProperties = filteredProperties.filter(property => {
      const priceValue = parseInt(property.price.replace(/[^0-9]/g, ''));
      const priceInLakhs = property.price.includes('Cr') ? priceValue * 100 : priceValue;
      
      if (params.minPrice && priceInLakhs < params.minPrice) return false;
      if (params.maxPrice && priceInLakhs > params.maxPrice) return false;
      return true;
    });
  }

  if (params.minArea || params.maxArea) {
    filteredProperties = filteredProperties.filter(property => {
      const areaValue = parseInt(property.area.replace(/[^0-9]/g, ''));
      
      if (params.minArea && areaValue < params.minArea) return false;
      if (params.maxArea && areaValue > params.maxArea) return false;
      return true;
    });
  }

  return filteredProperties;
}