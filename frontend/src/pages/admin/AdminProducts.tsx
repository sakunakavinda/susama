import { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineArrowUpTray
} from 'react-icons/hi2';

export default function AdminProducts() {
  const { getAuthHeaders } = useAdminStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    category_id: '',
    base_price: '',
    sale_price: '',
    stock_quantity: '50',
    short_description: '',
    full_description: '',
    ingredients: '',
    how_to_use: '',
    tag: '',
    is_in_stock: true,
    is_featured: false,
    is_new_arrival: false,
    is_active: true,
    primary_image_url: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories & products
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/categories');
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const res = await fetch(`http://localhost:5001/api/admin/products?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [categoryFilter]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: '',
      category_id: categories[0]?.id || '',
      base_price: '',
      sale_price: '',
      stock_quantity: '50',
      short_description: '',
      full_description: '',
      ingredients: '',
      how_to_use: '',
      tag: '',
      is_in_stock: true,
      is_featured: false,
      is_new_arrival: false,
      is_active: true,
      primary_image_url: ''
    });
    setModalFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      slug: prod.slug || '',
      sku: prod.sku || '',
      category_id: prod.category_id || '',
      base_price: String(prod.base_price || ''),
      sale_price: prod.sale_price ? String(prod.sale_price) : '',
      stock_quantity: String(prod.stock_quantity ?? 0),
      short_description: prod.short_description || '',
      full_description: prod.full_description || '',
      ingredients: prod.ingredients || '',
      how_to_use: prod.how_to_use || '',
      tag: prod.tag || '',
      is_in_stock: Boolean(prod.is_in_stock),
      is_featured: Boolean(prod.is_featured),
      is_new_arrival: Boolean(prod.is_new_arrival),
      is_active: Boolean(prod.is_active),
      primary_image_url: prod.primary_image || (prod.images && prod.images[0]?.image_url) || ''
    });
    setModalFeedback(null);
    setIsModalOpen(true);
  };

  // Auto-generate slug when name changes if adding new
  const handleNameChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: !editingProduct ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
    }));
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const bodyData = new FormData();
    bodyData.append('image', file);

    try {
      const res = await fetch('http://localhost:5001/api/upload?type=product', {
        method: 'POST',
        body: bodyData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, primary_image_url: data.url }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Product (Create or Update)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalFeedback(null);

    const payload: any = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      sku: formData.sku.trim() || null,
      category_id: formData.category_id,
      base_price: Number(formData.base_price),
      sale_price: formData.sale_price ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity),
      short_description: formData.short_description.trim() || null,
      full_description: formData.full_description.trim() || null,
      ingredients: formData.ingredients.trim() || null,
      how_to_use: formData.how_to_use.trim() || null,
      tag: formData.tag.trim() || null,
      is_in_stock: formData.is_in_stock,
      is_featured: formData.is_featured,
      is_new_arrival: formData.is_new_arrival,
      is_active: formData.is_active,
      images: formData.primary_image_url ? [{ image_url: formData.primary_image_url, is_primary: true }] : []
    };

    try {
      const url = editingProduct 
        ? `http://localhost:5001/api/products/${editingProduct.id}`
        : 'http://localhost:5001/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setModalFeedback({ type: 'success', text: editingProduct ? 'Product updated successfully!' : 'New product created!' });
        fetchProducts();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1200);
      } else {
        setModalFeedback({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (err: any) {
      setModalFeedback({ type: 'error', text: err.message || 'Server error' });
    } finally {
      setModalLoading(false);
    }
  };

  // Soft delete / archive product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate or remove "${name}" from the store catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-heading text-2xl font-light text-stone-100 flex items-center gap-3">
            <span>Product Catalog</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-800 text-[#F3C082] border border-stone-700">
              {products.length} Products
            </span>
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Manage Ceylon botanical formulas, pricing tiers, stock levels, and ritual instructions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B48346] hover:bg-[#C79456] text-white text-xs font-medium rounded-xl uppercase tracking-wider transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#141820] border border-stone-800 rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-[#B48346]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="w-full sm:w-72 relative">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full pl-9 pr-4 py-2 bg-[#141820] border border-stone-800 rounded-xl text-stone-200 placeholder:text-stone-300 focus:outline-none focus:border-[#B48346]"
          />
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-[#141820] border border-stone-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E1015] text-stone-300 font-mono uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">SKU &amp; Category</th>
                <th className="py-3.5 px-6">Stock Inventory</th>
                <th className="py-3.5 px-6">Pricing</th>
                <th className="py-3.5 px-6">Tags &amp; Badges</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-body">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-300 font-mono">
                    <div className="w-8 h-8 border-2 border-[#B48346]/20 border-t-[#B48346] rounded-full animate-spin mx-auto mb-3"></div>
                    Loading catalog...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-800/30 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {p.primary_image ? (
                          <img
                            src={p.primary_image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-900 border border-stone-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center text-stone-300 font-mono flex-shrink-0">
                            <HiOutlinePhoto className="w-5 h-5 text-stone-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-100 text-sm">{p.name}</p>
                          <p className="text-[11px] text-stone-300 font-mono mt-0.5 truncate max-w-[200px]">
                            /{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Category */}
                    <td className="py-4 px-6 font-mono">
                      <span className="text-stone-300 block">{p.sku || 'NO-SKU'}</span>
                      <span className="text-[11px] text-[#F3C082]">{p.category_name || 'General'}</span>
                    </td>

                    {/* Stock Inventory */}
                    <td className="py-4 px-6 font-mono">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${
                        p.stock_quantity <= 5
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : p.stock_quantity <= 15
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {p.stock_quantity} in stock
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-6 font-mono">
                      {p.sale_price ? (
                        <div>
                          <span className="font-bold text-[#F3C082] block">{formatLKR(Number(p.sale_price))}</span>
                          <span className="text-[11px] text-stone-300 line-through">{formatLKR(Number(p.base_price))}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-stone-200">{formatLKR(Number(p.base_price))}</span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {p.is_featured ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Featured
                          </span>
                        ) : null}
                        {p.tag && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-stone-800 text-stone-300 border border-stone-700">
                            {p.tag}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Active Status */}
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        p.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-800 text-stone-300'
                      }`}>
                        {p.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        title="Edit Product"
                        className="p-2 text-stone-400 hover:text-[#F3C082] hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        title="Deactivate / Delete"
                        className="p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-300 font-mono">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141820] border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-[#141820] z-10">
              <h2 className="font-heading text-xl font-light text-white">
                {editingProduct ? `Edit Formula: ${editingProduct.name}` : 'Create New Botanical Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-6 flex-1 text-xs">
              {modalFeedback && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${
                  modalFeedback.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}>
                  <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Ceylon Keratin Curl Elixir"
                    required
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">URL Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="ceylon-keratin-curl-elixir"
                    required
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    required
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">SKU (Inventory Identifier)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="SUS-ELX-01"
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#0E1015] rounded-xl border border-stone-800">
                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">Base Price (LKR) *</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                    placeholder="6500"
                    required
                    className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">Sale Price (LKR - Optional)</label>
                  <input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                    placeholder="5800"
                    className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    placeholder="50"
                    required
                    className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div className="p-4 bg-[#0E1015] rounded-xl border border-stone-800 space-y-3">
                <label className="block font-mono uppercase text-stone-300">Product Primary Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {formData.primary_image_url ? (
                    <img
                      src={formData.primary_image_url}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover bg-stone-900 border border-stone-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-stone-800 flex items-center justify-center text-stone-300 border border-stone-700 flex-shrink-0">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={formData.primary_image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_image_url: e.target.value }))}
                      placeholder="Paste image URL (e.g. /products/sample.jpg or https://...)"
                      className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-[#B48346]"
                    />
                    
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg cursor-pointer border border-stone-700 transition-colors">
                        <HiOutlineArrowUpTray className="w-4 h-4 text-[#B48346]" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Local Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-300">Supported formats: JPG, PNG, WEBP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions & Rich Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">Short Description</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Restorative leave-in elixir crafted with pure Ceylon botanicals..."
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-stone-300 mb-1.5">Full Description</label>
                  <textarea
                    rows={3}
                    value={formData.full_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                    placeholder="Deep ceremonial curl care enriched with cold-pressed oils..."
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono uppercase text-stone-300 mb-1.5">Key Ingredients</label>
                    <textarea
                      rows={2}
                      value={formData.ingredients}
                      onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                      placeholder="Ceylon King Coconut Oil, Hydrolyzed Keratin, Gotu Kola Extract..."
                      className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono uppercase text-stone-300 mb-1.5">How To Use</label>
                    <textarea
                      rows={2}
                      value={formData.how_to_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, how_to_use: e.target.value }))}
                      placeholder="Apply 2-3 drops to damp curls from mid-length to ends..."
                      className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles & Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#0E1015] rounded-xl border border-stone-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="accent-[#B48346] w-4 h-4 rounded"
                  />
                  <span className="font-mono uppercase text-stone-300">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_new_arrival: e.target.checked }))}
                    className="accent-[#B48346] w-4 h-4 rounded"
                  />
                  <span className="font-mono uppercase text-stone-300">New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_in_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_in_stock: e.target.checked }))}
                    className="accent-[#B48346] w-4 h-4 rounded"
                  />
                  <span className="font-mono uppercase text-stone-300">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="accent-[#B48346] w-4 h-4 rounded"
                  />
                  <span className="font-mono uppercase text-stone-300">Catalog Active</span>
                </label>
              </div>

              {/* Tag (Bestseller, Limited, etc) */}
              <div>
                <label className="block font-mono uppercase text-stone-300 mb-1.5">Promotional Badge Tag</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="e.g. Bestseller, Island Edition, Award Winner"
                  className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#B48346] to-[#966730] hover:from-[#C79456] text-white font-mono uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Saving Formula...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
