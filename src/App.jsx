import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CarDetail from "./pages/CarDetail";
import MyBookings from "./pages/MyBookings";
import Cars from "./pages/Cars";
import Footer from "./components/Footer";
import Layout from "./pages/owner/Layout";
import Dashboard from "./pages/owner/Dashboard";
import AddCar from "./pages/owner/AddCar";
import ManageCar from "./pages/owner/ManageCar";
import ManageCategories from "./pages/owner/ManageCategories";
import ManageVehicleImages from "./pages/owner/ManageVehicleImages";
import ManageCoupons from "./pages/owner/ManageCoupons";
import ManageDocuments from "./pages/owner/ManageDocuments";
import ManageBooking from "./pages/owner/ManageBooking";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Alert from "./components/Alert";
import ManageBrands from "./pages/owner/ManageBrands";

const App = () => {
  const [alert, setAlert] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const isOwnerPath = useLocation().pathname.startsWith("/owner");
  useEffect(() => {
  if (!alert) return;

  const timer = setTimeout(() => {
    setAlert(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [alert]);

  return (
    <>
     {alert && <Alert message={alert} onClose={() => setAlert(null)} />}
      {showLogin && <Login setShowLogin={setShowLogin} setAlert={setAlert}/>}

      {!isOwnerPath && <Navbar setShowLogin={setShowLogin} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/car-details/:id" element={<CarDetail />} />
        <Route path="/cars" element={<Cars />} />
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        <Route path="/owner" element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="add-car" element={<AddCar />} />
            <Route path="manage-cars" element={<ManageCar />} />
            <Route path="manage-brands" element={<ManageBrands />} />
            <Route path="manage-categories" element={<ManageCategories />} />
            <Route path="manage-vehicle-images" element={<ManageVehicleImages />} />
            <Route path="manage-coupons" element={<ManageCoupons />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER','ADMIN']} />}>
            <Route index element={<Dashboard />} />
            <Route path="manage-bookings" element={<ManageBooking />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="documents" element={<ManageBooking />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN','SUPERADMIN']} />}>
            <Route path="manage-documents" element={<ManageDocuments />} />
          </Route>
        </Route>
      </Routes>
      {!isOwnerPath && <Footer />}
    </>
  );
};

export default App;
