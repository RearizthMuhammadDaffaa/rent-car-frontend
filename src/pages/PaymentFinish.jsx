import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const statusCopy = {
  PAID: {
    title: 'Payment confirmed',
    message: 'Your payment has been confirmed. Your booking is ready.',
    style: 'bg-green-50 text-green-800',
  },
  PENDING: {
    title: 'Payment is processing',
    message: 'The payment provider has returned you to the site, but the backend has not confirmed settlement yet.',
    style: 'bg-amber-50 text-amber-800',
  },
  FAILED: {
    title: 'Payment failed',
    message: 'The payment was not completed. Check your bookings for retry options.',
    style: 'bg-red-50 text-red-800',
  },
  CANCELLED: {
    title: 'Payment cancelled',
    message: 'The payment was cancelled. Check your bookings for the latest booking status.',
    style: 'bg-gray-100 text-gray-800',
  },
  EXPIRED: {
    title: 'Payment expired',
    message: 'The payment session expired. Check your bookings for the latest status.',
    style: 'bg-gray-100 text-gray-800',
  },
}

const loadPayment = async (bookingId) => {
  const response = await api.get(`/payments/booking/${bookingId}`)
  return response.data.payment
}

const PaymentFinish = () => {
  const [searchParams] = useSearchParams()
   const bookingId = window.sessionStorage.getItem('pendingPaymentBookingId')
    || searchParams.get('order_id')?.replace(/^BOOKING-/, '')
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(Boolean(bookingId))
  const [error, setError] = useState('')

 

  const refreshStatus = useCallback(async () => {
    if (!bookingId) {
      setError('The payment return did not include a booking reference. Open My Bookings to check its status.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const currentPayment = await loadPayment(bookingId)
      setPayment(currentPayment)
      if (currentPayment?.status && currentPayment.status !== 'PENDING') {
        window.sessionStorage.removeItem('pendingPaymentBookingId')
      }
    } catch (statusError) {
      setError(statusError.response?.data?.message || 'Unable to verify payment status. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return undefined
    let active = true
    loadPayment(bookingId)
      .then((currentPayment) => {
        if (!active) return
        setPayment(currentPayment)
        if (currentPayment?.status && currentPayment.status !== 'PENDING') {
          window.sessionStorage.removeItem('pendingPaymentBookingId')
        }
      })
      .catch((statusError) => {
        if (active) setError(statusError.response?.data?.message || 'Unable to verify payment status. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [bookingId])

  const result = statusCopy[payment?.status] || {
    title: payment?.status ? 'Payment status unavailable' : 'Payment status not found',
    message: payment?.status ? `The backend returned an unrecognized status: ${payment.status}.` : 'We could not find a payment record for this booking.',
    style: 'bg-gray-100 text-gray-800',
  }

  return (
    <main className='mx-auto my-16 w-full max-w-2xl px-6 md:px-10' aria-live='polite'>
      <div className={`rounded-lg p-6 md:p-8 ${result.style}`}>
        <p className='text-sm font-medium uppercase'>Payment result</p>
        <h1 className='mt-2 text-2xl font-semibold'>{loading ? 'Checking payment status...' : result.title}</h1>
        {!loading && <p className='mt-3'>{result.message}</p>}
        {payment && <p className='mt-3 text-sm'>Booking {payment.booking_id} · {payment.amount} · {payment.status}</p>}
        {error && <p className='mt-4 rounded-md bg-white/70 p-3 text-sm' role='alert'>{error}</p>}
      </div>

      <div className='mt-6 flex flex-wrap gap-3'>
        <button type='button' onClick={refreshStatus} disabled={loading} className='rounded-md bg-primary px-5 py-2.5 font-medium text-white disabled:opacity-50'>
          {loading ? 'Checking...' : 'Refresh payment status'}
        </button>
        <Link to='/my-bookings' className='rounded-md border border-borderColor px-5 py-2.5 font-medium text-gray-700'>My bookings</Link>
      </div>
    </main>
  )
}

export default PaymentFinish