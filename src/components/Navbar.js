
import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import "./Navbar.css";

import {
  FaFutbol,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaChevronDown,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import API from "../services/api";

function Navbar() {

  const [open, setOpen] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [search, setSearch] =
    useState("");

  // ================= NOTIFICATION =================

  const [notifications,
    setNotifications] =
    useState([]);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const notificationRef =
    useRef();

  const dropdownRef =
    useRef();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  // ================= LOGIN =================

  useEffect(() => {

    const userInfo =
      JSON.parse(
        localStorage.getItem(
          "userInfo"
        )
      );

    if (userInfo) {
      setUser(userInfo);
    }

  }, []);

  // ================= GET NOTIFICATIONS =================

  const fetchNotifications = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token;

    if (!token) return;

    const res = await API.get("/notifications/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res?.data;

    // xử lý nhiều kiểu response từ BE (quan trọng)
    if (Array.isArray(data)) {
      setNotifications(data);
    } else if (Array.isArray(data?.notifications)) {
      setNotifications(data.notifications);
    } else {
      setNotifications([]);
    }

  } catch (error) {
    console.log("FETCH NOTI ERROR:", error?.response?.data || error);
    setNotifications([]); // tránh crash UI
  }
};

  // ================= LOAD NOTIFICATION =================

  useEffect(() => {

    if (user) {

      fetchNotifications();

    }

  }, [user]);

  // ================= CLOSE USER DROPDOWN =================

  useEffect(() => {

    function handleClickOutside(e) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target
        )
      ) {

        setOpen(false);

      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          e.target
        )
      ) {

        setShowNotifications(false);

      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  // ================= RESET SEARCH =================

  useEffect(() => {

    setSearch("");

  }, [location.pathname]);

  // ================= CLEAN QUERY =================

  const cleanQuery =
    (text) => {

      return encodeURIComponent(
        text.trim()
      );

    };

  // ================= SEARCH =================

  const handleSearch =
    (value) => {

      const q =
        cleanQuery(value);

      if (!q) return;

      navigate(
        `/fields?search=${q}`
      );

    };

  // ================= ENTER SEARCH =================

  const onKeyDown =
    (e) => {

      if (e.key === "Enter") {

        handleSearch(search);

      }

    };

  // ================= CLICK SEARCH =================

  const onClickSearch =
    () => {

      handleSearch(search);

    };

  // ================= LOGOUT =================

  const handleLogout =
    () => {

      localStorage.removeItem(
        "userInfo"
      );

      localStorage.removeItem(
        "token"
      );

      setUser(null);

      setOpen(false);

      navigate("/login");

    };

  // ================= READ NOTIFICATION =================

  const handleRead = async (id) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token;

    if (!token) return;

    await API.put(
      `/notifications/read/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );
  } catch (error) {
    console.log("READ NOTI ERROR:", error?.response?.data || error);
  }
};
  // ================= UNREAD COUNT =================

  const unreadCount =
    notifications.filter(
      (item) =>
        !item.is_read
    ).length;

  return (

    <div className="navbar">

      {/* LEFT */}

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

      {/* CENTER SEARCH */}

      <div className="navbar-search">

        <FaSearch
          className="search-icon"
          onClick={onClickSearch}
        />

        <input
          type="text"
          placeholder="Tìm kiếm sân bóng..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          onKeyDown={onKeyDown}
        />

      </div>

      {/* RIGHT */}

      <div className="navbar-right">

        {!user ? (

          <div className="auth-buttons">

            <Link
              to="/login"
              className="login-btn-nav"
            >
              Đăng nhập
            </Link>

            <Link
              to="/register"
              className="register-btn-nav"
            >
              Đăng ký
            </Link>

          </div>

        ) : (

          <>

            {/* NOTIFICATION */}

            <div
              className="notification-wrapper"
              ref={notificationRef}
            >

              <div
                className="notification-icon"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
              >

                <FaBell className="nav-icon" />

                {unreadCount > 0 && (

                  <span className="notification-badge">
                    {unreadCount}
                  </span>

                )}

              </div>

              {showNotifications && (

                <div className="notification-dropdown">

                  <div className="notification-header">

                    <h4>
                      Thông báo
                    </h4>

                  </div>

                  {notifications.length === 0 ? (

                    <p className="empty-notification">
                      Không có thông báo
                    </p>

                  ) : (

                    notifications.map(
                      (item) => (

                        <div
                          key={item.id}
                          className={`notification-item ${
                            item.is_read
                              ? "read"
                              : "unread"
                          }`}
                          onClick={() =>
                            handleRead(
                              item.id
                            )
                          }
                        >

                          <p>
                            {item.message}
                          </p>

                          <span>
                            {new Date(
                              item.createdAt
                            ).toLocaleString()}
                          </span>

                        </div>

                      )
                    )

                  )}

                </div>

              )}

            </div>

            {/* USER */}

            <div
              className="user-box"
              ref={dropdownRef}
            >

              <div
                className="user-trigger"
                onClick={() =>
                  setOpen(!open)
                }
              >

                <FaUserCircle className="user-icon" />

                <span className="user-name">
                  {user?.name || "User"}
                </span>

                <FaChevronDown className="down-icon" />

              </div>

              {open && (

                <div className="dropdown-menu">

                  <div className="user-info">

                    <strong>
                      {user?.name}
                    </strong>

                    <span>
                      {user?.email}
                    </span>

                  </div>

                  <div
                    className="dropdown-item"
                    onClick={() => {

                      navigate(
                        user?.role === "admin"
                          ? "/admin"
                          : "/profile"
                      );

                      setOpen(false);

                    }}
                  >
                    Tài khoản của tôi
                  </div>

                  <div
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </div>

                </div>

              )}

            </div>

            {/* BOOKING */}

            <button
              className="booking-btn"
              onClick={() =>
                navigate("/fields")
              }
            >

              <FaCalendarAlt />

              <span>
                Đặt sân ngay
              </span>

            </button>

          </>

        )}

      </div>

    </div>

  );

}

export default Navbar;