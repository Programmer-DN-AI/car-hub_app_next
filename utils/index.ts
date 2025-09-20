import { CarProps, FilterProps } from "@/types";

export async function fetchCars(filters: FilterProps) {
  const { manufacturer, year, model, limit, fuel } = filters;

  try {
    // Try to use NHTSA API first (completely free, no key needed)
    if (manufacturer && model) {
      const nhtsaResponse = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${manufacturer}?format=json`
      );
      
      if (nhtsaResponse.ok) {
        const nhtsaData = await nhtsaResponse.json();
        // Transform NHTSA data to match our CarProps interface
        const cars = nhtsaData.Results?.slice(0, limit || 10).map((vehicle: any, index: number) => ({
          make: vehicle.Make_Name,
          model: vehicle.Model_Name,
          year: year || 2022,
          city_mpg: Math.floor(Math.random() * 30) + 15, // Mock data
          highway_mpg: Math.floor(Math.random() * 40) + 20, // Mock data
          combination_mpg: Math.floor(Math.random() * 35) + 18, // Mock data
          cylinders: [4, 6, 8][Math.floor(Math.random() * 3)], // Mock data
          displacement: Math.floor(Math.random() * 3) + 2, // Mock data
          drive: ['FWD', 'RWD', 'AWD'][Math.floor(Math.random() * 3)], // Mock data
          fuel_type: fuel || 'gas', // Mock data
          transmission: ['Manual', 'Automatic'][Math.floor(Math.random() * 2)], // Mock data
          class: ['SUV', 'Sedan', 'Hatchback', 'Coupe'][Math.floor(Math.random() * 4)] // Mock data
        }));
        
        if (cars && cars.length > 0) {
          return cars;
        }
      }
    }

    // Fallback to mock data if APIs fail
    return generateMockCars(filters);
    
  } catch (error) {
    console.error('Error fetching cars:', error);
    // Return mock data as fallback
    return generateMockCars(filters);
  }
}

// Mock data generator for development
function generateMockCars(filters: FilterProps) {
  const { manufacturer, year, model, limit } = filters;
  
  const mockCars = [
    {
      make: manufacturer || "Toyota",
      model: model || "Camry",
      year: year || 2022,
      city_mpg: 28,
      highway_mpg: 39,
      combination_mpg: 32,
      cylinders: 4,
      displacement: 2.5,
      drive: "FWD",
      fuel_type: "gas",
      transmission: "Automatic",
      class: "Sedan"
    },
    {
      make: manufacturer || "Honda",
      model: model || "Civic",
      year: year || 2022,
      city_mpg: 31,
      highway_mpg: 40,
      combination_mpg: 35,
      cylinders: 4,
      displacement: 2.0,
      drive: "FWD",
      fuel_type: "gas",
      transmission: "CVT",
      class: "Sedan"
    },
    {
      make: manufacturer || "Ford",
      model: model || "F-150",
      year: year || 2022,
      city_mpg: 20,
      highway_mpg: 24,
      combination_mpg: 22,
      cylinders: 6,
      displacement: 3.5,
      drive: "4WD",
      fuel_type: "gas",
      transmission: "Automatic",
      class: "Pickup"
    },
    {
      make: manufacturer || "BMW",
      model: model || "X5",
      year: year || 2022,
      city_mpg: 21,
      highway_mpg: 26,
      combination_mpg: 23,
      cylinders: 6,
      displacement: 3.0,
      drive: "AWD",
      fuel_type: "gas",
      transmission: "Automatic",
      class: "SUV"
    },
    {
      make: manufacturer || "Tesla",
      model: model || "Model 3",
      year: year || 2022,
      city_mpg: 134, // MPGe
      highway_mpg: 126, // MPGe
      combination_mpg: 130, // MPGe
      cylinders: 0,
      displacement: 0,
      drive: "RWD",
      fuel_type: "electric",
      transmission: "Automatic",
      class: "Sedan"
    }
  ];

  return mockCars.slice(0, limit || 10);
}

export const calculateCarRent = (city_mpg: number, year: number) => {
  const basePricePerDay = 50; // Base rental price per day in dollars
  const mileageFactor = 0.1; // Additional rate per mile driven
  const ageFactor = 0.05; // Additional rate per year of vehicle age

  // Calculate additional rate based on mileage and age
  const mileageRate = city_mpg * mileageFactor;
  const ageRate = (new Date().getFullYear() - year) * ageFactor;

  // Calculate total rental rate per day
  const rentalRatePerDay = basePricePerDay + mileageRate + ageRate;

  return rentalRatePerDay.toFixed(0);
};

export const generateCarImageUrl = (car: CarProps, angle?: string) => {
  const { make, model, year } = car;
  
  // Use Unsplash API for free car images
  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  
  if (unsplashKey) {
    // Create search query for the car
    const searchQuery = `${make} ${model} ${year} car`;
    const url = new URL("https://api.unsplash.com/search/photos");
    
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("client_id", unsplashKey);
    url.searchParams.append("per_page", "1");
    url.searchParams.append("orientation", "landscape");
    
    return url.toString();
  }
  
  // Fallback to placeholder images if no Unsplash key
  return `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center&auto=format&q=80`;
};

// New function to fetch car image from Unsplash
export const fetchCarImage = async (car: CarProps) => {
  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  
  if (!unsplashKey) {
    // Return placeholder if no API key
    return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center&auto=format&q=80";
  }
  
  try {
    const searchQuery = `${car.make} ${car.model} ${car.year} car`;
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&client_id=${unsplashKey}&per_page=1&orientation=landscape`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
    }
  } catch (error) {
    console.error('Error fetching car image:', error);
  }
  
  // Fallback to placeholder
  return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center&auto=format&q=80";
};

export const updateSearchParams = (type: string, value: string) => {
  // Get the current URL search params
  const searchParams = new URLSearchParams(window.location.search);

  // Set the specified search parameter to the given value
  searchParams.set(type, value);

  // Set the specified search parameter to the given value
  const newPathname = `${window.location.pathname}?${searchParams.toString()}`;

  return newPathname;
};

export const deleteSearchParams = (type: string) => {
  // Set the specified search parameter to the given value
  const newSearchParams = new URLSearchParams(window.location.search);

  // Delete the specified search parameter
  newSearchParams.delete(type.toLocaleLowerCase());

  // Construct the updated URL pathname with the deleted search parameter
  const newPathname = `${
    window.location.pathname
  }?${newSearchParams.toString()}`;

  return newPathname;
};
