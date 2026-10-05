import  { useEffect, useState } from 'react'
import { dummyMyBookingsData } from '../../assets/assets'
import Title from '../../components/owner/Title'
import api from '../../api/axios'

const StatusDocuments = () => {
  const [bookings,setBookings] = useState([])
  const [statusDocuments,setStatusDocuments] = useState(null)

const fetchStatusDocuments = async () => {
    const response = await api.get("/documents/me");
    // setCarCategories(response.data.vehiclesCat);
    setStatusDocuments(response.data.data)
    console.log(response.data)
   
  };
  useEffect(() => {
    fetchStatusDocuments()
  },[])
  return (
   <div className='px-4 pt-10 md:px-10 w-full'>
        <Title title="Status Documents" subTitle={'Check your documents status'} />

        <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
          <table className='w-full border-collapse text-left text-sm text-gray-600'>

            <thead className='text-gray-500'>
              <tr>
                <th className='p-3 font-medium'>Status</th>
                
              </tr>
            </thead>

            <tbody>
              {statusDocuments ? ( <tr className='border-t border-borderColor text-gray-500' >
                  
                  <td className='p-3 flex items-center gap-3'>
                    
                    <p className='font-medium max-md:hidden text-green-500'>{statusDocuments.status}</p>
                  </td>

                 

                </tr>):(<td><p className='font-medium max-md:hidden px-2 py-3 text-red-500'>belum Ada</p></td>)}
            </tbody>
          </table>
        </div>
    </div>
  )
}

export default StatusDocuments