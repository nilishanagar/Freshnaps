import React from 'react';
import AddProductPage from './AddProductPage';

/**
 * EditProductPage wrapper component which renders AddProductPage in edit mode.
 */
const EditProductPage = () => {
  return <AddProductPage isEditMode={true} />;
};

export default EditProductPage;
