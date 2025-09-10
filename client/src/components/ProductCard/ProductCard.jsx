import styles from './ProductCard.module.css';

const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className={styles.productCard}>
      <div className={styles.productImage}>
        <img src={product.image} alt={product.name} />
        <div className={styles.productOverlay}>
          <button 
            onClick={() => onEdit(product)}
            className={`${styles.overlayBtn} ${styles.editBtn}`}
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(product._id || product.id)}
            className={`${styles.overlayBtn} ${styles.deleteBtn}`}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productCategory}>{product.category}</p>
        <p className={styles.productDescription}>{product.description}</p>
        <div className={styles.productPrice}>₹{product.price.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default ProductCard;