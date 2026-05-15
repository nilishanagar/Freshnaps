import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['mattress','pillow','bedsheet','cushion','comforter','blanket','curtain','accessory'];
const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;

const emptyForm = {
  name: '', description: '', shortDescription: '', category: 'mattress',
  price: '', discountPrice: '', stock: '', images: '',
  isFeatured: false, isBestseller: false, isTrending: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.getProducts()
      .then(res => setProducts(res.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ ...emptyForm, ...p, images: p.images?.join('\n') || '', price: p.price, discountPrice: p.discountPrice || '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
      };
      if (editing) {
        await adminService.updateProduct(editing, payload);
        toast.success('Product updated');
      } else {
        await adminService.createProduct(payload);
        toast.success('Product created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminService.deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const F = ({ label, children }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block uppercase">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500">{products.length} total products</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>
      ) : (
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-navy-700">
                <tr className="text-xs uppercase text-gray-400">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-navy-700">
                {products.map(p => (
                  <tr key={p._id} className="text-sm hover:bg-gray-50 dark:hover:bg-navy-700/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 capitalize">{p.category}</td>
                    <td className="p-4">
                      <span className="font-semibold">{formatPrice(p.discountPrice || p.price)}</span>
                      {p.discountPrice > 0 && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.price)}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${p.stock < 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{p.stock}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.isFeatured && <span className="badge bg-blue-100 text-blue-700">Featured</span>}
                        {p.isBestseller && <span className="badge bg-gold-100 text-gold-700">Bestseller</span>}
                        {p.isTrending && <span className="badge bg-purple-100 text-purple-700">Trending</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-50 dark:hover:bg-navy-600 rounded-lg transition-all"><Edit size={15} /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-navy-800 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-700">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              <F label="Name"><input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input col-span-2" /></F>
              <div className="col-span-2"><F label="Name">
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input w-full" placeholder="Product name" />
              </F></div>
              <F label="Category">
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input capitalize w-full">
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </F>
              <F label="Stock">
                <input type="number" min="0" required value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} className="input w-full" placeholder="0" />
              </F>
              <F label="Price (₹)">
                <input type="number" min="0" required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="input w-full" placeholder="0" />
              </F>
              <F label="Discount Price (₹)">
                <input type="number" min="0" value={form.discountPrice} onChange={e => setForm(p => ({ ...p, discountPrice: e.target.value }))} className="input w-full" placeholder="0 = no discount" />
              </F>
              <div className="col-span-2">
                <F label="Short Description">
                  <input value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} className="input w-full" placeholder="One-liner" />
                </F>
              </div>
              <div className="col-span-2">
                <F label="Description">
                  <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input w-full resize-none" placeholder="Full description" />
                </F>
              </div>
              <div className="col-span-2">
                <F label="Image URLs (one per line)">
                  <textarea rows={3} value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))} className="input w-full resize-none font-mono text-xs" placeholder="https://..." />
                </F>
              </div>
              <div className="col-span-2 flex gap-4 flex-wrap">
                {[['isFeatured', 'Featured'], ['isBestseller', 'Bestseller'], ['isTrending', 'Trending']].map(([key, lbl]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                      className={`w-10 h-6 rounded-full transition-all ${form[key] ? 'bg-gold-500' : 'bg-gray-200 dark:bg-navy-600'} relative`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form[key] ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{lbl}</span>
                  </label>
                ))}
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <LoadingSpinner size="sm" /> : <><Check size={16} /> {editing ? 'Save Changes' : 'Create Product'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
