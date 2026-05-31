import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  setField,
  resetForm,
  saveDraft,
  restoreDraft,
  submitProduct,
  loadProductForEdit,
} from '../../store/slices/productFormSlice';
import BasicInfoSection from '../../components/admin/product/sections/BasicInfoSection';
import MediaSection from '../../components/admin/product/sections/MediaSection';
import DescriptionSection from '../../components/admin/product/sections/DescriptionSection';
import VariantsSection from '../../components/admin/product/sections/VariantsSection';
import SEOSection from '../../components/admin/product/sections/SEOSection';
import StatusSection from '../../components/admin/product/sections/StatusSection';
import InventorySection from '../../components/admin/product/sections/InventorySection';
import PricingSection from '../../components/admin/product/sections/PricingSection';
import ShippingSection from '../../components/admin/product/sections/ShippingSection';
import TagsSection from '../../components/admin/product/sections/TagsSection';
import AutoSaveIndicator from '../../components/admin/product/ui/AutoSaveIndicator';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Save, Eye, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AddProductPage = ({ isEditMode = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { form, isDirty, lastSaved, isSaving, isSubmitting, submitErrors, isLoadingEdit } =
    useSelector((state) => state.productForm);

  const [isUploading, setIsUploading] = React.useState(false);

  // Load existing data in Edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(loadProductForEdit(id));
    } else {
      dispatch(resetForm());
      dispatch(restoreDraft());
    }
  }, [isEditMode, id, dispatch]);

  // Autosave interval
  useEffect(() => {
    if (isEditMode) return; // Don't autosave in edit mode to avoid overwriting production accidentally

    const interval = setInterval(() => {
      if (isDirty) {
        dispatch(saveDraft());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isDirty, isEditMode, dispatch]);

  const handleFieldChange = (field, value) => {
    dispatch(setField({ field, value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Custom UI validations
    if (!form.name.trim()) return toast.error('Product Name is required');
    if (!form.sku.trim()) return toast.error('SKU is required');
    if (!form.category) return toast.error('Category is required');
    if (!form.shortDescription.trim()) return toast.error('Short Description is required');

    if (!form.hasVariants) {
      if (!form.price || Number(form.price) <= 0) {
        return toast.error('MRP Price is required and must be greater than 0');
      }
    } else {
      if (form.variants.length === 0) {
        return toast.error('You enabled variants but added no options or matrix rows');
      }
    }

    try {
      const editId = isEditMode ? id : null;
      const res = await dispatch(submitProduct({ data: form, editId })).unwrap();
      toast.success(isEditMode ? 'Product updated successfully' : 'Product created successfully');
      navigate('/admin/products');
    } catch (err) {
      const msg = typeof err === 'object' ? Object.values(err).join(', ') : err;
      toast.error(msg || 'Failed to save product');
    }
  };

  if (isLoadingEdit) {
    return (
      <div className="flex justify-center py-40">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header Sticky Navbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-surface-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-surface-800 rounded-xl transition-all cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditMode ? `Updating unique SKU: ${form.sku}` : 'Fill in all catalog details to publish new inventory'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} isDirty={isDirty} />

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="btn-primary px-5 py-2.5 font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-primary-500/20"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? 'Update Product' : 'Publish Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Split Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Double Columns: Content Inputs */}
        <div className="lg:col-span-2 space-y-8">
          <BasicInfoSection form={form} onChange={handleFieldChange} />
          <MediaSection
            form={form}
            onChange={handleFieldChange}
            onUploadingChange={setIsUploading}
          />
          <DescriptionSection form={form} onChange={handleFieldChange} />
          <VariantsSection form={form} onChange={handleFieldChange} />
          <SEOSection form={form} onChange={handleFieldChange} />
        </div>

        {/* Right Column: Settings Sidebars */}
        <div className="space-y-8">
          <StatusSection form={form} onChange={handleFieldChange} />
          <PricingSection form={form} onChange={handleFieldChange} />
          <InventorySection form={form} onChange={handleFieldChange} />
          <ShippingSection form={form} onChange={handleFieldChange} />
          <TagsSection form={form} onChange={handleFieldChange} />
        </div>
      </div>
    </form>
  );
};

export default AddProductPage;
