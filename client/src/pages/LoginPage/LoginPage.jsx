import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'admin@gmail.com',
    password: 'admin123'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginImageSection}>
          <div className={styles.loginImageContent}>
            <h1>ProductStore</h1>
            <p>Professional inventory management for modern businesses</p>
          </div>
        </div>
        
        <div className={styles.loginFormSection}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <h2>Sign In</h2>
              <p>Access your professional dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={styles.input}
                />
              </div>
              
              <button type="submit" className={styles.loginBtn} disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            
            <div className={styles.loginFooter}>
              <p>Demo: email : admin@gmail.com and password : admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;