import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, CartProvider, ToastProvider } from './contexts';
import Header from './sections/Header';
import Footer from './sections/Footer';
import Hero from './sections/Hero';
import About from './sections/About';
import CategoryShowcase from './sections/CategoryShowcase';
import ProductList from './sections/ProductList';
import Testimonials from './sections/Testimonials';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Search from './pages/Search';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import AiChat from './pages/AiChat';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';
import Dashboard from './pages/admin/Dashboard';
import AdminUserList from './pages/admin/UserList';
import AdminProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import AdminOrderList from './pages/admin/OrderList';
import AdminCategoryList from './pages/admin/CategoryList';
import AdminReviewList from './pages/admin/ReviewList';
import AdminRefundList from './pages/admin/RefundList';
import './App.css';

// 首页组件
function Home() {
  return (
    <>
      <Hero />
      <About />
      <CategoryShowcase />
      <ProductList />
      <Testimonials />
    </>
  );
}

// 主布局（带Header和Footer）
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// 简化布局（带Header，无Footer）
function CleanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

// 认证布局（无Header/Footer）
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">{children}</main>
  );
}

// 受保护路由
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: 稍后集成 useAuth
  // const { isAuthenticated, isLoading } = useAuth();
  // if (isLoading) return <div>Loading...</div>;
  // if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// 游客路由（已登录用户不能访问）
function GuestRoute({ children }: { children: React.ReactNode }) {
  // TODO: 稍后集成 useAuth
  // const { isAuthenticated, isLoading } = useAuth();
  // if (isLoading) return <div>Loading...</div>;
  // if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* 主布局路由 */}
              <Route
                path="/"
                element={
                  <MainLayout>
                    <Home />
                  </MainLayout>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <MainLayout>
                    <ProductDetail />
                  </MainLayout>
                }
              />
              <Route
                path="/cart"
                element={
                  <CleanLayout>
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  </CleanLayout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <CleanLayout>
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  </CleanLayout>
                }
              />
              <Route
                path="/profile/*"
                element={
                  <CleanLayout>
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  </CleanLayout>
                }
              />
              <Route
                path="/search"
                element={
                  <MainLayout>
                    <Search />
                  </MainLayout>
                }
              />
              <Route
                path="/orders"
                element={
                  <CleanLayout>
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  </CleanLayout>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <CleanLayout>
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  </CleanLayout>
                }
              />
              <Route
                path="/ai-chat"
                element={
                  <CleanLayout>
                    <ProtectedRoute>
                      <AiChat />
                    </ProtectedRoute>
                  </CleanLayout>
                }
              />

              {/* 管理后台路由 */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<AdminUserList />} />
                <Route path="categories" element={<AdminCategoryList />} />
                <Route path="products" element={<AdminProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                <Route path="orders" element={<AdminOrderList />} />
                <Route path="reviews" element={<AdminReviewList />} />
                <Route path="refunds" element={<AdminRefundList />} />
              </Route>

              {/* 认证路由 */}
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  </AuthLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthLayout>
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  </AuthLayout>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <AuthLayout>
                    <GuestRoute>
                      <ForgotPassword />
                    </GuestRoute>
                  </AuthLayout>
                }
              />

              {/* 404 重定向到首页 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
