import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import About from './pages/About';
import Admission from './pages/Admission';
import StudentPortal from './pages/StudentPortal';
import InstructorPortal from './pages/InstructorPortal';
import JobPlacement from './pages/JobPlacement';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetail from './pages/CourseDetail';
import Invoice from './pages/Invoice';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="about" element={<About />} />
            <Route path="admission" element={<Admission />} />
            <Route path="invoice" element={<Invoice />} />
            <Route path="pay" element={<Payment amount={1000} productId="course123" />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-fail" element={<PaymentFail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="student-portal" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPortal />
              </ProtectedRoute>
            } />
            <Route path="instructor-portal" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorPortal />
              </ProtectedRoute>
            } />
            <Route path="placement" element={<JobPlacement />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="contact" element={<Contact />} />

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
