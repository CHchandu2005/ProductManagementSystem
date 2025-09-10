import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import Navbar from '../../components/Navbar/Navbar';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductModal from '../../components/ProductModal/ProductModal';
import Modal from '../../components/Modal/Modal';
import styles from './ProductListPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductListPage = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const categories = ['Electronics', 'Sports', 'Home & Kitchen','Fashion','Toys'];

  // ✅ Single data loader
  const loadProducts = useCallback(
    async (filters = {}) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Unauthorized! Please login again.');
          return;
        }

        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.categories) queryParams.append('categories', filters.categories);
        if (filters.sort) queryParams.append('sort', filters.sort);
        if (filters.order) queryParams.append('order', filters.order);
        queryParams.append('page', filters.page || 1);
        queryParams.append('limit', filters.limit || limit);

        const url = `${API_BASE_URL}/api/products?${queryParams.toString()}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          setPage(Number(data.page) || 1);
          setTotalPages(Number(data.totalPages) || 1);
          setTotalItems(Number(data.totalItems) || 0);
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters = {
        search: searchTerm.trim() || undefined,
        categories:
          selectedCategories.length > 0
            ? selectedCategories.join(',')
            : undefined,
        sort: sortBy === 'low-to-high' || sortBy === 'high-to-low' ? 'price' : undefined,
        order:
          sortBy === 'low-to-high'
            ? 'asc'
            : sortBy === 'high-to-low'
            ? 'desc'
            : undefined,
        page,
        limit,
      };
      loadProducts(filters);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategories, sortBy, page, limit, loadProducts]);

  // Handlers
  const handleSearchChange = (value) => setSearchTerm(value);
  const handleCategoryChange = (categories) => {
    setPage(1); // reset page on filter change
    setSelectedCategories(categories);
  };
  const handleSortChange = (sort) => {
    setPage(1); // reset page on sort change
    setSortBy(sort);
  };

  // Pagination handlers
  const goToPage = (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
    setPage(targetPage);
  };
  const goPrev = () => goToPage(page - 1);
  const goNext = () => goToPage(page + 1);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    setDeletingProductId(productId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${API_BASE_URL}/api/products/${deletingProductId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      toast.success('Product deleted successfully!');
      await loadProducts({
        search: searchTerm,
        categories: selectedCategories.join(','),
        sort: sortBy,
        page,
        limit,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeletingProductId(null);
    }
  };

  const handleProductSubmit = async (productData) => {
    const isEdit = Boolean(editingProduct);
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();

      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('description', productData.description);
      formData.append('category', productData.category);

      if (productData.image && productData.image instanceof File) {
        formData.append('image', productData.image);
      }

      const url = isEdit
        ? `${API_BASE_URL}/api/products/${editingProduct._id || editingProduct.id}`
        : `${API_BASE_URL}/api/products`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      toast.success(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadProducts({ search: searchTerm, categories: selectedCategories.join(','), sort: sortBy, page, limit });
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleLogoutFromSidebar = () => {
    setIsSidebarOpen(false);
    onLogout();
  };

  return (
    <div className={styles.productListPage}>
      <Navbar onLogout={onLogout} onToggleSidebar={handleToggleSidebar} />

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          {/* <span className={styles.breadcrumbItem}>Dashboard</span>
          <span className={styles.breadcrumbSeparator}>/</span> */}
          {/* <span className={styles.breadcrumbItem}>Products</span> */}
        </div>

        <div className={styles.headerSection}>
          <div className={styles.headerRow}>
            <div className={styles.pageTitle}>
              <h1>Products</h1>
              <p>Manage your product inventory with precision</p>
            </div>
            <button onClick={handleAddProduct} className={styles.addButton}>
              <span className={styles.addIcon}>+</span> Add Product
            </button>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 
                      6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79
                      l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 
                      9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentLayout}>
          <div className={styles.sidebar}>
            <FilterSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              isOpen={isSidebarOpen}
              onToggle={handleToggleSidebar}
              onLogout={handleLogoutFromSidebar}
            />
          </div>

          <div className={styles.mainContent}>
            {isLoading && products.length === 0 ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No products found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                  <button onClick={goPrev} disabled={page <= 1} className={styles.addButton} style={{ padding: '8px 12px' }} aria-label="Previous page">
                    ◀
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={styles.addButton}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: p === page ? '#1f2937' : undefined,
                          color: p === page ? '#fff' : undefined,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  <button onClick={goNext} disabled={page >= totalPages} className={styles.addButton} style={{ padding: '8px 12px' }} aria-label="Next page">
                    ▶
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px', color: '#6b7280' }}>
                  Showing page {page} of {totalPages} ({totalItems} items)
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }
        }}
        onSubmit={handleProductSubmit}
        product={editingProduct}
        isLoading={isSubmitting}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeletingProductId(null);
          }
        }}
        type="danger"
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

ProductListPage.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default ProductListPage;
