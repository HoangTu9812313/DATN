import React, { useEffect, useState } from "react";
import "./Style/AdminNotifications.css";

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
  const [notifications, setNotifications] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);
  const [users, setUsers] = useState([]);
  const [sendType, setSendType] = useState("global");
  const [selectedUser, setSelectedUser] = useState("");
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const token = userInfo?.token;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const fetchUsers = async () => {
    try {
      const res = await API.get(
        "/auth/users",
        config
      );

      setUsers(
        res.data?.users || res.data || []
      );
    } catch (error) {
      console.log(
        "USER ERROR:",
        error?.response?.data ||
        error.message
      );
    }
  };
  // ================= FETCH =================

  const fetchNotifications =
    async () => {
      try {
        setFetching(true);

        const res =
          await API.get(
            "/notifications",
            config
          );

        const data =
          res.data?.notifications ||
          [];

        data.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        );

        setNotifications(data);
      } catch (error) {
        console.log(
          "FETCH ERROR:",
          error?.response?.data ||
          error.message
        );

        setNotifications([]);
      } finally {
        setFetching(false);
      }
    };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUsers();
    }
  }, []);

  // ================= CREATE =================

  const handleSend = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !message.trim()
    ) {
      return alert(
        "Vui lòng nhập đầy đủ thông tin"
      );
    }

    if (
      sendType === "single" &&
      !selectedUser
    ) {
      return alert(
        "Vui lòng chọn người nhận"
      );
    }

    try {
      setLoading(true);

      const payload = {
        title,
        message,
        type: "system",
      };

      if (sendType === "global") {
        payload.isGlobal = true;
      } else {
        payload.isGlobal = false;
        payload.userId = selectedUser;
      }

      await API.post(
        "/notifications",
        payload,
        config
      );

      alert(
        "Gửi thông báo thành công"
      );

      setTitle("");
      setMessage("");
      setSelectedUser("");

      await fetchNotifications();
    } catch (error) {
      console.log(
        "CREATE ERROR:",
        error?.response?.data ||
        error.message
      );

      alert(
        error?.response?.data
          ?.message ||
        "Gửi thông báo thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================

  const handleDelete =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Xóa thông báo này?"
        );

      if (!confirmDelete) return;

      try {
        await API.delete(
          `/notifications/${id}`,
          config
        );

        alert(
          "Xóa thông báo thành công"
        );

        await fetchNotifications();
      } catch (error) {
        console.log(
          "DELETE ERROR:",
          error?.response?.data ||
          error.message
        );

        alert(
          error?.response?.data
            ?.message ||
          "Xóa thất bại"
        );
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
            <li>
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
            <li className="active">
              <FaBell />
              Thông báo
            </li>
          </Link>
        </ul>
      </div>

      {/* MAIN */}

      <div className="main-content">
        <div className="page-header">
          <h1>
            Quản lý thông báo
          </h1>
        </div>

        {/* FORM */}

        <form
          className="notification-form"
          onSubmit={handleSend}
        >
          <div className="send-type-box">
            <label>
              Loại thông báo
            </label>

            <select
              value={sendType}
              onChange={(e) =>
                setSendType(
                  e.target.value
                )
              }
            >
              <option value="global">
                Gửi cho tất cả người dùng
              </option>

              <option value="single">
                Gửi riêng một người dùng
              </option>
            </select>
          </div>

          {sendType === "single" && (
            <div className="send-type-box">
              <label>
                Người nhận
              </label>

              <select
                value={selectedUser}
                onChange={(e) =>
                  setSelectedUser(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Chọn người dùng
                </option>

                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <input
            type="text"
            placeholder="Tiêu đề thông báo..."
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <textarea
            placeholder="Nội dung thông báo..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            <FaPaperPlane />

            {loading
              ? "Đang gửi..."
              : "Gửi thông báo"}
          </button>
        </form>

        {/* LIST */}

        <div className="notification-list">
          {fetching ? (
            <div className="empty-box">
              Đang tải dữ liệu...
            </div>
          ) : notifications.length ===
            0 ? (
            <div className="empty-box">
              Chưa có thông báo
            </div>
          ) : (
            notifications.map(
              (item) => (
                <div
                  className="notification-card"
                  key={item.id}
                >
                  <div className="notification-content">
                    <h4>
                      {item.title}
                    </h4>

                    <p>
                      {item.message}
                    </p>

                    <div className="notification-meta">
                      <span>
                        {item.isGlobal
                          ? "🌍 Tất cả người dùng"
                          : `👤 User #${item.userId}`}
                      </span>

                      <span>
                        {new Date(
                          item.createdAt
                        ).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(
                        item.id
                      )
                    }
                  >
                    <FaTrash />
                  </button>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;