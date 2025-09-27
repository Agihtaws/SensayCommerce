import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import { Package, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getFilters(); // Reusing getFilters to get categories
        setCategories(data.categories);
      } catch (error) {
        toast.error('Failed to load categories.');
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <Loading text="Loading categories..." />;
  }

  if (categories.length === 0) {
    return (
      <div className="categories-empty-state-container">
        <Folder className="categories-empty-state-icon" />
        <h3 className="categories-empty-state-title">No categories found</h3>
        <p className="categories-empty-state-message">
          It looks like there are no product categories defined yet.
        </p>
        <Link
          to="/products"
          className="btn btn-primary categories-empty-state-btn"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="categories-page-container">
      <h1 className="categories-page-title">Product Categories</h1>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            key={category}
            to={`/products?category=${encodeURIComponent(category)}`}
            className="category-card"
          >
            <div className="category-card-content">
              <Folder className="category-icon" />
              <h2 className="category-title">
                {category}
              </h2>
              <p className="category-description">Explore products in {category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
