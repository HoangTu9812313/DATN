import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FieldList from "./pages/FieldList";
import FieldDetail from "./pages/FieldDetail";
import Booking from "./pages/Booking";
import Checkout from "./pages/Checkout";

/* IMPORT PROFILE */
import Profile from "./pages/Profile";

/* IMPORT ADMIN */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFields from "./pages/admin/AdminFields";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminVoucher from "./pages/admin/AdminVouchers";
import AdminNotifications from "./pages/admin/AdminNotifications";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}

        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        {/* FIELD LIST */}

        <Route
          path="/fields"
          element={
            <>
              <Navbar />
              <FieldList />
              <Footer />
            </>
          }
        />

        {/* FIELD DETAIL */}

        <Route
          path="/fields/:id"
          element={
            <>
              <Navbar />
              <FieldDetail />
              <Footer />
            </>
          }
        />

        {/* BOOKING */}

        <Route
          path="/booking"
          element={
            <>
              <Navbar />
              <Booking />
              <Footer />
            </>
          }
        />

        {/* CHECKOUT */}

        <Route
          path="/checkout"
          element={
            <>
              <Navbar />
              <Checkout />
              <Footer />
            </>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <>
              <Navbar />
              <Profile />
              <Footer />
            </>
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route
          path="/admin/AdminFields"
          element={<AdminFields />}
        />
        <Route
          path="/admin/AdminBookings"
          element={<AdminBookings />}
        />
        <Route
          path="/admin/AdminReviews"
          element={<AdminReviews />}
        />
        <Route
          path="/admin/AdminVouchers"
          element={<AdminVoucher />}
        />
        <Route
          path="/admin/AdminUsers"
          element={<AdminUsers />}
        />
        <Route
          path="/admin/AdminNotifications"
          element={<AdminNotifications />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;