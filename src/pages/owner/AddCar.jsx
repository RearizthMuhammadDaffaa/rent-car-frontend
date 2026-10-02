import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { assets } from "../../assets/assets";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AddCar = () => {
  const [image, setImage] = useState(null);
  const [brands, setBrands] = useState([]);
  const [carCategories, setCarCategories] = useState([]);
  const navigate = useNavigate();
  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: 0,
    pricePerDay: 0,
    category: "",
    car_categories: "",
    status: "",
    seat: 0,
    plate_number: "",
    color: "",
    description: "",
  });

  const fetchBrands = async () => {
    const response = await api.get("/brands");
    setBrands(response.data.brands);
  };

  const fetchCarCat = async () => {
    const response = await api.get("/vehicle-cat");
    setCarCategories(response.data.vehiclesCat);
   
  };

  useEffect(() => {
    fetchBrands();
    fetchCarCat();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category_id", car.car_categories);
    formData.append("brand_id", car.brand);
    formData.append("plate_number", car.plate_number);
    formData.append("model", car.model);
    formData.append("pricePerDay", car.pricePerDay);
    formData.append("year", car.year);
    formData.append("color", car.color);
    formData.append("seat", car.seat);
    formData.append("status", car.status);
    formData.append("description", car.description);

    if (image) {
      formData.append("thumbnail", image);
    }

    try {
      await api.post("/vehicles", formData);
      navigate("/owner/manage-cars");
    } catch (error) {
      console.log(error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      console.log("MESSAGE:", error.response?.data?.message);
      console.log("ERROR:", error);
      console.log("CATEGORY:", car.category);
     console.log("BRAND:", car.brand);
    }
  };

  return (
    <div className="px-4 py-10 md:px-10 flex-1 ">
      <Title
        title="Add New Car"
        subTitle="fill in details to list a new car for booking,including pricing,avaibality and car spesification"
      />
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl"
      >
        {/* car image */}
        <div className="flex items-center gap-2 w-full">
          <label htmlFor="car-image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              alt=""
              className="h-14 rounded cursor-pointer"
            />
            <input
              type="file"
              id="car-image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <p className="text-sm text-gray-500">Upload a picture of your car</p>
        </div>

        {/* car barnd & model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col w-full">
            <label>Model</label>
            <input
              type="text"
              placeholder="e.g X5,E-cLass m4"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none "
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
            />
          </div>
        </div>

        {/* car year price category and brand */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Year</label>
            <input
              type="number"
              placeholder="2011,2012 etc"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none "
              value={car.year}
              onChange={(e) => setCar({ ...car, year: e.target.value })}
            />
          </div>

          <div className="flex flex-col w-full">
            <label>Daily Price ($)</label>
            <input
              type="number"
              placeholder="100,200"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none "
              value={car.pricePerDay}
              onChange={(e) => setCar({ ...car, pricePerDay: e.target.value })}
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Category</label>
            <select
              onChange={(e) =>
                setCar({ ...car, car_categories: e.target.value })
              }
              value={car.car_categories}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select Category</option>
              {carCategories.map((category, index) => (
                <option key={index} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-full">
            <label>Brand</label>
            <select
              onChange={(e) => setCar({ ...car, brand: e.target.value })}
              value={car.brand}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select Brand</option>
              {brands.map((brand, index) => (
                <option key={index} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* car transmission ,fuel type,seating capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Status</label>
            <select
              onChange={(e) => setCar({ ...car, status: e.target.value })}
              value={car.status}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select Status</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BOOKED">BOOKED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* <div className='flex flex-col w-full'>
                        <label >Fuel Type</label>
                        <select onChange={e => setCar({...car,fuel_type:e.target.value})} value={car.fuel_type} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
                            <option value="">Select a Fuel Type</option>
                            <option value="Gas">Gas</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                </div> */}

          <div className="flex flex-col w-full">
            <label>Seating Capacity</label>
            <input
              type="number"
              placeholder="1"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none "
              value={car.seat}
              onChange={(e) => setCar({ ...car, seat: e.target.value })}
            />
          </div>

          <div className="flex flex-col w-full">
            <label>Color</label>
            <input
              type="text"
              placeholder="blue"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none "
              value={car.color}
              onChange={(e) => setCar({ ...car, color: e.target.value })}
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Plate Number</label>
            <input
              type="text"
              placeholder="A123VBC"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none "
              value={car.plate_number}
              onChange={(e) => setCar({ ...car, plate_number: e.target.value })}
            />
          </div>
        </div>

        {/* Car Desccription */}
        <div className="flex flex-col w-full">
          <label>Description</label>
          <textarea
            rows={5}
            placeholder="lorem ipsum"
            required
            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none "
            value={car.description}
            onChange={(e) => setCar({ ...car, description: e.target.value })}
          ></textarea>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer">
          <img src={assets.tick_icon} alt="" />
          List Your Car
        </button>
      </form>
    </div>
  );
};

export default AddCar;
