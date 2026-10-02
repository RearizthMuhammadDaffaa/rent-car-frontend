import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import api from "../../api/axios";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error?.message || "Something went wrong. Please try again.";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/vehicle-cat");
      setCategories(response.data.vehiclesCat || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitialCategories = async () => {
      try {
        const response = await api.get("/vehicle-cat");
        if (active) setCategories(response.data.vehiclesCat || []);
      } catch (requestError) {
        if (active) setError(getErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadInitialCategories();
    return () => { active = false; };
  }, []);

  const resetForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  const openForm = (category = null) => {
    setError("");
    setNotice("");
    setEditingCategory(category);
    setName(category?.name || "");
    setDescription(category?.description || "");
    setFormOpen(true);
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const data = { name: name.trim(), description: description.trim() };
      if (editingCategory) {
        await api.put(`/vehicle-cat/${editingCategory.id}`, data);
        setNotice("Category updated successfully.");
      } else {
        await api.post("/vehicle-cat", data);
        setNotice("Category created successfully.");
      }
      resetForm();
      await fetchCategories();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (deleting || !window.confirm(`Delete the ${category.name} category? This cannot be undone.`)) return;
    setDeleting(category.id);
    setError("");
    setNotice("");
    try {
      await api.delete(`/vehicle-cat/${category.id}`);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setNotice("Category deleted successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeleting("");
    }
  };

  return (
    <div className="w-full px-4 pt-10 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Title title="Vehicle Categories" subTitle="Create and maintain categories used by vehicle listings." />
        <button type="button" onClick={() => openForm()} className="rounded-md bg-primary px-4 py-2.5 font-medium text-white">Add category</button>
      </div>
      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="mt-6 w-full overflow-x-auto rounded-md border border-borderColor">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500"><tr><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Description</th><th className="p-3 font-medium">Actions</th></tr></thead>
          <tbody>
            {!loading && categories.map((category) => (
              <tr key={category.id} className="border-t border-borderColor">
                <td className="p-3 font-medium text-gray-800">{category.name}</td>
                <td className="p-3">{category.description || "—"}</td>
                <td className="p-3"><div className="flex gap-2">
                  <button type="button" onClick={() => openForm(category)} className="rounded-md border border-borderColor px-3 py-2 hover:bg-gray-50">Edit</button>
                  <button type="button" onClick={() => deleteCategory(category)} disabled={Boolean(deleting)} className="rounded-md border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50">{deleting === category.id ? "Deleting..." : "Delete"}</button>
                </div></td>
              </tr>
            ))}
            {loading && <tr><td colSpan="3" className="p-8 text-center">Loading categories...</td></tr>}
            {!loading && !error && categories.length === 0 && <tr><td colSpan="3" className="p-8 text-center">No categories have been added yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <form onSubmit={saveCategory} className="w-full max-w-lg rounded-md bg-white p-5 shadow-xl md:p-7" aria-labelledby="category-form-title">
          <h2 id="category-form-title" className="mb-5 text-xl font-semibold text-gray-800">{editingCategory ? "Edit category" : "Add category"}</h2>
          <label htmlFor="category-name" className="text-sm text-gray-600">Name</label>
          <input id="category-name" value={name} onChange={(event) => setName(event.target.value)} required minLength="3" maxLength="100" className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" />
          <label htmlFor="category-description" className="mt-4 block text-sm text-gray-600">Description</label>
          <textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value)} rows="4" className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" />
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={resetForm} disabled={saving} className="rounded-md border border-borderColor px-4 py-2">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-60">{saving ? "Saving..." : "Save category"}</button>
          </div>
        </form>
      </div>}
    </div>
  );
};

export default ManageCategories;