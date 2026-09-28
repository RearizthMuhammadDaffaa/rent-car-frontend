import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyCarData } from '../assets/assets'
import Loader from '../components/Loader'
import api from '../api/axios'

const CarDetail = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const [car,setCar] = useState(null)
  const currency = import.meta.env.VITE_CURRENCY

  
    const fetchCar = async () => {
       try {
    const response = await api.get(`/vehicles/${id}`);

    console.log("Vehicle response:", response.data);

    setCar(response.data.vehicle);
  } catch (error) {
    console.error("Failed to fetch vehicle:", error);
  }
    }
  
 

  const handleSubmit = async (e) => {
    e.preventDefault();
  }

  useEffect(() => {
    fetchCar()
  },[id])
  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
        <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
          <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
          Back to all cars
          </button>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
            {/* Left:car Image & Details */}
            <div className='lg:col-span-2'>
              <img src={car.thumbnail} alt="" className='w-full h-auto md:max-h-[400px] object-cover rounded-xl mb-6 shadow-md' /> 
              <div className='space-y-6'>
                <div>
                  <h1 className='text-3xl font-bold'>{car.brand} {car.model} </h1>
                  <p>{car.category} . {car.year}</p>
                </div>
                <hr className='border-borderColor my-6' />

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  {[
                    {icon: assets.users_icon,text: `${car.seat} Seats`
                    },
                    {icon: assets.fuel_icon,text: car.plate_number
                    },
                    {icon: assets.car_icon,text: car.model
                    },
                    {icon: assets.location_icon,text: car.color
                    },
                  ].map(({icon,text})=> (
                    <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                        <img src={icon} alt="" className='h-5 mb-5' />
                        {text}
                    </div>
                  ))}

                </div>
                  
                {/* Description */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Description</h1>
                  <p className='text-gray-500'>{car.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h1 className='text-xl font-medium mb-3'>Description</h1>
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {
                      ["360 Camera" , "Bluetooth","GPS","Heated Seats","Rear View Mirror"].map((item) => (
                        <li className='flex item-center text-gray-500' key={item}>
                          <img src={assets.check_icon} alt="" className='h-4 mr-2' />
                          {item}
                        </li>
                      ))
                    }
                  </ul>
                </div>

              </div>
            </div>

            {/* Right:Booking Form */}
            <form onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>
                  <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
                    {currency}{car.pricePerDay} <span className='text-base text-gray-400 font-normal '> Per Day</span> 

                  </p>
                    <hr className='border-borderColor my-6' />
                    <div className='flex flex-col gap-2'>
                      <label htmlFor="pickup-date">Pickup Date</label>
                      <input type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className='flex flex-col gap-2'>
                      <label htmlFor="return-date">Return Date</label>
                      <input type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date'  />
                    </div>

                    <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>Book Now</button>
                    
                    <p className='text-center text-sm'>No Credit card required to reserved</p>

            </form>
          </div>

    </div>
  ) : <Loader />
}

export default CarDetail