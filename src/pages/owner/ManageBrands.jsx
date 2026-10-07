import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import api from "../../api/axios";
import Pagination from "../../components/Pagination";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error?.message || "Something went wrong. Please try again.";

const ManageBrands = () => {
  const limit = 5;
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPage: 1,
  });

  const fetchBrands = async (requestedPage = page, isActive = () => true) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/brands", {
        params: { page: requestedPage, limit },
      });
      if (!isActive()) return;
      const result = response.data.brands;
      setBrands(result?.brands || []);
      setPagination(result?.pagination || { page: 1, totalPage: 1 });
    } catch (requestError) {
      if (isActive()) setError(getErrorMessage(requestError));
    } finally {
      if (isActive()) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchBrands(page, () => active);
    return () => { active = false; };
  }, [page, refreshKey]);

  const resetForm = () => {
    setFormOpen(false);
    setEditingBrand(null);
    setName("");
    setLogo(null);
  };

  const openCreateForm = () => {
    setError("");
    setNotice("");
    setEditingBrand(null);
    setName("");
    setLogo(null);
    setFormOpen(true);
  };

  const openEditForm = (brand) => {
    setError("");
    setNotice("");
    setEditingBrand(brand);
    setName(brand.name);
    setLogo(null);
    setFormOpen(true);
  };

  const saveBrand = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSaving(true);

    try {
      if (editingBrand) {
        if (logo) {
          const formData = new FormData();
          formData.append("name", name.trim());
          formData.append("logo", logo);
          await api.put(`/brands/${editingBrand.id}`, formData);
        } else {
          await api.put(`/brands/${editingBrand.id}`, { name: name.trim() });
        }
        setNotice("Brand updated successfully.");
      } else {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("logo", logo);
        await api.post("/brands", formData);
        setNotice("Brand created successfully.");
      }
      resetForm();
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async (brand) => {
    if (deleting || !window.confirm(`Delete the ${brand.name} brand? This cannot be undone.`)) return;
    setDeleting(brand.id);
    setError("");
    setNotice("");
    try {
      await api.delete(`/brands/${brand.id}`);
      setBrands((current) => current.filter((item) => item.id !== brand.id));
      setNotice("Brand deleted successfully.");
      if (brands.length === 1 && page > 1) {
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
    <div className="w-full flex flex-col px-4 pt-10 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Title title="Manage Brands" subTitle="Maintain the vehicle brands and their logos." />
        <button type="button" onClick={openCreateForm} className="rounded-md bg-primary px-4 py-2.5 font-medium text-white">Add brand</button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="mt-6 w-full overflow-x-auto rounded-md border border-borderColor">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Brand</th>
              <th className="p-3 font-medium">Logo</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && brands.map((brand) => (
              <tr key={brand.id} className="border-t border-borderColor">
                <td className="p-3 font-medium text-gray-800">{brand.name}</td>
                <td className="p-3"><img src={brand.logo} alt={`${brand.name} logo`} className="h-10 w-20 object-contain object-left" /></td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditForm(brand)} className="rounded-md border border-borderColor px-3 py-2 text-gray-700 hover:bg-gray-50">Edit</button>
                    <button type="button" onClick={() => deleteBrand(brand)} disabled={Boolean(deleting)} className="rounded-md border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50">{deleting === brand.id ? "Deleting..." : "Delete"}</button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan="3" className="p-8 text-center">Loading brands...</td></tr>}
            {!loading && !error && brands.length === 0 && <tr><td colSpan="3" className="p-8 text-center">No brands have been added yet.</td></tr>}
          </tbody>
        </table>
      </div>
        {pagination.totalPage > 0 && <Pagination page={page} setPage={setPage} totalPage={pagination.totalPage} />}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={saveBrand} className="w-full max-w-lg rounded-md bg-white p-5 shadow-xl md:p-7" aria-labelledby="brand-form-title">
            <h2 id="brand-form-title" className="mb-5 text-xl font-semibold text-gray-800">{editingBrand ? "Edit brand" : "Add brand"}</h2>
            <label htmlFor="brand-name" className="text-sm text-gray-600">Brand name</label>
            <input id="brand-name" value={name} onChange={(event) => setName(event.target.value)} required minLength="3" maxLength="100" className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" />
            <label htmlFor="brand-logo" className="mt-4 block text-sm text-gray-600">{editingBrand ? "Replace logo (optional)" : "Logo"}</label>
            {editingBrand?.logo && !logo && <img src={editingBrand.logo} alt={`${editingBrand.name} current logo`} className="my-3 h-12 max-w-40 object-contain object-left" />}
            <input id="brand-logo" type="file" accept="image/jpeg,image/png,image/webp" required={!editingBrand} onChange={(event) => setLogo(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
            <p className="mt-1 text-xs text-gray-500">JPEG, PNG, or WebP; maximum 5 MB.</p>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={resetForm} disabled={saving} className="rounded-md border border-borderColor px-4 py-2">Cancel</button>
              <button type="submit" disabled={saving || (!editingBrand && !logo)} className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-60">{saving ? "Saving..." : "Save brand"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageBrands;