import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Minus,
  UploadCloud,
  X,
  Package,
  CheckCircle,
  AlertCircle,
  Activity,
  RefreshCw,
  XCircle
} from 'lucide-react';
import productService from '../../services/productService';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import '../../styles/ProductForm.css';

const ProductForm = ({ productId }) => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: '',
    otherCategory: '',
    brand: '',
    otherBrand: '',
    stock: '',
    images: [],
    existingImages: [],
    newImages: [],
    specifications: [{ key: '', value: '' }],
    tags: [],
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
      unit: 'cm',
    },
    isActive: true,
    isFeatured: false,
    sensayKnowledgeId: null,
    sensayStatus: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [filters, setFilters] = useState({ categories: [], brands: [] });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [isOtherCategorySelected, setIsOtherCategorySelected] = useState(false);
  const [isOtherBrandSelected, setIsOtherBrandSelected] = useState(false);

  const fetchFilters = useCallback(async () => {
    try {
      const data = await productService.getFilters();
      setFilters(data);
    } catch (error) {
      toast.error('Failed to load categories and brands');
      console.error('Failed to fetch filters:', error);
    }
  }, []);

  useEffect(() => {
    const initializeFormData = async () => {
      setFormLoading(true);
      await fetchFilters();
      
      if (productId) {
        try {
          const product = await productService.getProduct(productId);
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || '',
            discount: product.discount || '',
            category: product.category,
            otherCategory: '',
            brand: product.brand,
            otherBrand: '',
            stock: product.stock,
            images: [],
            existingImages: product.images,
            newImages: [],
            specifications: product.specifications
              ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
              : [{ key: '', value: '' }],
            tags: product.tags || [],
            dimensions: product.dimensions || {
              length: '',
              width: '',
              height: '',
              weight: '',
              unit: 'cm',
            },
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            sensayKnowledgeId: product.sensayKnowledgeId,
            sensayStatus: product.sensayStatus,
          });
          setImagePreviews(product.images.map(img => ({ src: img.url, isExisting: true })));
          
          if (product.category && !filters.categories.includes(product.category)) {
            setIsOtherCategorySelected(true);
            setFormData(prev => ({ ...prev, otherCategory: product.category }));
          } else {
            setIsOtherCategorySelected(false);
          }

          if (product.brand && !filters.brands.includes(product.brand)) {
            setIsOtherBrandSelected(true);
            setFormData(prev => ({ ...prev, otherBrand: product.brand }));
          } else {
            setIsOtherBrandSelected(false);
          }

        } catch (error) {
          toast.error(error.message);
          navigate('/admin/products');
        } finally {
          setFormLoading(false);
        }
      } else {
        setFormLoading(false);
      }
    };

    initializeFormData();
  }, [productId, navigate, fetchFilters]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    
    if (name === 'category') {
      setIsOtherCategorySelected(value === 'other');
      if (value !== 'other') {
        setFormData(prev => ({ ...prev, otherCategory: '' }));
      }
    }
    if (name === 'brand') {
      setIsOtherBrandSelected(value === 'other');
      if (value !== 'other') {
        setFormData(prev => ({ ...prev, otherBrand: '' }));
      }
    }
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [`dimensions.${name}`]: '' }));
  };

  const handleSpecChange = (index, e) => {
    const { name, value } = e.target;
    const newSpecs = [...formData.specifications];
    newSpecs[index][name] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const removeSpec = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const handleTagChange = (e) => {
    const value = e.target.value;
    const tagsArray = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...files],
    }));
    const newPreviews = files.map((file) => ({ src: URL.createObjectURL(file), isExisting: false }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => ({ ...prev, images: '' }));
  };

  const removeImage = (indexToRemove, isExisting) => {
    if (isExisting) {
      setFormData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== indexToRemove),
      }));
      setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    } else {
      const currentNewImages = formData.newImages;
      const updatedNewImages = currentNewImages.filter((_, i) => i !== (indexToRemove - formData.existingImages.length));
      setFormData((prev) => ({
        ...prev,
        newImages: updatedNewImages,
      }));
      setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    
    if (!formData.category.trim() && !isOtherCategorySelected) newErrors.category = 'Category is required';
    if (isOtherCategorySelected && !formData.otherCategory.trim()) newErrors.otherCategory = 'New category name is required';
    
    if (!formData.brand.trim() && !isOtherBrandSelected) newErrors.brand = 'Brand is required';
    if (isOtherBrandSelected && !formData.otherBrand.trim()) newErrors.otherBrand = 'New brand name is required';

    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock is required';
    
    if (formData.newImages.length + formData.existingImages.length === 0 && !productId) {
      newErrors.images = 'At least one image is required for a new product';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    setLoading(true);
    try {
      let finalCategory = formData.category;
      if (isOtherCategorySelected && formData.otherCategory.trim()) {
        try {
          const newCategory = await api.post('/categories', { name: formData.otherCategory.trim() });
          finalCategory = newCategory.data.data.name;
          toast.success(`New category "${finalCategory}" created!`);
          await fetchFilters();
        } catch (catError) {
          if (catError.response?.status === 409) {
            finalCategory = formData.otherCategory.trim().toLowerCase();
            toast.info(`Category "${finalCategory}" already exists.`);
          } else {
            console.error('Error creating new category:', catError);
            toast.error(`Failed to create new category: ${catError.response?.data?.error || catError.message}`);
            setLoading(false);
            return;
          }
        }
      }

      let finalBrand = formData.brand;
      if (isOtherBrandSelected && formData.otherBrand.trim()) {
        try {
          const newBrand = await api.post('/brands', { name: formData.otherBrand.trim() });
          finalBrand = newBrand.data.data.name;
          toast.success(`New brand "${finalBrand}" created!`);
          await fetchFilters();
        } catch (brandError) {
          if (brandError.response?.status === 409) {
            finalBrand = formData.otherBrand.trim().toLowerCase();
            toast.info(`Brand "${finalBrand}" already exists.`);
          } else {
            console.error('Error creating new brand:', brandError);
            toast.error(`Failed to create new brand: ${brandError.response?.data?.error || brandError.message}`);
            setLoading(false);
            return;
          }
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.discount ? parseInt(formData.discount) : undefined,
        category: finalCategory,
        brand: finalBrand,
        stock: parseInt(formData.stock),
        specifications: formData.specifications.reduce((acc, spec) => {
          if (spec.key.trim() && spec.value.trim()) {
            acc[spec.key.trim()] = spec.value.trim();
          }
          return acc;
        }, {}),
        tags: formData.tags,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined,
          weight: formData.dimensions.weight ? parseFloat(formData.dimensions.weight) : undefined,
          unit: formData.dimensions.unit,
        },
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images: formData.newImages,
        existingImages: formData.existingImages.map(img => img.url),
      };

      let result;
      if (productId) {
        result = await productService.updateProduct(productId, productData);
        toast.success('Product updated successfully!');
      } else {
        result = await productService.createProduct(productData);
        toast.success('Product created successfully!');
      }
      
      await updateUser(); 

      navigate('/admin/products');
    } catch (error) {
      toast.error(error.message);
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSensaySync = async () => {
    if (!formData.sensayKnowledgeId) {
      toast.error('Product has no Sensay Knowledge ID. Please save the product first.');
      return;
    }
    setSyncing(true);
    try {
      await productService.syncWithSensay(productId);
      setFormData(prev => ({
        ...prev,
        sensayStatus: 'synced',
        sensayLastSynced: new Date().toISOString()
      }));
      await updateUser();
      toast.success('Product re-synced with Sensay AI!');
    } catch (error) {
      toast.error(`Failed to re-sync with Sensay: ${error.message}`);
      setFormData(prev => ({ ...prev, sensayStatus: 'error' }));
    } finally {
      setSyncing(false);
    }
  };

  const getSensayStatusBadge = (status) => {
    switch (status) {
      case 'synced':
        return (
          <span className="status-badge status-success">
            <CheckCircle size={12} />
            Synced
          </span>
        );
      case 'pending':
        return (
          <span className="status-badge status-warning">
            <Activity size={12} className="spinner" />
            Processing
          </span>
        );
      case 'error':
        return (
          <span className="status-badge status-danger">
            <XCircle size={12} />
            Error
          </span>
        );
      default:
        return (
          <span className="status-badge status-secondary">
            <AlertCircle size={12} />
            Unknown
          </span>
        );
    }
  };

  if (formLoading) {
    return <Loading text={productId ? "Loading product data..." : "Preparing product form..."} />;
  }

  return (
    <div className="product-form-container">
      <div className="product-form-header">
        <h1 className="product-form-title">
          {productId ? 'Edit Product' : 'Add New Product'}
        </h1>
        <button
          onClick={() => navigate('/admin/products')}
          className="btn btn-secondary"
        >
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {/* Product Basic Info */}
        <div className="form-section">
          <h2 className="form-section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Category Dropdown & Other Category Input */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'error' : ''}`}
              >
                <option value="">Select a category</option>
                {filters.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
                <option value="other">Other (Specify Below)</option>
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}

              {isOtherCategorySelected && (
                <div className="other-input">
                  <label htmlFor="otherCategory" className="sr-only">Specify Other Category</label>
                  <input
                    type="text"
                    name="otherCategory"
                    id="otherCategory"
                    value={formData.otherCategory}
                    onChange={handleChange}
                    placeholder="Enter new category name"
                    className={`form-input ${errors.otherCategory ? 'error' : ''}`}
                  />
                  {errors.otherCategory && <p className="form-error">{errors.otherCategory}</p>}
                </div>
              )}
            </div>

            {/* Brand Dropdown & Other Brand Input */}
            <div className="form-group">
              <label htmlFor="brand" className="form-label">
                Brand
              </label>
              <select
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={`form-select ${errors.brand ? 'error' : ''}`}
              >
                <option value="">Select a brand</option>
                {filters.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand.charAt(0).toUpperCase() + brand.slice(1)}
                  </option>
                ))}
                <option value="other">Other (Specify Below)</option>
              </select>
              {errors.brand && <p className="form-error">{errors.brand}</p>}

              {isOtherBrandSelected && (
                <div className="other-input">
                  <label htmlFor="otherBrand" className="sr-only">Specify Other Brand</label>
                  <input
                    type="text"
                    name="otherBrand"
                    id="otherBrand"
                    value={formData.otherBrand}
                    onChange={handleChange}
                    placeholder="Enter new brand name"
                    className={`form-input ${errors.otherBrand ? 'error' : ''}`}
                  />
                  {errors.otherBrand && <p className="form-error">{errors.otherBrand}</p>}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price (USD)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                className={`form-input ${errors.price ? 'error' : ''}`}
                min="0.01"
                step="0.01"
              />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="originalPrice" className="form-label">
                Original Price (for discount, optional)
              </label>
              <input
                type="number"
                name="originalPrice"
                id="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="form-input"
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="discount" className="form-label">
                Discount (%) (optional)
              </label>
              <input
                type="number"
                name="discount"
                id="discount"
                value={formData.discount}
                onChange={handleChange}
                className="form-input"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock" className="form-label">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`form-input ${errors.stock ? 'error' : ''}`}
                min="0"
              />
              {errors.stock && <p className="form-error">{errors.stock}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
            ></textarea>
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>
        </div>

        {/* Product Images */}
        <div className="form-section">
          <h2 className="form-section-title">Product Images</h2>
          <div className="image-upload-area">
            <div className="image-upload-content">
              <UploadCloud size={48} />
              <div className="image-upload-text">
                <label
                  htmlFor="file-upload"
                  className="image-upload-label"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                <p>or drag and drop</p>
              </div>
              <p className="image-upload-hint">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
          {errors.images && <p className="form-error">{errors.images}</p>}

          <div className="image-preview-grid">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview">
                <img
                  src={preview.src}
                  alt={`Product preview ${index + 1}`}
                  className="image-preview-img"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index, preview.isExisting)}
                  className="image-remove-btn"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Product Specifications */}
        <div className="form-section">
          <h2 className="form-section-title">Specifications</h2>
          <div className="specifications-list">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="specification-item">
                <input
                  type="text"
                  name="key"
                  placeholder="Key (e.g., Color)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, e)}
                  className="form-input spec-key"
                />
                <input
                  type="text"
                  name="value"
                  placeholder="Value (e.g., Black)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, e)}
                  className="form-input spec-value"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="spec-remove-btn"
                >
                  <Minus size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpec}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={16} />
              Add Specification
            </button>
          </div>
        </div>

        {/* Product Tags */}
        <div className="form-section">
          <h2 className="form-section-title">Tags</h2>
          <input
            type="text"
            name="tags"
            id="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagChange}
            placeholder="Enter tags, separated by commas (e.g., gaming, laptop, portable)"
            className="form-input"
          />
        </div>

        {/* Product Dimensions */}
        <div className="form-section">
          <h2 className="form-section-title">Dimensions & Weight</h2>
          <div className="dimensions-grid">
            <div className="form-group">
              <label htmlFor="length" className="form-label">
                Length
              </label>
              <input
                type="number"
                name="length"
                id="length"
                value={formData.dimensions.length}
                onChange={handleDimensionChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="width" className="form-label">
                Width
              </label>
              <input
                type="number"
                name="width"
                id="width"
                value={formData.dimensions.width}
                onChange={handleDimensionChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="height" className="form-label">
                Height
              </label>
              <input
                type="number"
                name="height"
                id="height"
                value={formData.dimensions.height}
                onChange={handleDimensionChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="weight" className="form-label">
                Weight
              </label>
              <input
                type="number"
                name="weight"
                id="weight"
                value={formData.dimensions.weight}
                onChange={handleDimensionChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group dimensions-unit">
              <label htmlFor="unit" className="form-label">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.dimensions.unit}
                onChange={handleDimensionChange}
                className="form-select"
              >
                <option value="cm">cm / kg</option>
                <option value="in">in / lb</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status & Featured */}
        <div className="form-section">
          <h2 className="form-section-title">Visibility & Promotion</h2>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="form-checkbox"
              />
              <label htmlFor="isActive" className="checkbox-label">
                Active (product is visible to customers)
              </label>
            </div>
            <div className="checkbox-item">
              <input
                id="isFeatured"
                name="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="form-checkbox"
              />
              <label htmlFor="isFeatured" className="checkbox-label">
                Featured (appears on homepage or special sections)
              </label>
            </div>
          </div>
        </div>

        {/* Sensay AI Integration Status */}
        {productId && (
          <div className="form-section">
            <h2 className="form-section-title">Sensay AI Integration</h2>
            <div className="sensay-status">
              {getSensayStatusBadge(formData.sensayStatus)}
              {formData.sensayKnowledgeId && (
                <span className="sensay-knowledge-id">
                  Knowledge ID: <span className="code">{formData.sensayKnowledgeId}</span>
                </span>
              )}
              {formData.sensayLastSynced && (
                <span className="sensay-last-synced">
                  Last Synced: {new Date(formData.sensayLastSynced).toLocaleString()}
                </span>
              )}
              <button
                type="button"
                onClick={handleManualSensaySync}
                disabled={syncing}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw size={16} className={syncing ? 'spinner' : ''} />
                {syncing ? 'Syncing...' : 'Manual Sync'}
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <div className="loading-spinner loading-small"></div>
            ) : (
              productId ? 'Save Changes' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
