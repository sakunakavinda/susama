import { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineTag,
  HiOutlineArrowUpTray,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2';

export default function AdminCategories() {
  const { getAuthHeaders } = useAdminStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top Notification Banner State
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  // Delete Confirmation Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
    active_products_count: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-dismiss banner after 8 seconds
  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 8000);
    return () => clearTimeout(timer);
  }, [banner]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const bodyData = new FormData();
    bodyData.append('image', file);

    try {
      const res = await fetch('http://localhost:5001/api/upload?type=category', {
        method: 'POST',
        body: bodyData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error('Category image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/categories');
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null
    };

    try {
      const url = editingCategory
        ? `http://localhost:5001/api/categories/${editingCategory.id}`
        : 'http://localhost:5001/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', text: editingCategory ? 'Category updated!' : 'Category created!' });
        fetchCategories();
        setTimeout(() => setIsModalOpen(false), 1200);
      } else {
        setFeedback({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Server error' });
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    if (categoryToDelete.active_products_count > 0) {
      setBanner({
        type: 'error',
        title: 'Deletion Prohibited',
        message: `Deleting category "${categoryToDelete.name}" is not allowed because it contains ${categoryToDelete.active_products_count} active product(s). Please reassign or delete these products first.`
      });
      setCategoryToDelete(null);
      return;
    }

    setIsDeleting(true);
    const { id, name } = categoryToDelete;

    try {
      const res = await fetch(`http://localhost:5001/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        setCategoryToDelete(null);
        setBanner({
          type: 'success',
          title: 'Category Deleted Successfully',
          message: `Category "${name}" has been permanently removed.`
        });
        fetchCategories();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCategoryToDelete(null);
        setBanner({
          type: 'error',
          title: 'Deletion Blocked',
          message: data.message || 'Failed to delete category.'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setCategoryToDelete(null);
      setBanner({
        type: 'error',
        title: 'Server Error',
        message: err.message || 'Failed to delete category. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-heading text-2xl font-light text-stone-100 flex items-center gap-3">
            <span>Category Taxonomy</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-800 text-[#F3C082] border border-stone-700">
              {categories.length} Categories
            </span>
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Organize catalog groupings, header banners, and navigation routing.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B48346] hover:bg-[#C79456] text-white text-xs font-medium rounded-xl uppercase tracking-wider transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Top Notification Banner */}
      {banner && (
        <div 
          role="alert"
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-xl animate-fadeIn ${
            banner.type === 'success'
              ? 'bg-gradient-to-r from-emerald-950/70 via-stone-900 to-[#141820] border-emerald-500/40'
              : 'bg-gradient-to-r from-rose-950/70 via-stone-900 to-[#141820] border-rose-500/40'
          }`}
        >
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                banner.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-950/60'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-950/60'
              }`}>
                {banner.type === 'success' ? (
                  <HiOutlineCheckCircle className="w-6 h-6 stroke-[2]" />
                ) : (
                  <HiOutlineExclamationTriangle className="w-6 h-6 stroke-[2]" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading text-base font-medium text-stone-100">
                    {banner.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                    banner.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {banner.type === 'success' ? '✓ Success' : '⚠️ Action Blocked'}
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-sans">
                  {banner.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setBanner(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-stone-400 hover:text-stone-100 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 rounded-xl transition-all text-xs font-mono cursor-pointer self-end sm:self-center"
            >
              <span>Dismiss</span>
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-stone-300 font-mono">
            <div className="w-8 h-8 border-2 border-[#B48346]/20 border-t-[#B48346] rounded-full animate-spin mx-auto mb-3"></div>
            Loading categories...
          </div>
        ) : categories.length > 0 ? (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-[#141820] border border-stone-800 rounded-2xl p-5 relative overflow-hidden group hover:border-[#B48346]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <HiOutlineTag className="w-6 h-6 text-[#B48346]" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-stone-800 text-[#F3C082] border border-stone-700">
                      {c.active_products_count ?? 0} Products
                    </span>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 text-stone-400 hover:text-[#F3C082] hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete({ id: c.id, name: c.name, active_products_count: Number(c.active_products_count || 0) })}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        Number(c.active_products_count || 0) > 0 
                          ? 'text-stone-500 hover:text-amber-400 hover:bg-amber-500/10' 
                          : 'text-stone-400 hover:text-rose-400 hover:bg-rose-500/10'
                      }`}
                      title={Number(c.active_products_count || 0) > 0 ? `Cannot Delete: Has ${c.active_products_count} active product(s)` : "Delete Category"}
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-heading text-lg font-medium text-white">{c.name}</h3>
                <p className="text-[11px] font-mono text-[#F3C082] mt-0.5">/{c.slug}</p>
                <p className="text-xs text-stone-300 mt-2 line-clamp-2">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs font-mono">
                {Number(c.active_products_count || 0) > 0 ? (
                  <span className="text-[11px] text-amber-400/90 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {c.active_products_count} active product(s) linked
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
                    0 products (Deletable)
                  </span>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active in storefront"></span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-stone-300 font-mono">
            No categories created yet.
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141820] border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
            <div className="p-6 border-b border-stone-800 flex items-center justify-between">
              <h2 className="font-heading text-xl font-light text-white">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {feedback && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                }`}>
                  <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{feedback.text}</span>
                </div>
              )}

              <div>
                <label className="block font-mono uppercase text-stone-300 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Curl Creams &amp; Elixirs"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-stone-300 mb-1.5">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="curl-creams-elixirs"
                  required
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-stone-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of botanical hair care in this collection..."
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>

              {/* Category Cover Image File Upload & Preview */}
              <div className="p-4 bg-[#0E1015] rounded-xl border border-stone-800 space-y-3">
                <label className="block font-mono uppercase text-stone-300">Category Cover Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Category Preview"
                      className="w-20 h-20 rounded-xl object-cover bg-stone-900 border border-stone-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-stone-800 flex items-center justify-center text-stone-300 border border-stone-700 flex-shrink-0">
                      <HiOutlineTag className="w-6 h-6 text-stone-400" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Image file path (e.g. /uploads/categories/...)"
                      className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-[#B48346]"
                    />

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg cursor-pointer border border-stone-700 transition-colors">
                        <HiOutlineArrowUpTray className="w-4 h-4 text-[#B48346]" />
                        <span>{uploadingImage ? 'Uploading File...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-300">JPG, PNG, WEBP saved directly to server files</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-[#B48346] hover:bg-[#C79456] text-white font-mono uppercase rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation / Restriction Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`bg-[#141820] border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 ${
            categoryToDelete.active_products_count > 0 ? 'border-amber-500/40' : 'border-rose-500/40'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                categoryToDelete.active_products_count > 0 
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' 
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}>
                {categoryToDelete.active_products_count > 0 ? (
                  <HiOutlineExclamationTriangle className="w-6 h-6 stroke-[2]" />
                ) : (
                  <HiOutlineTrash className="w-6 h-6 stroke-[2]" />
                )}
              </div>
              <div>
                <h3 className="font-heading text-lg font-light text-stone-100">
                  {categoryToDelete.active_products_count > 0 ? 'Cannot Delete Category' : 'Delete Category Taxonomy'}
                </h3>
                <span className={`text-[11px] font-mono uppercase ${
                  categoryToDelete.active_products_count > 0 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {categoryToDelete.active_products_count > 0 ? 'Protected by Active Products' : 'Permanent Database Action'}
                </span>
              </div>
            </div>

            {categoryToDelete.active_products_count > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  Deleting category <strong className="text-white font-medium">"{categoryToDelete.name}"</strong> is <span className="text-amber-400 font-semibold">not allowed</span> because it currently contains <strong className="text-amber-300">{categoryToDelete.active_products_count} active product(s)</strong>.
                </p>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs font-mono space-y-1">
                  <p className="font-bold">Required Actions:</p>
                  <p>1. Open the Product Catalog.</p>
                  <p>2. Reassign the products to another category, or delete them.</p>
                  <p>3. Once empty, this category can be safely deleted.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                Are you sure you want to permanently delete category <strong className="text-white font-medium">"{categoryToDelete.name}"</strong>? 
                This category contains 0 active products and can be safely removed from the system.
              </p>
            )}

            <div className="pt-2 flex justify-end gap-3 font-mono text-xs uppercase">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors cursor-pointer"
              >
                {categoryToDelete.active_products_count > 0 ? 'Understood' : 'Cancel'}
              </button>

              {categoryToDelete.active_products_count === 0 && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteCategory}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md shadow-rose-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Permanently Delete</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
