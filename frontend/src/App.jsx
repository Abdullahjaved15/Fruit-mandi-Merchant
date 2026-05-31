import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction, loginSuccess } from './redux/authSlice';
import { 
    addToCart as addToCartAction, 
    removeFromCart as removeFromCartAction, 
    updateQuantity as updateQuantityAction, 
    clearCart as clearCartAction 
} from './redux/cartSlice';
import { Menu, LogOut, LayoutDashboard, ShoppingBag, Package, Settings, User, Leaf } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Beyparis from './pages/Beyparis';
import Ledger from './pages/Ledger';
import Inventory from './pages/Inventory';
import HR from './pages/HR';
import Finance from './pages/Finance';
import Commission from './pages/Commission';
import Customers from './pages/Customers';
import Udhaar from './pages/Udhaar';
import Copybooks from './pages/Copybooks';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import StoreHome from './pages/Store/StoreHome';
import StoreProducts from './pages/Store/StoreProducts';
import StoreCart from './pages/Store/StoreCart';
import AdminLogin from './pages/AdminLogin';
import StoreOrders from './pages/Store/StoreOrders';
import AdminOrders from './pages/AdminOrders';
import ShopSales from './pages/ShopSales';
import Settlements from './pages/Settlements';

const UnderConstruction = ({ title }) => (
  <div className="page-content" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
    <div className="clay-card">
      <div className="logo-icon" style={{ background: 'var(--accent)', marginBottom: '1rem', marginInline: 'auto' }}>
        <LayoutDashboard style={{ color: 'white' }} />
      </div>
      <h2>Under Construction</h2>
      <p style={{ color: 'var(--text-muted)' }}>The <b>{title}</b> module is currently being built.</p>
      <button className="clay-button" style={{ marginTop: '1rem' }} onClick={() => window.history.back()}>Go Back</button>
    </div>
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const authData = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Pages that don't need a sidebar or persistent UI header
  const publicPages = ['/', '/login', '/__portal'];
  const isPublicPage = publicPages.includes(location.pathname);
  const isStorePage = location.pathname.startsWith('/store');
  const isAdminPage = !isPublicPage && !isStorePage && authData?.role === 'admin';

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const logout = () => {
    dispatch(logoutAction());
    navigate('/');
  };

  const handleLogin = (data) => {
    dispatch(loginSuccess(data));
    if (data.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/store');
    }
  };

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname]);

  const [favorites, setFavorites] = useState([]);

  const addToCart = (product) => {
    dispatch(addToCartAction(product));
  };

  const removeFromCart = (id) => {
    dispatch(removeFromCartAction(id));
  };

  const updateQuantity = (id, amount) => {
      const item = cartItems.find(i => i.id === id);
      if (item) {
          dispatch(updateQuantityAction({ id, quantity: item.quantity + amount }));
      }
  };

  const clearCart = () => dispatch(clearCartAction());

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const isFav = prev.find(p => p.id === product.id);
      if (isFav) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div id="app" className={`app-container ${isPublicPage ? 'sidebar-hidden' : ''} ${!isPublicPage && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Nav Toggle — only shown on mobile when sidebar is fully off-screen */}
      {!isPublicPage && sidebarCollapsed && (
        <button
          id="nav-toggle"
          className="mobile-nav-toggle"
          onClick={toggleSidebar}
          title="Show sidebar"
        >
          <Leaf size={24} />
        </button>
      )}

      {/* Sidebar for all authenticated users */}
      {!isPublicPage && (
        <Sidebar
          isOpen={!sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          userRole={authData?.role || 'user'}
          activeSection={isStorePage ? 'store' : 'admin'}
          logout={logout}
        />
      )}

      <main className="main-viewport" id="content-area">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/__portal" element={<AdminLogin onLogin={handleLogin} />} />

          {/* Admin Routes */}
          <Route
            path="/dashboard"
            element={authData?.role === 'admin' ? <Dashboard /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/beyparis"
            element={authData?.role === 'admin' ? <Beyparis /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/shop-sales"
            element={authData?.role === 'admin' ? <ShopSales /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/settlements"
            element={authData?.role === 'admin' ? <Settlements /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/ledger"
            element={authData?.role === 'admin' ? <Ledger /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/customers"
            element={authData?.role === 'admin' ? <Customers /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/udhaar"
            element={authData?.role === 'admin' ? <Udhaar /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/copybooks"
            element={authData?.role === 'admin' ? <Copybooks /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/reports"
            element={authData?.role === 'admin' ? <Reports /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/inventory"
            element={authData?.role === 'admin' ? <Inventory /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/hr"
            element={authData?.role === 'admin' ? <HR /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/finance"
            element={authData?.role === 'admin' ? <Finance /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/commission"
            element={authData?.role === 'admin' ? <Commission /> : <Navigate to="/__portal" />}
          />
          <Route
            path="/admin/orders"
            element={authData?.role === 'admin' ? <AdminOrders /> : <Navigate to="/__portal" />}
          />
          <Route
             path="/settings"
             element={authData?.role === 'admin' ? <SettingsPage authData={authData} /> : <Navigate to="/__portal" />}
           />
          <Route
            path="/store/profile"
            element={authData?.role === 'user' ? <SettingsPage authData={authData} /> : <Navigate to="/login" />}
          />

          {/* Store Routes */}
          <Route
            path="/store"
            element={
              authData
                ? <StoreHome authData={authData} cartItems={cartItems} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />
                : <Navigate to="/login" />
            }
          />
          <Route
            path="/store/products"
            element={
              authData
                ? <StoreProducts cartItems={cartItems} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />
                : <Navigate to="/login" />
            }
          />
          <Route
            path="/store/cart"
            element={
              authData
                ? <StoreCart cartItems={cartItems} removeFromCart={removeFromCart} updateQuantity={updateQuantity} clearCart={clearCart} />
                : <Navigate to="/login" />
            }
          />
          <Route
            path="/store/orders"
            element={
              authData?.role === 'user'
                ? <StoreOrders cartCount={cartCount} />
                : <Navigate to="/login" />
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
