import api from './api';

// Simple in-memory cache for filters
let cachedFilters = { categories: [], brands: [], lastFetched: 0 };
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 minutes

class ProductService {
  // Get all products for admin
  async getAdminProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await api.get(`/products/admin/all?${queryParams.toString()}`);
      
      if (response.data.success) {
        console.log('✅ Admin products fetched:', response.data.data.pagination.total);
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin products:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  }

  // Get public products
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.brand) queryParams.append('brand', params.brand);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.sort) queryParams.append('sort', params.sort);
      
      const response = await api.get(`/products?${queryParams.toString()}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  }

  // Get single product
  async getProduct(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      throw new Error(error.response?.data?.error || 'Product not found');
    }
  }

  // Create product
  async createProduct(productData) {
    try {
      const formData = new FormData();
      
      // Add basic fields
      Object.keys(productData).forEach(key => {
        if (key === 'images') {
          // Handle file uploads
          if (productData.images && productData.images.length > 0) {
            Array.from(productData.images).forEach(file => {
              formData.append('images', file);
            });
          }
        } else if (key === 'specifications' || key === 'tags' || key === 'dimensions') {
          // Stringify objects/arrays
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('✅ Product created:', response.data.data.name);
        // Invalidate cache when a new product is created (might add new categories/brands)
        cachedFilters.lastFetched = 0; 
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (key === 'images' && productData.images) {
          Array.from(productData.images).forEach(file => {
            formData.append('images', file);
          });
        } else if (key === 'specifications' || key === 'tags' || key === 'dimensions') {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.put(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('✅ Product updated:', response.data.data.name);
        // Invalidate cache when a product is updated (might change categories/brands)
        cachedFilters.lastFetched = 0;
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw new Error(error.response?.data?.error || 'Failed to update product');
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/products/${productId}`);
      
      if (response.data.success) {
        console.log('✅ Product deleted');
        // Invalidate cache when a product is deleted
        cachedFilters.lastFetched = 0;
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete product');
    }
  }

  // Get product filters (UPDATED for dynamic brands)
async getFilters() {
  const now = Date.now();
  if (cachedFilters.lastFetched + CACHE_LIFETIME > now) {
    console.log('✅ Filters fetched from cache.');
    return cachedFilters;
  }

  try {
    const categoriesResponse = await api.get('/categories');
    const brandsResponse = await api.get('/brands'); // NEW: Fetch brands from new API
    
    if (categoriesResponse.data.success && brandsResponse.data.success) {
      const newFilters = {
        categories: categoriesResponse.data.data.map(cat => cat.name),
        brands: brandsResponse.data.data.map(brand => brand.name), // NEW: Extract just names
        lastFetched: now,
      };
      cachedFilters = newFilters;
      return newFilters;
    }
    throw new Error('Failed to fetch filters data');
  } catch (error) {
    console.error('❌ Failed to fetch filters:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch filters');
  }
}


  // Manually sync product with Sensay
  async syncWithSensay(productId) {
    try {
      const response = await api.post(`/products/${productId}/sync-sensay`);
      
      if (response.data.success) {
        console.log('✅ Product synced with Sensay');
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to sync with Sensay:', error);
      throw new Error(error.response?.data?.error || 'Failed to sync with Sensay');
    }
  }
}

export default new ProductService();
