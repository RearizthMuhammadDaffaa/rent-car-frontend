import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { assets } from "../../assets/assets";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const VerifyDocuments = () => {
  const [imageSIM, setImageSIM] = useState(null);
  const [imageKTP, setImageKTP] = useState(null);
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
    const response = await api.get("/documents/me");
    // setCarCategories(response.data.vehiclesCat);
    console.log(response.data)
   
  };

  useEffect(() => {
    fetchBrands();
    fetchCarCat();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
   

    if (imageKTP && imageSIM) {
      formData.append("ktp", imageKTP);
      formData.append("sim", imageSIM);
    }

    try {
      await api.post("/documents/me", formData);
      navigate("/owner/documents");
    } catch (error) {
      console.log(error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      console.log("MESSAGE:", error.response?.data?.message);
      console.log("ERROR:", error);
      // console.log("CATEGORY:", car.category);
    //  console.log("BRAND:", car.brand);
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

        <div className="grid grid-cols-1 sm:grid-cols-2  gap-6 w-full">
              {/* car image */}
        <div className="flex items-center gap-2 w-full">
          <label htmlFor="ktp-image">
            <img
              src={imageKTP ? URL.createObjectURL(imageKTP) : assets.upload_icon}
              alt=""
              className="h-14 rounded cursor-pointer"
            />
            <input
              type="file"
              id="ktp-image"
              accept="image/*"
              hidden
              onChange={(e) => setImageKTP(e.target.files[0])}
            />
          </label>
          <p className="text-sm text-gray-500">Upload a picture of your KTP</p>
        </div>

         {/* car image */}
        <div className="flex items-center gap-2 w-full">
          <label htmlFor="sim-image">
            <img
              src={imageSIM ? URL.createObjectURL(imageSIM) : assets.upload_icon}
              alt=""
              className="h-14 rounded cursor-pointer"
            />
            <input
              type="file"
              id="sim-image"
              accept="image/*"
              hidden
              onChange={(e) => setImageSIM(e.target.files[0])}
            />
          </label>
          <p className="text-sm text-gray-500">Upload a picture of your SIM</p>
        </div>

        </div>
      
      

        <button className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer">
          <img src={assets.tick_icon} alt="" />
          Save
        </button>
      </form>
    </div>
  );
};

export default VerifyDocuments;
