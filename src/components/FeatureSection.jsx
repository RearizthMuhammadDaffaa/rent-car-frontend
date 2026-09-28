import Title from "./Title"
import {assets} from '../assets/assets'
import CarCard from "./CarCard"
import {useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
const FeatureSection = () => {
  const navigate = useNavigate();
  const [cars,setCars] = useState([]);

  const fetchCars = async () => {
    const response =  await api.get('/vehicles');
    setCars(response.data.vehicles);
    console.log(cars)
  }

  useEffect(() => {
    fetchCars();
  },[])

  return (
    <div className='flex flex-col items-center py-24 px-6 md:px-16
    lg:px-24 xl:px-32'>
      
      <div>
        <Title title="Featured Vehicles" 
        subTitle="Explore our section of premium vehicles available for
        your next advanture" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        {
          cars.slice(0,6).map((car) => (
            <div key={car.id}>
              <CarCard  car={car}/>
            </div>
          ))
        }

      </div>

      <button onClick={() => {
        navigate('/cars'); scrollTo(0,0)
      }}
      className="flex items-center justify-center gap-2 px-6 py-2 
      border border-borderColor hover:bg-gray-50 rounded-md mt-20 cursor-pointer">
        Explore all cars <img src={assets.arrow_icon} alt="arrow" />
      </button>

    </div>
  )
}

export default FeatureSection