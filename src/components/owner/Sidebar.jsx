import  { useState } from 'react'
import { assets, dummyUserData, ownerMenuLinks ,userMenuLinks } from '../../assets/assets'
import { NavLink, useLocation } from 'react-router-dom'
import {useAuth} from "../../context/useAuth"

const Sidebar = () => {

    const user1 = dummyUserData
    const location = useLocation()
    const [image,setImage] = useState('')
    const {user} = useAuth()

    const updateImage = async () => {
        user1.image = URL.createObjectURL(image)
        setImage('')
    }

  return (
    <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-12 md:max-w-60 w-full border-r border-borderColor text-sm'>
        <div className='group relative'>
            <label htmlFor="image">
                <img className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto' src={image ? URL.createObjectURL(image) : user1?.image || "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="} alt="" />
                <input type="file" id='image' accept='image/*' hidden onChange={e => setImage(e.target.files[0])} />

                <div className='absolute hidden top-0 right-0 left-0 bottom-0 bg-black/10 rounded-full group-hover:flex items-center justify-center cursor-pointer'>
                    <img src={assets.edit_icon} alt="" />
                </div>
            </label>
        </div>
        {image && (
            <button className='absolute top-0 right-0 flex p-2 gap-1 bg-primary/10 text-primary cursor-pointer'>Save <img src={assets.check_icon} width={13} onClick={updateImage}  alt="" /></button>
        )}
        <p className='mt-2 text-base max-md:hidden'>Owner</p>

        <div className='w-full'>
            {user.role === "ADMIN" ? ownerMenuLinks.map((link,index) => (
                <NavLink key={index} to={link.path} className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${link.path === location.pathname ? 'bg-primary/10 text-primary': 'text-gray-600'}`}>
                    <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt="car icon" />
                    <span className='max-md:hidden'>{link.name}</span>
                    <div className={`${link.path === location.pathname && 'bg-primary'} w-1.5 h-8 rounded-l right-0 absolute`}>

                    </div>
                </NavLink>
            )):userMenuLinks.map((link,index) => (
                <NavLink key={index} to={link.path} className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${link.path === location.pathname ? 'bg-primary/10 text-primary': 'text-gray-600'}`}>
                    <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt="car icon" />
                    <span className='max-md:hidden'>{link.name}</span>
                    <div className={`${link.path === location.pathname && 'bg-primary'} w-1.5 h-8 rounded-l right-0 absolute`}>

                    </div>
                </NavLink>
            ))}
        </div>
    </div>
  )
}

export default Sidebar