import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ApiList from './pages/ApiList';

import ApiDetail from './pages/ApiDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApiForm from './pages/ApiForm';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Community from './pages/Community';
import Categories from './pages/Categories';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="apis" element={<ApiList />} />
            <Route path="apis/:id" element={<ApiDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<Admin />} />
            <Route path="add-api" element={<ApiForm />} />
            <Route path="edit-api/:id" element={<ApiForm />} />
            <Route path="profile" element={<Profile />} />
            <Route path="saved" element={<Collections />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/:id" element={<CollectionDetail />} />
            <Route path="community" element={<Community />} />
            <Route path="categories" element={<Categories />} />
            <Route path="verify-email/:token" element={<VerifyEmail />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
