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
  HiOutlineArrowUpTray,
  HiCheck
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

  // Success Banner State
  const [successBanner, setSuccessBanner] = useState<{
    title: string;
    message: string;
    productName: string;
    displayOnHome?: boolean;
  } | null>(null);

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-dismiss banner after 7 seconds
  useEffect(() => {
    if (!successBanner) return;
    const timer = setTimeout(() => {
      setSuccessBanner(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [successBanner]);

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
    display_on_home: true,
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
      display_on_home: true,
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
      display_on_home: prod.display_on_home !== undefined ? Boolean(prod.display_on_home) : true,
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
    setModalFeedback(null);

    // 1. Validation: Sale price cannot be higher than base price
    const basePriceNum = Number(formData.base_price);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      setModalFeedback({ type: 'error', text: 'Please enter a valid base price greater than 0.' });
      return;
    }

    if (formData.sale_price && String(formData.sale_price).trim() !== '') {
      const salePriceNum = Number(formData.sale_price);
      if (isNaN(salePriceNum) || salePriceNum < 0) {
        setModalFeedback({ type: 'error', text: 'Sale price must be a valid number.' });
        return;
      }
      if (salePriceNum > basePriceNum) {
        setModalFeedback({
          type: 'error',
          text: `Sale price (LKR ${salePriceNum.toLocaleString()}) cannot be higher than the base price (LKR ${basePriceNum.toLocaleString()}).`
        });
        return;
      }
    }

    // 2. Validation: Compulsory fields
    if (!formData.short_description || !formData.short_description.trim()) {
      setModalFeedback({ type: 'error', text: 'Short description is compulsory.' });
      return;
    }

    if (!formData.full_description || !formData.full_description.trim()) {
      setModalFeedback({ type: 'error', text: 'Full description is compulsory.' });
      return;
    }

    if (!formData.ingredients || !formData.ingredients.trim()) {
      setModalFeedback({ type: 'error', text: 'Key ingredients are compulsory.' });
      return;
    }

    setModalLoading(true);

    const payload: any = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      sku: formData.sku.trim() || null,
      category_id: formData.category_id,
      base_price: basePriceNum,
      sale_price: formData.sale_price && String(formData.sale_price).trim() !== '' ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity),
      short_description: formData.short_description.trim(),
      full_description: formData.full_description.trim(),
      ingredients: formData.ingredients.trim(),
      how_to_use: formData.how_to_use.trim() || null,
      tag: formData.tag.trim() || null,
      is_in_stock: formData.is_in_stock,
      is_featured: formData.is_featured,
      is_new_arrival: formData.is_new_arrival,
      display_on_home: formData.display_on_home,
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
        setIsModalOpen(false);
        setSuccessBanner({
          title: editingProduct ? 'Product Updated Successfully' : 'Product Added Successfully',
          message: editingProduct 
            ? `Formula "${payload.name}" has been successfully updated with the latest specifications.`
            : `Formula "${payload.name}" has been successfully created and published to the store catalog.`,
          productName: payload.name,
          displayOnHome: Boolean(payload.display_on_home)
        });
        fetchProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setModalFeedback({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (err: any) {
      setModalFeedback({ type: 'error', text: err.message || 'Server error' });
    } finally {
      setModalLoading(false);
    }
  };

  // Permanently delete product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const { id, name } = productToDelete;

    try {
      const res = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setProductToDelete(null);
        setSuccessBanner({
          title: 'Product Deleted Successfully',
          message: `"${name}" has been permanently removed from the product catalog.`,
          productName: name
        });
        fetchProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert(err.message || 'Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
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

      {/* Success Notification Banner */}
      {successBanner && (
        <div 
          role="alert"
          aria-live="polite"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-[#141820] border border-emerald-500/40 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn"
        >
          {/* Subtle gold and emerald ambient glows */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-10 w-48 h-48 bg-[#B48346]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-950/60 mt-0.5 sm:mt-0">
                <HiOutlineCheckCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading text-base font-medium text-stone-100">
                    {successBanner.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Success
                  </span>
                  {successBanner.displayOnHome && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-stone-800 text-[#F3C082] border border-stone-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Home Showcase Enabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-300 font-sans">
                  {successBanner.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              <button
                onClick={() => setSuccessBanner(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-stone-400 hover:text-stone-100 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 rounded-xl transition-all text-xs font-mono cursor-pointer"
                title="Dismiss Banner"
              >
                <span>Dismiss</span>
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
                        {p.display_on_home !== false && p.display_on_home !== 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Home
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-stone-800 text-stone-500 border border-stone-700/50">
                            Home Hidden
                          </span>
                        )}
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
                        onClick={() => setProductToDelete({ id: p.id, name: p.name })}
                        title="Delete Product"
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
              <div className="p-4 bg-[#0E1015] rounded-xl border border-stone-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono uppercase text-stone-300 mb-1.5">
                      Base Price (LKR) <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                      placeholder="6500"
                      required
                      min="0"
                      className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-[#B48346]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono uppercase text-stone-300 mb-1.5">
                      Sale Price (LKR)
                      <span className="text-[10px] lowercase text-stone-500 ml-1 font-sans">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.sale_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                      placeholder="5800"
                      min="0"
                      className={`w-full bg-[#141820] border rounded-xl p-2.5 text-stone-100 focus:outline-none ${
                        formData.sale_price && Number(formData.sale_price) > Number(formData.base_price)
                          ? 'border-rose-500 text-rose-300 focus:border-rose-500'
                          : 'border-stone-700 focus:border-[#B48346]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-mono uppercase text-stone-300 mb-1.5">
                      Stock Quantity <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                      placeholder="50"
                      required
                      min="0"
                      className="w-full bg-[#141820] border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-[#B48346]"
                    />
                  </div>
                </div>

                {/* Real-time warning if sale price > base price */}
                {Boolean(formData.sale_price && Number(formData.sale_price) > Number(formData.base_price)) && (
                  <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-mono animate-fadeIn">
                    <span>⚠️ Warning: Sale price (LKR {Number(formData.sale_price).toLocaleString()}) cannot be higher than base price (LKR {Number(formData.base_price).toLocaleString()}). Please adjust before saving.</span>
                  </div>
                )}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-mono uppercase text-stone-300">
                      Short Description <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-amber-400/80 uppercase">Compulsory</span>
                  </div>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Restorative leave-in elixir crafted with pure Ceylon botanicals..."
                    required
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Brief summary displayed in product cards and previews.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-mono uppercase text-stone-300">
                      Full Description <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-amber-400/80 uppercase">Compulsory</span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.full_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                    placeholder="Deep ceremonial curl care enriched with cold-pressed oils..."
                    required
                    className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Comprehensive formula details, ceremonial history, and ritual advantages.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-mono uppercase text-stone-300">
                        Key Ingredients <span className="text-amber-400 font-bold">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-amber-400/80 uppercase">Compulsory</span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.ingredients}
                      onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                      placeholder="Ceylon King Coconut Oil, Hydrolyzed Keratin, Gotu Kola Extract..."
                      required
                      className="w-full bg-[#0E1015] border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-[#B48346]"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">Active ingredients & botanicals.</p>
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
                    <p className="text-[11px] text-stone-500 mt-1">Recommended daily ritual or styling instructions.</p>
                  </div>
                </div>
              </div>

              {/* Toggles & Visibility */}
              <div className="p-4 bg-[#0E1015] rounded-xl border border-stone-800 space-y-4">
                <div className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                  Store Visibility & Catalog Badges
                </div>

                {/* Display On Home - Toggle Tick */}
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, display_on_home: !prev.display_on_home }))}
                  className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-700/70 hover:border-[#B48346]/50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        formData.display_on_home
                          ? 'bg-[#B48346] text-stone-950 shadow-sm shadow-[#B48346]/40'
                          : 'bg-stone-800 border border-stone-600 text-transparent'
                      }`}>
                        <HiCheck className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <span className="font-medium text-stone-200 text-sm block">Display on Home</span>
                        <span className="text-[11px] text-stone-400 block">
                          Toggle tick to display this product on the main landing page showcase
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                      formData.display_on_home
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-stone-800 text-stone-500 border border-stone-700'
                    }`}>
                      {formData.display_on_home ? '✓ Home Visible' : 'Home Hidden'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="accent-[#B48346] w-4 h-4 rounded"
                    />
                    <span className="font-mono uppercase text-stone-300 text-xs">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_new_arrival}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_new_arrival: e.target.checked }))}
                      className="accent-[#B48346] w-4 h-4 rounded"
                    />
                    <span className="font-mono uppercase text-stone-300 text-xs">New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_in_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_in_stock: e.target.checked }))}
                      className="accent-[#B48346] w-4 h-4 rounded"
                    />
                    <span className="font-mono uppercase text-stone-300 text-xs">In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="accent-[#B48346] w-4 h-4 rounded"
                    />
                    <span className="font-mono uppercase text-stone-300 text-xs">Catalog Active</span>
                  </label>
                </div>
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141820] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                <HiOutlineTrash className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-light text-stone-100">
                  Delete Product Formulation
                </h3>
                <span className="text-[11px] font-mono uppercase text-rose-400/90">
                  Permanent Database Action
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Are you sure you want to permanently delete <strong className="text-white font-medium">"{productToDelete.name}"</strong>? 
              This will completely remove the product, all formulation images, and customer reviews from the database.
            </p>

            <div className="pt-2 flex justify-end gap-3 font-mono text-xs uppercase">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProduct}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
