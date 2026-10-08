import { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CarCard from "../components/CarCard";
import api from "../api/axios";
import Pagination from "../components/Pagination";

const Cars = () => {
  const [input, setInput] = useState("");

  const [pickupAt, setPickupAt] = useState("");
  const [returnAt, setReturnAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  const [cars, setCars] = useState([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPage: 1,
  });

  const fetchCars = async (
    requestedPage = page,
    isActive = () => true
  ) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/vehicles", {
        params: {
          page: requestedPage,
          limit: 12,
        },
      });

      if (!isActive()) return;

      const result = response.data.vehicles;

      setCars(result?.vehicles || []);

      setPagination(
        result?.pagination || {
          page: 1,
          totalPage: 1,
        }
      );
    } catch (requestError) {
      if (isActive()) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Failed to load cars"
        );
      }
    } finally {
      if (isActive()) {
        setLoading(false);
      }
    }
  };

  const fetchAvailability = async (isActive = () => true) => {
    if (!pickupAt || !returnAt) {
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityError("");

    try {
      const response = await api.get(
        "/vehicles/availability",
        {
          params: {
            pickup_at: pickupAt,
            return_at: returnAt,
          },
        }
      );

      if (!isActive()) return;

      const unavailableIds =
        new Set(response.data.unavailableVehicleIds || []);

      setCars((currentCars) =>
        currentCars.map((car) => ({
          ...car,
          availableForBooking: !unavailableIds.has(car.id),
        }))
      );
    } catch (requestError) {
      if (isActive()) {
        setAvailabilityError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Failed to check vehicle availability"
        );
      }
    } finally {
      if (isActive()) {
        setAvailabilityLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    fetchCars(page, () => active);

    return () => {
      active = false;
    };
  }, [page]);

  useEffect(() => {
    let active = true;

    if (pickupAt && returnAt) {
      fetchAvailability(() => active);
    }

    return () => {
      active = false;
    };
  }, [pickupAt, returnAt]);

  return (
    <div>
      <div className="flex flex-col items-center py-20 bg-light max-md:px-4">
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles for your next adventure"
        />

        {/* Search */}
        <div className="flex items-center bg-white px-4 mt-6 max-w-[560px] w-full h-12 rounded-full shadow">
          <img
            src={assets.search_icon}
            alt=""
            className="w-[18px] h-[18px] mr-2"
          />

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Search by make, model, or features"
            className="w-full h-full outline-none text-gray-500"
          />

          <img
            src={assets.filter_icon}
            alt=""
            className="w-[18px] h-[18px] ml-2"
          />
        </div>

        {/* Date Selection */}
        <div className="flex gap-4 mt-5 max-w-[560px] w-full max-md:flex-col">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Pickup
            </label>

            <input
              type="datetime-local"
              value={pickupAt}
              onChange={(e) => {
                setPickupAt(e.target.value);
                setPage(1);
              }}
              className="w-full h-12 px-4 bg-white rounded-lg shadow outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Return
            </label>

            <input
              type="datetime-local"
              value={returnAt}
              onChange={(e) => {
                setReturnAt(e.target.value);
                setPage(1);
              }}
              className="w-full h-12 px-4 bg-white rounded-lg shadow outline-none"
            />
          </div>
        </div>

        {/* Validation */}
        {pickupAt &&
          returnAt &&
          new Date(pickupAt) >= new Date(returnAt) && (
            <p className="text-red-500 text-sm mt-3">
              Return date must be after pickup date.
            </p>
          )}
      </div>

      <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10">
        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        {availabilityError && (
          <p className="text-red-500 mb-4">
            {availabilityError}
          </p>
        )}

        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
          Showing {cars.length} Cars
        </p>

        {availabilityLoading && (
          <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto mt-2">
            Checking vehicle availability...
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto">
          {loading ? (
            <p>Loading cars...</p>
          ) : (
            cars.map((car) => (
              <div key={car.id}>
                <CarCard
                  car={car}
                  unavailable={
                    pickupAt &&
                    returnAt &&
                    new Date(pickupAt) < new Date(returnAt) &&
                    car.availableForBooking === false
                  }
                />
              </div>
            ))
          )}
        </div>

        {pagination.totalPage > 0 && (
          <Pagination
            page={page}
            setPage={setPage}
            totalPage={pagination.totalPage}
          />
        )}
      </div>
    </div>
  );
};

export default Cars;