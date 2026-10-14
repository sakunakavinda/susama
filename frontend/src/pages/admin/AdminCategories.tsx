import { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineTag
} from 'react-icons/hi2';

export default function AdminCategories() {
  const { getAuthHeaders } = useAdminStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5001/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 text-stone-400 hover:text-[#F3C082] hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
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

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs font-mono text-stone-300">
                <span>Active in storefront</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
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

              <div>
                <label className="block font-mono uppercase text-stone-300 mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/categories/haircare.jpg or https://..."
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
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
    </div>
  );
}
