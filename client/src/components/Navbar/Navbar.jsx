import { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../Modal/Modal';
import styles from './Navbar.module.css';

const Navbar = ({ onLogout, onToggleSidebar, showMobileLogout = false }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    toast.info('Logged out successfully');
    onLogout();
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.navbarContent}>
            <div className={styles.navbarBrand}>
              <div className={styles.brandContent}>
                <div className={styles.brandIcon}>🛒</div>
                <h2>ProductStore</h2>
              </div>
            </div>
            
            <div className={styles.navbarActions}>
              {/* Desktop logout button */}
              <button 
                onClick={handleLogoutClick} 
                className={`${styles.logoutButton} ${styles.desktopOnly}`}
              >
                <span className={styles.logoutIcon}>👤</span>
                Logout
              </button>
              
              {/* Mobile hamburger button */}
              <button 
                onClick={onToggleSidebar} 
                className={`${styles.hamburgerButton} ${styles.mobileOnly}`}
                aria-label="Toggle sidebar"
              >
                <div className={styles.hamburgerLines}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Modal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        type="info"
        confirmText="Logout"
        cancelText="Cancel"  
      />
    </>
  );
};

export default Navbar;