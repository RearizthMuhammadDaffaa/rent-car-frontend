import  { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import api from '../api/axios'
const Cars = () => {
  const [input,setInput] = useState('')
  const [cars,setCars] = useState([]);
  
    const fetchCars = async () => {
      const response =  await api.get('/vehicles');
      setCars(response.data.vehicles.vehicles);
  
    }
  
    useEffect(() => {
      fetchCars();
    },[])
  return (
    <div>

      <div className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title title="Available Cars" subTitle='Browse our selection of premium vehicles for your next adventure' />

        <div className='flex items-center bg-white px-4 mt-6 max-w-[560px] w-full h-12 rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-[18px] h-[18px] mr-2' />
          <input onClick={(e) => setInput(e.target.value)}  value={input} type="text" placeholder='Search by make, mode, or features' className='w-full h-full outline-none text-gray-500' />
          <img src={assets.filter_icon} alt="" className='w-[18px] h-[18px] ml-2' />
        </div>
      </div>

      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 maz-w-7xl max-auto'>Showing {cars.length} Cars </p> 

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {cars.map((car) => (
            <div key={car.id}>
              <CarCard car={car} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Cars