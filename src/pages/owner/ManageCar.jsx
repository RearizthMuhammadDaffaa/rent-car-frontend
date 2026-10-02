import  { useState ,useEffect} from 'react'
import {assets} from "../../assets/assets"
import Title from "../../components/owner/Title"
import api from '../../api/axios'



const ManageCar = () => {
  const [cars,setCars] = useState([])

const fetchCars = async () => {
    const response =  await api.get('/vehicles');
    setCars(response.data.vehicles);
   
  }

  useEffect(() => {
    fetchCars();
  },[])


  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
        <Title title="Manage Cars" subTitle={'View all listed cars,update their details or remove them the booking platform'} />

        <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
          <table className='w-full border-collapse text-left text-sm text-gray-600'>

            <thead className='text-gray-500'>
              <tr>
                <th className='p-3 font-medium'>Car</th>
                <th className='p-3 font-medium max-md:hidden'>Category</th>
                <th className='p-3 font-medium'>Price</th>
                <th className='p-3 font-medium'>Status</th>
                <th className='p-3 font-medium'>Actions</th>
              </tr>
            </thead>

            <tbody>
              {cars.map((car,index) => (
                <tr key={index}className='border-t border-borderColor' >
                  <td className='p-3 flex items-center gap-3'>
                    <img src={car.thumbnail} alt="" className='h-12 w-12 aspect-square rounded-md object-cover' />
                    <div className='max-md:hidden'>
                      <p className='font-medium'>{car.brand.name} {car.model}</p>
                      {/* <p className='text-xs text-gray-500'>{car.seat} & {car.transmission}</p> */}
                    </div>
                  </td>

                  <td className='p-3 max-md:hidden'>
                    {car.category_id}
                  </td>
                  <td className='p-3'>
                    ${car.pricePerDay}/day
                  </td>

                  <td className='p-3 '>
                    <span className={`px-3 py-1 rounded-full text-xs ${car.status === "AVAILABLE" ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                      {car.status === "AVAILABLE" ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  <td className='flex items-center p-3'>
                    <img src={car.status === "AVAILABLE" ? assets.eye_close_icon : assets.eye_icon} alt="" className='cursor-pointer' />
                    <img src={assets.delete_icon} alt="" className='cursor-pointer' />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )
}

export default ManageCar