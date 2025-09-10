import styles from './FilterSidebar.module.css';

const FilterSidebar = ({ 
  categories, 
  selectedCategories, 
  onCategoryChange, 
  sortBy, 
  onSortChange,
  isOpen,
  onToggle,
  onLogout
}) => {
  const handleCategoryToggle = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    onCategoryChange(updatedCategories);
  };

  return (
    <>
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.active : ''}`}
        onClick={onToggle}
      />
      
      <div className={`${styles.filterSidebar} ${isOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h3>Filters & Sort</h3>
            <button className={styles.mobileClose} onClick={onToggle}>×</button>
          </div>
          
          <div className={styles.sidebarSection}>
            <h4>Sort by Price</h4>
            <div className={styles.sortOptions}>
              <label className={styles.sortOption}>
                <input
                  type="radio"
                  name="sort"
                  value=""
                  checked={sortBy === ''}
                  onChange={(e) => onSortChange(e.target.value)}
                />
                <span className={styles.radioMark}></span>
                <span>Default</span>
              </label>
              <label className={styles.sortOption}>
                <input
                  type="radio"
                  name="sort"
                  value="low-to-high"
                  checked={sortBy === 'low-to-high'}
                  onChange={(e) => onSortChange(e.target.value)}
                />
                <span className={styles.radioMark}></span>
                <span>Price: Low to High</span>
              </label>
              <label className={styles.sortOption}>
                <input
                  type="radio"
                  name="sort"
                  value="high-to-low"
                  checked={sortBy === 'high-to-low'}
                  onChange={(e) => onSortChange(e.target.value)}
                />
                <span className={styles.radioMark}></span>
                <span>Price: High to Low</span>
              </label>
            </div>
          </div>
          
          <div className={styles.sidebarSection}>
            <h4>Filter by Category</h4>
            <div className={styles.filterContent}>
              {categories.map(category => (
                <label key={category} className={styles.filterCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <span className={styles.checkmark}></span>
                  <span className={styles.categoryLabel}>{category}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.mobileLogoutSection}>
            <button onClick={onLogout} className={styles.mobileLogoutButton}>
              <span className={styles.logoutIcon}>👤</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;