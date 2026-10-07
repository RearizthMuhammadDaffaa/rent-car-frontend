import { useCallback, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import api from '../api/axios'
import { Link } from 'react-router-dom'

const formatDateTime = (value) => {
  if (!value) return 'Not provided'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleString()
}

const getErrorMessage = (error) => {
  if (!error.response) return 'Could not reach the server. Check your connection and try again.'
  return error.response.data?.message || 'Unable to load your bookings. Please try again.'
}

const loadBookings = async () => {
  const response = await api.get('/bookings')
  const bookingList = Array.isArray(response.data.booking) ? response.data.booking : []
  const paymentEntries = await Promise.all(bookingList.map(async (booking) => {
    try {
      const paymentResponse = await api.get(`/payments/booking/${booking.id}`)
      return [booking.id, paymentResponse.data.payment]
    } catch {
      return [booking.id, null]
    }
  }))

  return { bookingList, paymentEntries }
}

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyBookingId, setBusyBookingId] = useState(null)
  const currency = import.meta.env.VITE_CURRENCY

  const fetchMyBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { bookingList, paymentEntries } = await loadBookings()
      setBookings(bookingList)
      setPayments(Object.fromEntries(paymentEntries))
    } catch (fetchError) {
      setError(getErrorMessage(fetchError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    loadBookings()
      .then(({ bookingList, paymentEntries }) => {
        if (!active) return
        setBookings(bookingList)
        setPayments(Object.fromEntries(paymentEntries))
      })
      .catch((fetchError) => {
        if (active) setError(getErrorMessage(fetchError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handlePayAgain = async (bookingId) => {
    if (busyBookingId) return
    setBusyBookingId(bookingId)
    setError('')
    try {
      const response = await api.post('/payments', { booking_id: bookingId })
      const payment = response.data.data
      if (!payment?.redirect_url) throw new Error('Payment redirect URL is missing.')
      window.sessionStorage.setItem('pendingPaymentBookingId', bookingId)
      window.location.assign(payment.redirect_url)
    } catch (paymentError) {
      setError(getErrorMessage(paymentError))
    } finally {
      setBusyBookingId(null)
    }
  }

  const handleCancel = async (bookingId) => {
    if (busyBookingId || !window.confirm('Cancel this pending booking?')) return
    setBusyBookingId(bookingId)
    setError('')
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      await fetchMyBookings()
    } catch (cancelError) {
      setError(getErrorMessage(cancelError))
    } finally {
      setBusyBookingId(null)
    }
  }

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 mb-16 text-sm max-w-7xl'>
      <div className='flex items-end justify-between gap-4'>
        <Title title='My Bookings' subTitle='View and manage your car bookings' align='left' />
        <button type='button' onClick={fetchMyBookings} disabled={loading} className='mb-1 rounded-md border border-borderColor px-3 py-2 text-gray-600 hover:bg-light disabled:opacity-50'>
          {loading ? 'Refreshing...' : 'Refresh status'}
        </button>
      </div>

      {error && <p className='mt-6 rounded-lg bg-red-50 p-4 text-red-700' role='alert'>{error}</p>}
      {loading && bookings.length === 0 && <p className='mt-8 text-gray-500'>Loading bookings...</p>}
      {!loading && !error && bookings.length === 0 && (
        <div className='mt-8 rounded-lg border border-borderColor p-8 text-center'>
          <p className='text-lg font-medium text-gray-800'>No bookings yet</p>
          <p className='mt-2 text-gray-500'>Your reservations will appear here.</p>
          <Link to='/cars' className='mt-4 inline-block rounded-md bg-primary px-5 py-2 text-white'>Browse cars</Link>
        </div>
      )}

      <div className='space-y-5 mt-8'>
        {bookings.map((booking) => {
          const payment = payments[booking.id]
          const canPay = booking.status === 'PENDING' && payment?.status !== 'PAID'
          const car = booking.car || {}
          const bookingStatusClass = booking.status === 'CONFIRMED'
            ? 'bg-green-100 text-green-700'
            : booking.status === 'PENDING'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600'

          return (
            <article key={booking.id} className='grid grid-cols-1 gap-6 rounded-lg border border-borderColor p-5 md:grid-cols-4 md:p-6'>
              <div className='md:col-span-1'>
                <div className='mb-3 overflow-hidden rounded-md bg-light'>
                  <img src={car.thumbnail || assets.car_image1} alt={`${car.brand?.name || ''} ${car.model || 'Rental car'}`} className='aspect-video h-auto w-full object-cover' />
                </div>
                <p className='text-lg font-medium text-gray-800'>{car.brand?.name || car.brand || ''} {car.model || 'Car'}</p>
                <p className='text-gray-500'>{[car.year, car.category?.name || car.category, car.color].filter(Boolean).join(' · ')}</p>
              </div>

              <div className='space-y-4 md:col-span-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='rounded bg-light px-3 py-1.5'>Booking {booking.id}</p>
                  <span className={`rounded-full px-3 py-1 text-xs ${bookingStatusClass}`}>{booking.status}</span>
                  <span className={`rounded-full px-3 py-1 text-xs ${payment?.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    Payment {payment?.status || 'NOT STARTED'}
                  </span>
                </div>

                <div className='flex items-start gap-2'>
                  <img src={assets.calendar_icon_colored} alt='' className='mt-1 h-4 w-4' />
                  <div>
                    <p className='text-gray-500'>Rental period</p>
                    <p>{formatDateTime(booking.pickup_at)} to {formatDateTime(booking.return_at)}</p>
                    <p className='mt-1 text-gray-500'>{booking.total_days} {booking.total_days === 1 ? 'day' : 'days'} at {currency}{Number(booking.pricePerDay || 0).toFixed(2)} per day</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-gray-500 sm:grid-cols-3'>
                  <p>Subtotal <span className='block text-gray-800'>{currency}{Number(booking.subtotal || 0).toFixed(2)}</span></p>
                  <p>Tax <span className='block text-gray-800'>{currency}{Number(booking.tax || 0).toFixed(2)}</span></p>
                  <p>Discount <span className='block text-gray-800'>-{currency}{Number(booking.discount || 0).toFixed(2)}</span></p>
                </div>
              </div>

              <div className='flex flex-col justify-between gap-4 md:col-span-1'>
                <div className='text-gray-500'>
                  <p className='text-sm'>Grand total</p>
                  <p className='text-2xl font-semibold text-primary'>{currency}{Number(booking.grandTotal || 0).toFixed(2)}</p>
                  <p className='mt-2'>Booked {formatDateTime(booking.createdAt)}</p>
                  {payment?.payment_type && <p className='mt-1'>Method: {payment.payment_type}</p>}
                </div>
                <div className='flex flex-wrap gap-2'>
                  {canPay && (
                    <button type='button' onClick={() => handlePayAgain(booking.id)} disabled={Boolean(busyBookingId)} className='rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-50'>
                      {busyBookingId === booking.id ? 'Starting payment...' : 'Pay now'}
                    </button>
                  )}
                  {booking.status === 'PENDING' && (
                    <button type='button' onClick={() => handleCancel(booking.id)} disabled={Boolean(busyBookingId)} className='rounded-md border border-borderColor px-4 py-2 text-gray-600 disabled:opacity-50'>
                      Cancel booking
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default MyBookings