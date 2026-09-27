import { createBrowserRouter, Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProductListPage } from '../pages/products/ProductListPage';
import { ProductFormPage } from '../pages/products/ProductFormPage';
import { OrderListPage } from '../pages/orders/OrderListPage';
import { OrderCreatePage } from '../pages/orders/OrderCreatePage';
import { OrderDetailPage } from '../pages/orders/OrderDetailPage';
import { PaymentPage } from '../pages/payments/PaymentPage';
import { ReceiptPage } from '../pages/receipts/ReceiptPage';
import { StockPage } from '../pages/inventory/StockPage';
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { element: <MainLayout />, errorElement: <div className="empty"><h1>ไม่สามารถแสดงหน้านี้ได้</h1><p>ลองโหลดหน้าใหม่อีกครั้ง</p><a href="/">กลับหน้าหลัก</a></div>, children: [
    { path: '/', element: <DashboardPage /> },
    { path: '/products', element: <ProductListPage /> },
    { path: '/products/new', element: <ProductFormPage key="new" /> },
    { path: '/products/:id/edit', element: <ProductFormPage /> },
    { path: '/orders', element: <OrderListPage /> },
    { path: '/orders/new', element: <OrderCreatePage /> },
    { path: '/orders/:id', element: <OrderDetailPage /> },
    { path: '/payments/:orderId', element: <PaymentPage /> },
    { path: '/receipts', element: <ReceiptPage /> },
    { path: '/receipts/:id', element: <ReceiptPage /> },
    { path: '/inventory', element: <StockPage /> },
    { path: '*', element: <div className="empty"><h1>404 · ไม่พบหน้านี้</h1><Link to="/" className="button primary">กลับหน้าหลัก</Link></div> },
  ] },
]);
