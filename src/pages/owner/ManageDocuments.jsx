import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import api from "../../api/axios";
import Pagination from "../../components/Pagination";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error?.message || "Something went wrong. Please try again.";

const ManageDocuments = () => {
  const limit = 5;
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPage: 1 });

  const fetchDocuments = async (requestedPage = page, isActive = () => true) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/documents", {
        params: { page: requestedPage, limit },
      });
      if (!isActive()) return;
      const result = response.data.data;
      setDocuments(result?.documents || []);
      setPagination(result?.pagination || { page: 1, totalPage: 1 });
    } catch (requestError) {
      if (isActive()) setError(getErrorMessage(requestError));
    } finally {
      if (isActive()) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchDocuments(page, () => active);
    return () => { active = false; };
  }, [page, refreshKey]);

  const openDocument = async (document) => {
    setSelectedDocument({ id: document.id, userId: document.user_id, status: document.status });
    setDetailLoading(true);
    setError("");
    try {
      const response = await api.get(`/documents/${document.id}`);
      setSelectedDocument(response.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selectedDocument || updating) return;
    setUpdating(true);
    setError("");
    setNotice("");
    try {
      if (status === "REJECTED") {
        await api.patch(`/documents/${selectedDocument.id}/reject`);
      } else {
        await api.patch(`/documents/${selectedDocument.id}/status`, { status });
      }
      setSelectedDocument((current) => ({ ...current, status }));
      setDocuments((current) => current.map((item) => item.id === selectedDocument.id ? { ...item, status } : item));
      setNotice(`Document ${status.toLowerCase()}.`);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full px-4 pt-10 md:px-10">
      <Title title="Document Verification" subTitle="Review customer identity documents and update their verification status." />
      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="mt-6 w-full overflow-x-auto rounded-md border border-borderColor">
        <table className="w-full min-w-[650px] border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500"><tr><th className="p-3 font-medium">Customer ID</th><th className="p-3 font-medium">Submitted</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Review</th></tr></thead>
          <tbody>
            {!loading && documents.map((document) => (
              <tr key={document.id} className="border-t border-borderColor">
                <td className="p-3 font-mono text-xs">{document.user_id}</td>
                <td className="p-3">{document.createdAt ? new Date(document.createdAt).toLocaleString() : "—"}</td>
                <td className="p-3"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs">{document.status}</span></td>
                <td className="p-3"><button type="button" onClick={() => openDocument(document)} className="rounded-md border border-borderColor px-3 py-2 text-gray-700 hover:bg-gray-50">View documents</button></td>
              </tr>
            ))}
            {loading && <tr><td colSpan="4" className="p-8 text-center">Loading documents...</td></tr>}
            {!loading && !error && documents.length === 0 && <tr><td colSpan="4" className="p-8 text-center">No customer documents have been submitted.</td></tr>}
          </tbody>
        </table>
      </div>
      {pagination.totalPage > 0 && <Pagination page={page} setPage={setPage} totalPage={pagination.totalPage} />}

      {selectedDocument && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white p-5 shadow-xl md:p-7" role="dialog" aria-modal="true" aria-labelledby="document-review-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 id="document-review-title" className="text-xl font-semibold text-gray-800">Customer documents</h2><p className="mt-1 break-all text-sm text-gray-500">Customer ID: {selectedDocument.userId}</p></div>
            <button type="button" onClick={() => setSelectedDocument(null)} className="rounded-md border border-borderColor px-3 py-2" aria-label="Close document details">Close</button>
          </div>
          {detailLoading ? <p className="py-12 text-center text-gray-600">Loading secure document previews...</p> : (
            <>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {[{ title: "KTP", url: selectedDocument.ktpUrl }, { title: "SIM", url: selectedDocument.simUrl }].map((item) => (
                  <div key={item.title} className="overflow-hidden rounded-md border border-borderColor">
                    <h3 className="border-b border-borderColor px-4 py-3 font-medium text-gray-800">{item.title}</h3>
                    {item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="block"><img src={item.url} alt={`${item.title} document`} className="max-h-[55vh] w-full object-contain" /><span className="block px-4 py-3 text-sm text-primary">Open full image</span></a> : <p className="p-6 text-sm text-gray-500">Image unavailable.</p>}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-borderColor pt-4">
                <p className="text-sm text-gray-600">Current status: <span className="font-medium text-gray-800">{selectedDocument.status}</span></p>
                {selectedDocument.status === "PENDING" && <div className="flex gap-3">
                  <button type="button" onClick={() => updateStatus("REJECTED")} disabled={updating} className="rounded-md border border-red-200 px-4 py-2 text-red-700 disabled:opacity-50">{updating ? "Updating..." : "Reject"}</button>
                  <button type="button" onClick={() => updateStatus("APPROVED")} disabled={updating} className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-50">{updating ? "Updating..." : "Approve"}</button>
                </div>}
              </div>
              {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            </>
          )}
        </section>
      </div>}
    </div>
  );
};

export default ManageDocuments;