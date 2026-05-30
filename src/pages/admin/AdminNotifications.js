// src/pages/admin/AdminNotifications.js

import React, { useEffect, useState } from "react";
import "./AdminNotifications.css";

import {
  FaFutbol,
  FaChartBar,
  FaClipboardList,
  FaUsers,
  FaComments,
  FaTicketAlt,
  FaBell,
  FaPaperPlane,
  FaTrash,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import API from "../../services/api";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ================= FETCH =================
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications", config);

      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.log("FETCH ERROR:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ================= CREATE =================
  const handleSend = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) return;

    try {
      setLoading(true);

      await API.post(
  "/notifications",
  {
    userId: userInfo?.id,   // 👈 SỬA Ở ĐÂY
    title: "Thông báo hệ thống",
    message: message,
    type: "system"
  },
  config
);

      setTitle("");
      setMessage("");
      fetchNotifications();
    } catch (error) {
      console.log("CREATE ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Xóa thông báo này?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/notifications/${id}`, config);

      setNotifications((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.log("DELETE ERROR:", error.response?.data || error.message);
    }
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <Link to="/" className="navbar-logo admin-logo">
          <FaFutbol className="logo-icon" />
          <div className="logo-text">
            <span className="logo-title">SânBóngPro</span>
            <small className="logo-sub">Booking System</small>
          </div>
        </Link>

        <ul className="menu">
          <Link to="/admin">
            <li>
              <FaChartBar /> Dashboard
            </li>
          </Link>

          <Link to="/admin/AdminFields">
            <li>
              <FaFutbol /> Quản lý sân bóng
            </li>
          </Link>

          <Link to="/admin/AdminBookings">
            <li>
              <FaClipboardList /> Đơn đặt
            </li>
          </Link>

          <Link to="/admin/AdminUsers">
            <li>
              <FaUsers /> Người dùng
            </li>
          </Link>

          <Link to="/admin/AdminReviews">
            <li>
              <FaComments /> Đánh giá
            </li>
          </Link>

          <Link to="/admin/AdminVouchers">
            <li>
              <FaTicketAlt /> Mã giảm giá
            </li>
          </Link>

          <Link to="/admin/AdminNotifications">
            <li className="active">
              <FaBell /> Thông báo
            </li>
          </Link>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main-content">
        <div className="page-header">
          <h1>Quản lý thông báo</h1>
        </div>

        {/* FORM */}
        <form className="notification-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Tiêu đề thông báo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Nội dung thông báo..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            <FaPaperPlane />
            {loading ? "Đang gửi..." : "Gửi thông báo"}
          </button>
        </form>

        {/* LIST */}
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-box">Chưa có thông báo</div>
          ) : (
            notifications.map((item) => (
              <div className="notification-card" key={item.id}>
                <div className="notification-content">
                  <h4>{item.title}</h4>
                  <p>{item.message}</p>
                  <span>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;