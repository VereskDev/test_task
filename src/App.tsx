import { Route, Routes, Navigate } from 'react-router-dom';
import { CartsListPage } from './pages/CartsListPage';
import { CartDetailsPage } from './pages/CartDetailsPage';
import { AppLayout } from './components/AppLayout';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/carts" replace />} />
        <Route path="/carts" element={<CartsListPage />} />
        <Route path="/carts/:id" element={<CartDetailsPage />} />
        <Route path="*" element={<Navigate to="/carts" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;

