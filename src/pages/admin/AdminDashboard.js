import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

import {
  FaFutbol,
  FaChartBar,
  FaClipboardList,
  FaUsers,
  FaComments,
  FaTicketAlt,
  FaBell,
  FaMoneyBillWave
} from "react-icons/fa";

import { Link } from "react-router-dom";
import API from "../../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [fields, setFields] = useState([]);
// ================= DOANH THU =================

const totalRevenue = bookings.reduce(
  (sum, booking) =>
    sum +
    Number(
      booking.final_amount ||
      booking.total_amount ||
      booking.amount ||
      booking.totalPrice ||
      0
    ),
  0
);

const today = new Date()
  .toISOString()
  .split("T")[0];

const todayRevenue = bookings
  .filter(
    (booking) =>
      (booking.booking_date ||
        booking.date ||
        "")
          .toString()
          .slice(0, 10) === today
  )
  .reduce(
    (sum, booking) =>
      sum +
      Number(
        booking.final_amount ||
        booking.total_amount ||
        booking.amount ||
        booking.totalPrice ||
        0
      ),
    0
  );

const currentMonth =
  new Date().getMonth();

const currentYear =
  new Date().getFullYear();

const monthRevenue = bookings
  .filter((booking) => {
    const d = new Date(
      booking.booking_date ||
      booking.date
    );

    return (
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  })
  .reduce(
    (sum, booking) =>
      sum +
      Number(
        booking.final_amount ||
        booking.total_amount ||
        booking.amount ||
        booking.totalPrice ||
        0
      ),
    0
  );
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = userInfo?.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [
        fieldsRes,
        usersRes,
        bookingsRes,
      ] = await Promise.all([
        API.get("/fields"),
        API.get("/auth/users", config),
        API.get("/bookings/all", config),
      ]);

      // ===== FIELDS =====
      const fieldsData = Array.isArray(
        fieldsRes.data
      )
        ? fieldsRes.data
        : fieldsRes.data?.fields || [];

      // ===== USERS =====
      const usersData = Array.isArray(
        usersRes.data
      )
        ? usersRes.data
        : usersRes.data?.users || [];

      // ===== BOOKINGS =====
      const bookingsData = Array.isArray(
        bookingsRes.data
      )
        ? bookingsRes.data
        : bookingsRes.data?.bookings || [];

      console.log(
        "BOOKINGS DATA:",
        bookingsData
      );

      setFields(fieldsData);
      setUsers(usersData);
      setBookings(bookingsData);

    } catch (error) {
      console.log(error);

      setFields([]);
      setUsers([]);
      setBookings([]);
    }
  };

  return (
  <div className="admin-layout">

    {/* SIDEBAR */}
    <div className="sidebar">

      <Link
        to="/"
        className="navbar-logo admin-logo"
      >
        <FaFutbol className="logo-icon" />

        <div className="logo-text">
          <span className="logo-title">
            SânBóngPro
          </span>

          <small className="logo-sub">
            Booking System
          </small>
        </div>
      </Link>

      <ul className="menu">

        <Link to="/admin">
          <li className="active">
            <FaChartBar />
            Dashboard
          </li>
        </Link>

        <Link to="/admin/AdminFields">
          <li>
            <FaFutbol />
            Quản lý sân bóng
          </li>
        </Link>

        <Link to="/admin/AdminBookings">
          <li>
            <FaClipboardList />
            Đơn đặt
          </li>
        </Link>

        <Link to="/admin/AdminUsers">
          <li>
            <FaUsers />
            Người dùng
          </li>
        </Link>

        <Link to="/admin/AdminReviews">
          <li>
            <FaComments />
            Đánh giá
          </li>
        </Link>

        <Link to="/admin/AdminVouchers">
          <li>
            <FaTicketAlt />
            Mã giảm giá
          </li>
        </Link>

        <Link to="/admin/AdminNotifications">
          <li>
            <FaBell />
            Thông báo
          </li>
        </Link>

      </ul>
    </div>

    {/* MAIN CONTENT */}
    <div className="main-content">

      <div className="page-header">
        <h1>Quản lý hệ thống đặt sân bóng</h1>
      </div>

      {/* CARD THỐNG KÊ */}
      <div className="dashboard-cards">

        <div className="card card-blue">
          <FaFutbol className="card-icon" />

          <div>
            <h3>Tổng sân bóng</h3>
            <p>{fields.length}</p>
          </div>
        </div>

        <div className="card card-green">
          <FaUsers className="card-icon" />

          <div>
            <h3>Tổng người dùng</h3>
            <p>{users.length}</p>
          </div>
        </div>

        <div className="card card-orange">
          <FaClipboardList className="card-icon" />

          <div>
            <h3>Tổng đơn đặt sân</h3>
            <p>{bookings.length}</p>
          </div>
          

        </div>
        <div className="card card-purple">
        <FaMoneyBillWave className="card-icon" />

        <div>
          <h3>Tổng doanh thu</h3>
          <p>
            {totalRevenue.toLocaleString()}đ
          </p>
        </div>
  </div>
      </div>

      {/* THỐNG KÊ BOOKING */}
      <div className="dashboard-row">

        <div className="dashboard-box">

          <h2>Thông tin hệ thống</h2>

          <p>
            <strong>
              Tổng sân:
            </strong>{" "}
            {fields.length}
          </p>

          <br />

          <p>
            <strong>
              Tổng người dùng:
            </strong>{" "}
            {users.length}
          </p>

          <br />

          <p>
            <strong>
              Tổng booking:
            </strong>{" "}
            {bookings.length}
          </p>

        </div>
        <div className="dashboard-box">

  <h2>Doanh thu</h2>

  <p>
    <strong>Hôm nay:</strong>{" "}
    {todayRevenue.toLocaleString()}đ
  </p>

  <br />

  <p>
    <strong>Tháng này:</strong>{" "}
    {monthRevenue.toLocaleString()}đ
  </p>

  <br />

  <p>
    <strong>Tổng doanh thu:</strong>{" "}
    {totalRevenue.toLocaleString()}đ
  </p>

</div>

      </div>

      {/* BOOKING MỚI NHẤT */}
      <div className="dashboard-box">

        <h2>
          5 đơn đặt sân mới nhất
        </h2>

        <table className="dashboard-table">

          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Sân bóng</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>

            {bookings.length > 0 ? (
              bookings
                .slice(0, 5)
                .map((booking, index) => (
                  <tr
                    key={
                      booking.id || index
                    }
                  >
                    <td>
                      {booking.user?.name ||
                        booking.name ||
                        "Không có"}
                    </td>

                    <td>
                      {booking.field
                        ?.name ||
                        booking.field_name ||
                        booking.field?.field_name ||
                        "Không có"}
                    </td>

                    <td>
                      {booking.date ||
                        booking.booking_date ||
                        "N/A"}
                    </td>

                    <td>

                      <span
                        className={
                          booking.status ===
                          "confirmed"
                            ? "status-paid"
                            : "status-pending"
                        }
                      >
                        {booking.status}
                      </span>

                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign:
                      "center",
                    padding: "30px",
                  }}
                >
                  Chưa có đơn đặt sân
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>

  </div>
);

}

export default AdminDashboard;