import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const CarCard = ({ car, unavailable }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  return (
     <div
      onClick={() => {
        navigate(`/car-details/${car.id}`);
        scrollTo(0, 0);
      }}
      className={`group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1  
    transition-all duration-500 cursor-pointer`}
    >
      {unavailable && (
        <p className="text-red-500 text-sm font-medium mt-2">
          Not available for selected dates
        </p>
      )}
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.thumbnail}
          alt="car Image"
          className="w-full h-full object-cover transition-transform  
            duration-500 group-hover:scale-105"
        />

        {!unavailable  ? (
          <p
            className="absolute top-4 left-4 bg-primary/90
      text-white text-xs px-2.5 py-1 rounded-full"
          >
            Available Now
          </p>
        ) :  <p
            className="absolute top-4 left-4 bg-red-500
      text-white text-xs px-2.5 py-1 rounded-full"
          >
            Not Available 
          </p>}

        <div
          className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm
            text-white px-3 py-2 rounded-lg"
        >
          <span className="font-semibold">
            {currency}
            {car.pricePerDay}
          </span>
          <span className="text-sm text-white/80">/ day</span>
        </div>
      </div>

      <div className="py-4 sm:p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">
              {car.brand.name} {car.model}
            </h3>
            <p className="text-muted-foreground text-sm">
              {car.category.name} . {car.year}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-2 text-gray-600">
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.users_icon} alt="" className="h-4 mr-2" />
            <span>{car.seat} Seats</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.fuel_icon} alt="" className="h-4 mr-2" />
            <span>{car.fuel_type} Seats</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.car_icon} alt="" className="h-4 mr-2" />
            <span>Plate Number {car.plate_number}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.location_icon} alt="" className="h-4 mr-2" />
            <span>Year {car.year}</span>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default CarCard;
