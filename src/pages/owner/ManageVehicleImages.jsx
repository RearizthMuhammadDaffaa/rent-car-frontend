import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import api from "../../api/axios";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error?.message || "Something went wrong. Please try again.";

const ManageVehicleImages = () => {
  const [images, setImages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [vehicleId, setVehicleId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [imagesResponse, vehiclesResponse] = await Promise.all([
        api.get("/vehicle-images"),
        api.get("/vehicles"),
      ]);
      setImages(imagesResponse.data.vehicleImages || []);
      setVehicles(vehiclesResponse.data.vehicles || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitialData = async () => {
      try {
        const [imagesResponse, vehiclesResponse] = await Promise.all([
          api.get("/vehicle-images"),
          api.get("/vehicles"),
        ]);
        if (!active) return;
        setImages(imagesResponse.data.vehicleImages || []);
        setVehicles(vehiclesResponse.data.vehicles || []);
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadInitialData();
    return () => { active = false; };
  }, []);

  const resetForm = () => {
    setFormOpen(false);
    setEditingImage(null);
    setVehicleId("");
    setImageFile(null);
  };

  const openForm = (image = null) => {
    setError("");
    setNotice("");
    setEditingImage(image);
    setVehicleId(image?.vehicle_id || "");
    setImageFile(null);
    setFormOpen(true);
  };

  const saveImage = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (editingImage && !imageFile) {
        await api.put(`/vehicle-images/${editingImage.id}`, { vehicle_id: vehicleId });
      } else {
        const formData = new FormData();
        formData.append("vehicle_id", vehicleId);
        formData.append("image", imageFile);
        if (editingImage) {
          await api.put(`/vehicle-images/${editingImage.id}`, formData);
        } else {
          await api.post("/vehicle-images", formData);
        }
      }
      setNotice(editingImage ? "Vehicle image updated successfully." : "Vehicle image uploaded successfully.");
      resetForm();
      await fetchData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (image) => {
    if (deleting || !window.confirm("Delete this vehicle image? This cannot be undone.")) return;
    setDeleting(image.id);
    setError("");
    setNotice("");
    try {
      await api.delete(`/vehicle-images/${image.id}`);
      setImages((current) => current.filter((item) => item.id !== image.id));
      setNotice("Vehicle image deleted successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeleting("");
    }
  };

  const vehicleLabel = (vehicleIdValue) => {
    const vehicle = vehicles.find((item) => item.id === vehicleIdValue);
    return vehicle ? `${vehicle.brand?.name || "Vehicle"} ${vehicle.model}` : "Vehicle unavailable";
  };

  return (
    <div className="w-full px-4 pt-10 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Title title="Vehicle Images" subTitle="Upload and manage gallery images attached to vehicles." />
        <button type="button" onClick={() => openForm()} disabled={vehicles.length === 0} className="rounded-md bg-primary px-4 py-2.5 font-medium text-white disabled:opacity-50">Upload image</button>
      </div>
      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {!loading && images.map((image) => (
          <article key={image.id} className="overflow-hidden rounded-md border border-borderColor">
            <img src={image.image_url} alt={`Gallery image for ${vehicleLabel(image.vehicle_id)}`} className="h-48 w-full object-cover" />
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0"><p className="truncate font-medium text-gray-800">{vehicleLabel(image.vehicle_id)}</p><p className="truncate text-xs text-gray-500">{image.id}</p></div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => openForm(image)} className="rounded-md border border-borderColor px-3 py-2 text-sm">Edit</button>
                <button type="button" onClick={() => deleteImage(image)} disabled={Boolean(deleting)} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-50">{deleting === image.id ? "Deleting..." : "Delete"}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {loading && <p className="mt-6 rounded-md border border-borderColor p-8 text-center text-gray-600">Loading vehicle images...</p>}
      {!loading && !error && images.length === 0 && <p className="mt-6 rounded-md border border-borderColor p-8 text-center text-gray-600">No vehicle images have been uploaded yet.</p>}

      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <form onSubmit={saveImage} className="w-full max-w-lg rounded-md bg-white p-5 shadow-xl md:p-7" aria-labelledby="vehicle-image-title">
          <h2 id="vehicle-image-title" className="mb-5 text-xl font-semibold text-gray-800">{editingImage ? "Edit vehicle image" : "Upload vehicle image"}</h2>
          <label htmlFor="vehicle-image-vehicle" className="text-sm text-gray-600">Vehicle</label>
          <select id="vehicle-image-vehicle" required value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none">
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand?.name || "Vehicle"} {vehicle.model}</option>)}
          </select>
          <label htmlFor="vehicle-image-file" className="mt-4 block text-sm text-gray-600">{editingImage ? "Replace image (optional)" : "Image"}</label>
          {editingImage && !imageFile && <img src={editingImage.image_url} alt="Current vehicle image" className="my-3 h-24 w-36 rounded object-cover" />}
          <input id="vehicle-image-file" type="file" accept="image/jpeg,image/png,image/webp" required={!editingImage} onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
          <p className="mt-1 text-xs text-gray-500">JPEG, PNG, or WebP; maximum 5 MB.</p>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={resetForm} disabled={saving} className="rounded-md border border-borderColor px-4 py-2">Cancel</button>
            <button type="submit" disabled={saving || !vehicleId || (!editingImage && !imageFile)} className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-60">{saving ? "Saving..." : "Save image"}</button>
          </div>
        </form>
      </div>}
    </div>
  );
};

export default ManageVehicleImages;