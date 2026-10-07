import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import api from "../../api/axios";
import Pagination from "../../components/Pagination";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error?.message || "Something went wrong. Please try again.";

const toLocalDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const initialForm = {
  code: "",
  discountValue: "",
  usageLimit: "",
  usedCount: "0",
  type: "PERCENTAGE",
  maximumDiscount: "",
  expiredAt: "",
  isActive: true,
};

const ManageCoupons = () => {
  const limit = 5;
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState("");
  const [deleting, setDeleting] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPage: 1 });

  const fetchCoupons = async (requestedPage = page, isActive = () => true) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/coupons", {
        params: { page: requestedPage, limit },
      });
      if (!isActive()) return;
      const result = response.data.coupons;
      setCoupons(result?.coupons || []);
      setPagination(result?.pagination || { page: 1, totalPage: 1 });
    } catch (requestError) {
      if (isActive()) setError(getErrorMessage(requestError));
    } finally {
      if (isActive()) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchCoupons(page, () => active);
    return () => { active = false; };
  }, [page, refreshKey]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingCoupon(null);
    setForm(initialForm);
  };

  const openForm = (coupon = null) => {
    setError("");
    setNotice("");
    setEditingCoupon(coupon);
    setForm(coupon ? {
      code: coupon.code || "",
      discountValue: coupon.discountValue ?? "",
      usageLimit: coupon.usageLimit ?? "",
      usedCount: coupon.usedCount ?? 0,
      type: coupon.type || "PERCENTAGE",
      maximumDiscount: coupon.maximumDiscount ?? "",
      expiredAt: toLocalDateTime(coupon.expiredAt),
      isActive: coupon.isActive ?? true,
    } : initialForm);
    setFormOpen(true);
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const saveCoupon = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    const payload = {
      code: form.code.trim(),
      discountValue: Number(form.discountValue),
      usageLimit: Number(form.usageLimit),
      usedCount: Number(form.usedCount),
      type: form.type,
      maximumDiscount: Number(form.maximumDiscount),
      expiredAt: new Date(form.expiredAt).toISOString(),
      isActive: form.isActive,
    };
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon.id}`, payload);
        setNotice("Coupon updated successfully.");
      } else {
        await api.post("/coupons", payload);
        setNotice("Coupon created successfully.");
      }
      closeForm();
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    if (updating) return;
    setUpdating(coupon.id);
    setError("");
    setNotice("");
    try {
      await api.put(`/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      setCoupons((current) => current.map((item) => item.id === coupon.id ? { ...item, isActive: !item.isActive } : item));
      setNotice(`Coupon ${coupon.isActive ? "deactivated" : "activated"}.`);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdating("");
    }
  };

  const deleteCoupon = async (coupon) => {
    if (deleting || !window.confirm(`Permanently delete coupon ${coupon.code}?`)) return;
    setDeleting(coupon.id);
    setError("");
    setNotice("");
    try {
      await api.delete(`/coupons/${coupon.id}`);
      setCoupons((current) => current.filter((item) => item.id !== coupon.id));
      setNotice("Coupon deleted successfully.");
      if (coupons.length === 1 && page > 1) {
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Title title="Coupons" subTitle="Create and manage discount codes and usage limits." />
        <button type="button" onClick={() => openForm()} className="rounded-md bg-primary px-4 py-2.5 font-medium text-white">Add coupon</button>
      </div>
      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="mt-6 w-full overflow-x-auto rounded-md border border-borderColor">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500"><tr><th className="p-3 font-medium">Code</th><th className="p-3 font-medium">Discount</th><th className="p-3 font-medium">Usage</th><th className="p-3 font-medium">Expires</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th></tr></thead>
          <tbody>
            {!loading && coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-borderColor">
                <td className="p-3 font-medium text-gray-800">{coupon.code}</td>
                <td className="p-3">{coupon.discountValue} {coupon.type === "PERCENTAGE" ? "%" : "fixed"} · max {coupon.maximumDiscount}</td>
                <td className="p-3">{coupon.usedCount} / {coupon.usageLimit}</td>
                <td className="p-3">{coupon.expiredAt ? new Date(coupon.expiredAt).toLocaleDateString() : "—"}</td>
                <td className="p-3">{coupon.isActive ? "Active" : "Inactive"}</td>
                <td className="p-3"><div className="flex gap-2">
                  <button type="button" onClick={() => openForm(coupon)} className="rounded-md border border-borderColor px-3 py-2">Edit</button>
                  <button type="button" onClick={() => toggleActive(coupon)} disabled={Boolean(updating)} className="rounded-md border border-borderColor px-3 py-2 disabled:opacity-50">{updating === coupon.id ? "Updating..." : coupon.isActive ? "Deactivate" : "Activate"}</button>
                  <button type="button" onClick={() => deleteCoupon(coupon)} disabled={Boolean(deleting)} className="rounded-md border border-red-200 px-3 py-2 text-red-700 disabled:opacity-50">{deleting === coupon.id ? "Deleting..." : "Delete"}</button>
                </div></td>
              </tr>
            ))}
            {loading && <tr><td colSpan="6" className="p-8 text-center">Loading coupons...</td></tr>}
            {!loading && !error && coupons.length === 0 && <tr><td colSpan="6" className="p-8 text-center">No coupons have been created yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {pagination.totalPage > 0 && <Pagination page={page} setPage={setPage} totalPage={pagination.totalPage} />}

      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <form onSubmit={saveCoupon} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-5 shadow-xl md:p-7" aria-labelledby="coupon-form-title">
          <h2 id="coupon-form-title" className="mb-5 text-xl font-semibold text-gray-800">{editingCoupon ? "Edit coupon" : "Create coupon"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-600">Code<input name="code" value={form.code} onChange={updateField} required minLength="2" maxLength="50" className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" /></label>
            <label className="text-sm text-gray-600">Discount type<select name="type" value={form.type} onChange={updateField} className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none"><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed</option></select></label>
            <label className="text-sm text-gray-600">Discount value<input name="discountValue" type="number" min="0" step="any" value={form.discountValue} onChange={updateField} required className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" /></label>
            <label className="text-sm text-gray-600">Maximum discount<input name="maximumDiscount" type="number" min="0.01" step="any" value={form.maximumDiscount} onChange={updateField} required className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" /></label>
            <label className="text-sm text-gray-600">Usage limit<input name="usageLimit" type="number" min="1" step="1" value={form.usageLimit} onChange={updateField} required className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" /></label>
            <label className="text-sm text-gray-600">Used count<input name="usedCount" type="number" min="0" step="1" value={form.usedCount} onChange={updateField} required className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" /></label>
            <label className="text-sm text-gray-600">Expiry<input name="expiredAt" type="datetime-local" value={form.expiredAt} onChange={updateField} required className="mt-1 w-full rounded-md border border-borderColor px-3 py-2 outline-none" /></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700"><input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} />Active</label>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeForm} disabled={saving} className="rounded-md border border-borderColor px-4 py-2">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-60">{saving ? "Saving..." : "Save coupon"}</button>
          </div>
        </form>
      </div>}
    </div>
  );
};

export default ManageCoupons;