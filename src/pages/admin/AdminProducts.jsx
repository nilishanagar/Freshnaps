import React, { useEffect, useState } from 'react';


const CATEGORIES = ['mattress','pillow','bedsheet','cushion','comforter','blanket','accessory'];

const emptyForm = {
  name: '', description: '', shortDescription: '', category: 'mattress',
  price: '', discountPrice: '', stock: '', images: '',
  isFeatured: false, isBestseller: false, isTrending: false,
};


import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services';
import { Plus, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${(p || 0).toLocaleString('en-IN')}`;

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.getProducts()
      .then(res => setProducts(res.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500">{products.length} total products</p>
        </div>
        <button onClick={() => navigate('/admin/products/new')} className="btn-primary flex items-center gap-2 cursor-pointer">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>
      ) : (
        <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 dark:bg-surface-800 text-xs font-semibold text-gray-400 uppercase">
                <tr className="border-b border-gray-100 dark:border-surface-700">
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">SKU / Barcode</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-surface-800">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-surface-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={
                            p.images?.[0]?.url 
                              ? (p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`)
                              : (typeof p.images?.[0] === 'string' ? p.images[0] : '/placeholder.png')
                          } 
                          alt={p.name} 
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">{p.name}</span>
                          <span className="text-[10px] text-gray-400 capitalize block mt-0.5">{p.brand || 'No brand'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-500">
                      <div>{p.sku || 'No SKU'}</div>
                      {p.barcode && <div className="text-[10px] text-gray-400 mt-0.5">{p.barcode}</div>}
                    </td>
                    <td className="p-4 text-gray-500 capitalize">{p.category?.name || p.categoryLegacy || 'Uncategorized'}</td>
                    <td className="p-4">
                      <span className="font-semibold">{formatPrice(p.discountPrice || p.price)}</span>
                      {p.discountPrice > 0 && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.price)}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${p.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{p.stock}</span>
                    </td>
                    <td className="p-4 capitalize">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'published' 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                          : p.status === 'archived'
                          ? 'bg-gray-150 text-gray-600 dark:bg-surface-950 dark:text-gray-400'
                          : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {p.status || 'draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/admin/products/${p._id}/edit`)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-surface-700 rounded-lg transition-all cursor-pointer"><Edit size={15} /></button>
                        <button onClick={() => handleDeleteClick(p._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Premium Custom Confirm Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-surface-800 text-center space-y-4">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Delete Product?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to delete this product? This action will archive it from active catalog visibility.</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDeletingId(null)} className="btn-secondary flex-1 py-2 rounded-xl cursor-pointer">Cancel</button>
              <button 
                type="button" 
                onClick={async () => {
                  try {
                    await adminService.deleteProduct(deletingId);
                    toast.success('Product deleted successfully');
                    setDeletingId(null);
                    load();
                  } catch {
                    toast.error('Failed to delete product');
                  }
                }} 
                className="btn-primary bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 flex-1 py-2 rounded-xl cursor-pointer text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;


