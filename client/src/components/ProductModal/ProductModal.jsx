import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import styles from './ProductModal.module.css';

const ProductModal = ({ isOpen, onClose, onSubmit, product, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: null,
    imagePreview: ''
  });

  const categories = ['Electronics', 'Sports', 'Home & Kitchen'];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        category: product.category,
        image: null,
        imagePreview: product.image
      });
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        image: null,
        imagePreview: ''
      });
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData({
            ...formData,
            image: file,
            imagePreview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent submission if already loading
    
    // For new products, require an image. For editing, image is optional (can keep existing)
    if (!formData.name.trim() || !formData.price || !formData.description.trim() || 
        !formData.category || (!formData.image && !product && !formData.imagePreview)) {
      toast.error('Please fill in all fields and select an image');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const productData = {
      ...formData,
      price: price,
      id: product ? (product._id || product.id) : Date.now(),
      image: formData.image // Pass the actual file object, not the preview
    };

    onSubmit(productData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={styles.input}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="3"
              className={styles.textarea}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="image">Product Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className={styles.fileInput}
            />
            {(formData.imagePreview || (product && product.image)) && (
              <div className={styles.imagePreview}>
                <img src={formData.imagePreview || product.image} alt="Preview" />
                {product && !formData.image && (
                  <p className={styles.imageNote}>Current image (select new image to replace)</p>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.modalActions}>
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  {product ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  product: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default ProductModal;