import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import LoginPage from './pages/LoginPage/LoginPage';
import ProductListPage from './pages/ProductListPage/ProductListPage';
import 'react-toastify/dist/ReactToastify.css';
import styles from './App.module.css';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className={styles.app}>
      {isAuthenticated ? (
        <ProductListPage onLogout={logout} />
      ) : (
        <LoginPage />
      )}
      
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName={styles.toast}
        bodyClassName={styles.toastBody}
        progressClassName={styles.toastProgress}
      />
    </div>
  );
}

export default App;