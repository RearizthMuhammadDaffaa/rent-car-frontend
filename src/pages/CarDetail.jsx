import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import api from '../api/axios'
import { useAuth } from '../context/useAuth'

const getLocalDateTimeValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

const getErrorMessage = (error) => {
  const status = error.response?.status

  if (status === 401) return 'Please sign in before booking this car.'
  if (status === 403) return error.response?.data?.message || 'Your account is not allowed to book this car.'
  if (status === 404) return error.response?.data?.message || 'The car or booking could not be found.'
  if (status === 409) return error.response?.data?.message || 'This car is no longer available for those dates.'
  if (!error.response) return 'Could not reach the server. Check your connection and try again.'

  return error.response?.data?.message || 'Something went wrong. Please try again.'
}

const CarDetail = ({ setShowLogin }) => {
  const {id} = useParams()
  const navigate = useNavigate()
  const [car,setCar] = useState(null)
  const [pickupAt, setPickupAt] = useState('')
  const [returnAt, setReturnAt] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [carError, setCarError] = useState('')
  const [createdBooking, setCreatedBooking] = useState(null)
  const currency = import.meta.env.VITE_CURRENCY
  const {user} = useAuth()
  const minDateTime = getLocalDateTimeValue(new Date())
  const pickupDate = pickupAt ? new Date(pickupAt) : null
  const returnDate = returnAt ? new Date(returnAt) : null
  const rentalDays = pickupDate && returnDate && returnDate > pickupDate
    ? Math.max(1, Math.ceil((returnDate - pickupDate) / 86400000))
    : 0
  const previewSubtotal = rentalDays * Number(car?.pricePerDay || 0)

  const startPayment = async (bookingId) => {
    const response = await api.post('/payments', { booking_id: bookingId })
    const payment = response.data.data

    if (!payment?.redirect_url) {
      throw new Error('The payment provider did not return a redirect URL.')
    }

    window.sessionStorage.setItem('pendingPaymentBookingId', bookingId)
    window.location.assign(payment.redirect_url)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBookingError('')
    setPaymentError('')

    if (!user) {
      setBookingError('Please sign in before booking this car.')
      setShowLogin?.(true)
      return
    }

    if (!pickupAt || !returnAt) {
      setBookingError('Choose both pickup and return date and time.')
      return
    }

    const pickup = new Date(pickupAt)
    const returnTime = new Date(returnAt)
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(returnTime.getTime()) || pickup <= new Date()) {
      setBookingError('Choose a valid pickup date and time in the future.')
      return
    }
    if (returnTime <= pickup) {
      setBookingError('Return date and time must be after pickup.')
      return
    }

    setSubmitting(true)
    try {
      const documentResponse = await api.get('/documents/me')
      if (documentResponse.data.data?.status !== 'APPROVED') {
        setBookingError('Your KTP and SIM documents must be approved before booking.')
        return
      }

      const bookingResponse = await api.post('/bookings', {
        car_id: id,
        pickup_at: pickup.toISOString(),
        return_at: returnTime.toISOString(),
        ...(couponCode.trim() && { coupon_code: couponCode.trim().toUpperCase() }),
      })
      const booking = bookingResponse.data.data
      setCreatedBooking(booking)
    } catch (error) {
      if (error.response?.config?.url?.includes('/documents/me') && error.response.status === 404) {
        setBookingError('Upload your KTP and SIM, then wait for approval before booking.')
      } else {
        setBookingError(getErrorMessage(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentRetry = async () => {
    if (!createdBooking?.id || submitting) return
    setSubmitting(true)
    setPaymentError('')
    try {
      await startPayment(createdBooking.id)
    } catch (error) {
      setPaymentError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    let active = true
    api.get(`/vehicles/${id}`)
      .then((response) => {
        if (active) setCar(response.data.vehicle)
      })
      .catch(() => {
        if (active) setCarError('Unable to load this car. Please try again later.')
      })

    return () => {
      active = false
    }
  }, [id])

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
                  <h1 className='text-3xl font-bold'>{car.brand?.name || car.brand} {car.model} </h1>
                  <p>{car.category?.name || car.category} . {car.year}</p>
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
            <form onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-5 text-gray-500'>
                  <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
                    {currency}{car.pricePerDay} <span className='text-base text-gray-400 font-normal '> Per Day</span> 

                  </p>
                    <hr className='border-borderColor my-6' />
                    <div className='flex flex-col gap-2'>
                      <label htmlFor="pickup-date">Pickup Date</label>
                      <input type="datetime-local" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={minDateTime} value={pickupAt} onChange={(event) => {
                        const nextPickup = event.target.value
                        setPickupAt(nextPickup)
                        if (returnAt && new Date(returnAt) <= new Date(nextPickup)) setReturnAt('')
                      }} />
                    </div>
                    <div className='flex flex-col gap-2'>
                      <label htmlFor="return-date">Return Date</label>
                      <input type="datetime-local" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date' min={pickupAt || minDateTime} value={returnAt} onChange={(event) => setReturnAt(event.target.value)} />
                    </div>

                    <div className='flex flex-col gap-2'>
                      <label htmlFor="coupon-code">Coupon code <span className='text-gray-400'>(optional)</span></label>
                      <input type="text" id="coupon-code" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter code" className='border border-borderColor px-3 py-2 rounded-lg uppercase' maxLength={40} />
                    </div>

                    {rentalDays > 0 && (
                      <div className='rounded-lg bg-light p-4 space-y-2 text-sm'>
                        <p className='flex justify-between'><span>Rental duration</span><span>{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span></p>
                        <p className='flex justify-between'><span>Estimated subtotal</span><span>{currency}{previewSubtotal.toFixed(2)}</span></p>
                        <p className='text-xs text-gray-500'>Final tax, discount, and total are calculated by the server.</p>
                      </div>
                    )}

                    {createdBooking && (
                      <div className='rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-gray-700' role="status">
                        <p className='font-medium text-green-700'>Booking created</p>
                        <div className='mt-2 space-y-1'>
                          <p className='flex justify-between'><span>Subtotal</span><span>{currency}{Number(createdBooking.subtotal || 0).toFixed(2)}</span></p>
                          <p className='flex justify-between'><span>Tax</span><span>{currency}{Number(createdBooking.tax || 0).toFixed(2)}</span></p>
                          <p className='flex justify-between'><span>Discount</span><span>-{currency}{Number(createdBooking.discount || 0).toFixed(2)}</span></p>
                          <p className='flex justify-between font-semibold text-gray-800'><span>Grand total</span><span>{currency}{Number(createdBooking.grandTotal || 0).toFixed(2)}</span></p>
                        </div>
                        <p>{createdBooking.total_days} rental days · Booking #{createdBooking.id}</p>
                      </div>
                    )}

                    {bookingError && (
                      <div className='rounded-lg bg-red-50 p-3 text-sm text-red-700' role="alert">
                        <p>{bookingError}</p>
                        {bookingError.includes('documents') || bookingError.includes('KTP') ? (
                          <Link to="/owner/documents" className='mt-1 inline-block font-medium underline'>Open document verification</Link>
                        ) : null}
                      </div>
                    )}
                    {paymentError && (
                      <div className='rounded-lg bg-red-50 p-3 text-sm text-red-700' role="alert">
                        <p>Booking saved, but payment could not start: {paymentError}</p>
                        <Link to="/my-bookings" className='mt-1 inline-block font-medium underline'>View your booking</Link>
                      </div>
                    )}

                    {createdBooking ? (
                      <button type="button" onClick={handlePaymentRetry} disabled={submitting} className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer disabled:opacity-60'>
                        {submitting ? 'Starting payment...' : paymentError ? 'Retry payment' : 'Continue to payment'}
                      </button>
                    ) : (
                      <button type="submit" disabled={submitting} className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer disabled:opacity-60'>
                        {submitting ? 'Creating booking...' : 'Create booking'}
                      </button>
                    )}
                    
                    {!user && <p className='text-center text-sm'>Sign in is required to book this car.</p>}

            </form>
          </div>

    </div>
  ) : carError ? (
    <div className='mx-auto mt-16 max-w-3xl px-6 text-center text-red-700' role='alert'>{carError}</div>
  ) : <Loader />
}

export default CarDetail