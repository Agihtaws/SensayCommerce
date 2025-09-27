import React from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';

const EditProductPage = () => {
  const { id } = useParams(); // Get product ID from URL
  return <ProductForm productId={id} />;
};

export default EditProductPage;
