import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import api from "../../api/axios";
import Pagination from "../../components/Pagination";

const inputClass = "w-full rounded-md border border-borderColor px-3 py-2 outline-none";
const statuses = ["AVAILABLE", "BOOKED", "MAINTENANCE", "INACTIVE"];

const getErrorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

const ManageCar = () => {
  const limit = 5;
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingCar, setEditingCar] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [deleting, setDeleting] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPage: 1 });

  const fetchCars = async (requestedPage = page, isActive = () => true) => {
    setLoading(true);
    setError("");
    try {
      const [vehiclesResponse, brandsResponse, categoriesResponse] = await Promise.all([
        api.get("/vehicles", { params: { page: requestedPage, limit } }),
        api.get("/brands", { params: { page: 1, limit: 100 } }),
        api.get("/vehicle-cat", { params: { page: 1, limit: 100 } }),
      ]);
      if (!isActive()) return;
      const vehicleResult = vehiclesResponse.data.vehicles;
      setCars(vehicleResult?.vehicles || []);
      setPagination(vehicleResult?.pagination || { page: 1, totalPage: 1 });
      setBrands(brandsResponse.data.brands?.brands || []);
      setCategories(categoriesResponse.data.vehiclesCat?.vehiclesCat || []);
    } catch (requestError) {
      if (isActive()) setError(getErrorMessage(requestError));
    } finally {
      if (isActive()) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchCars(page, () => active);
    return () => { active = false; };
  }, [page, refreshKey]);

  const startEditing = (car) => {
    setEditingCar({
      id: car.id,
      brand_id: car.brand?.id || car.brand_id || "",
      category_id: car.category?.id || car.category_id || "",
      plate_number: car.plate_number || "",
      model: car.model || "",
      pricePerDay: car.pricePerDay ?? "",
      year: car.year ?? "",
      color: car.color || "",
      seat: car.seat ?? "",
      status: car.status || "AVAILABLE",
      description: car.description || "",
    });
    setThumbnail(null);
    setError("");
    setNotice("");
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setEditingCar((current) => ({ ...current, [name]: value }));
  };

  const saveCar = async (event) => {
    event.preventDefault();
    if (saving || !editingCar) return;

    const formData = new FormData();
    Object.entries(editingCar).forEach(([key, value]) => {
      if (key !== "id") formData.append(key, value);
    });
    if (thumbnail) formData.append("thumbnail", thumbnail);

    setSaving(true);
    setError("");
    try {
      await api.put(`/vehicles/${editingCar.id}`, formData);
      setNotice("Vehicle updated successfully.");
      setEditingCar(null);
      setThumbnail(null);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (car, status) => {
    if (updatingStatus) return;
    setUpdatingStatus(car.id);
    setError("");
    setNotice("");
    try {
      await api.put(`/vehicles/${car.id}`, { status });
      setCars((current) => current.map((item) =>
        item.id === car.id ? { ...item, status } : item
      ));
      setNotice("Vehicle status updated.");
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingStatus("");
    }
  };

  const deleteCar = async (car) => {
    if (deleting || !window.confirm(`Delete ${car.brand?.name || "this vehicle"} ${car.model}? This cannot be undone.`)) return;
    setDeleting(car.id);
    setError("");
    setNotice("");
    try {
      await api.delete(`/vehicles/${car.id}`);
      setCars((current) => current.filter((item) => item.id !== car.id));
      setNotice("Vehicle deleted successfully.");
      if (cars.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshKey((current) => current + 1);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeleting("");
    }
  };

  return (
    <div className="w-full px-4 pt-10 md:px-10">
      <Title title="Manage Cars" subTitle="View listed vehicles, update their details, or remove them from the booking platform." />

      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="mt-6 w-full overflow-x-auto rounded-md border border-borderColor">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Vehicle</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price / day</th>
              <th className="p-3 font-medium">Availability</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && cars.map((car) => (
              <tr key={car.id} className="border-t border-borderColor">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={car.thumbnail} alt={`${car.brand?.name || "Vehicle"} ${car.model}`} className="h-12 w-16 rounded-md object-cover" />
                    <div>
                      <p className="font-medium text-gray-800">{car.brand?.name || "Unknown brand"} {car.model}</p>
                      <p className="text-xs text-gray-500">{car.year} · {car.plate_number}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{car.category?.name || "Uncategorized"}</td>
                <td className="p-3">${car.pricePerDay}/day</td>
                <td className="p-3">
                  <select
                    aria-label={`Availability for ${car.model}`}
                    className={inputClass}
                    value={car.status}
                    disabled={updatingStatus === car.id || Boolean(updatingStatus)}
                    onChange={(event) => changeStatus(car, event.target.value)}
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditing(car)} className="rounded-md border border-borderColor px-3 py-2 text-gray-700 hover:bg-gray-50">Edit</button>
                    <button type="button" onClick={() => deleteCar(car)} disabled={Boolean(deleting)} className="rounded-md border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50">
                      {deleting === car.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan="5" className="p-8 text-center">Loading vehicles...</td></tr>}
            {!loading && !error && cars.length === 0 && <tr><td colSpan="5" className="p-8 text-center">No vehicles have been added yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {pagination.totalPage > 0 && <Pagination page={page} setPage={setPage} totalPage={pagination.totalPage} />}

      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
          <form onSubmit={saveCar} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-5 shadow-xl md:p-7" aria-labelledby="edit-vehicle-title">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="edit-vehicle-title" className="text-xl font-semibold text-gray-800">Edit vehicle</h2>
              <button type="button" onClick={() => setEditingCar(null)} disabled={saving} className="px-2 py-1 text-gray-600" aria-label="Close edit form">Close</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-600">Brand<select name="brand_id" required value={editingCar.brand_id} onChange={updateField} className={inputClass}><option value="">Select brand</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
              <label className="text-sm text-gray-600">Category<select name="category_id" required value={editingCar.category_id} onChange={updateField} className={inputClass}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="text-sm text-gray-600">Model<input name="model" required minLength="2" maxLength="100" value={editingCar.model} onChange={updateField} className={inputClass} /></label>
              <label className="text-sm text-gray-600">Plate number<input name="plate_number" required minLength="3" maxLength="20" value={editingCar.plate_number} onChange={updateField} className={inputClass} /></label>
              <label className="text-sm text-gray-600">Year<input name="year" type="number" min="1900" max={new Date().getFullYear() + 1} required value={editingCar.year} onChange={updateField} className={inputClass} /></label>
              <label className="text-sm text-gray-600">Price per day<input name="pricePerDay" type="number" min="0.01" step="0.01" required value={editingCar.pricePerDay} onChange={updateField} className={inputClass} /></label>
              <label className="text-sm text-gray-600">Color<input name="color" required minLength="2" maxLength="50" value={editingCar.color} onChange={updateField} className={inputClass} /></label>
              <label className="text-sm text-gray-600">Seats<input name="seat" required min="1" value={editingCar.seat} onChange={updateField} className={inputClass} /></label>
              <label className="text-sm text-gray-600">Status<select name="status" value={editingCar.status} onChange={updateField} className={inputClass}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              <label className="text-sm text-gray-600">Replace thumbnail<input type="file" accept="image/*" onChange={(event) => setThumbnail(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" /></label>
              <label className="text-sm text-gray-600 sm:col-span-2">Description<textarea name="description" required minLength="5" value={editingCar.description} onChange={updateField} rows="4" className={inputClass} /></label>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingCar(null)} disabled={saving} className="rounded-md border border-borderColor px-4 py-2">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageCar;