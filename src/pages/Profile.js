import React, { useEffect, useState } from "react";
import "./Profile.css";

import API from "../services/api";

import {
  FaUser,
  FaCalendarAlt,
  FaSignOutAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Profile() {
  const [user, setUser] =
    useState(null);

  // =========================
  // TAB
  // =========================

  const [activeTab, setActiveTab] =
    useState("profile");

  // =========================
  // BOOKINGS
  // =========================

  const [bookings, setBookings] =
    useState([]);

  // =========================
  // SELECTED BOOKING
  // =========================

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);

  // =========================
  // LOADING
  // =========================

  const [
    loadingBookings,
    setLoadingBookings,
  ] = useState(true);


  const [showBankForm, setShowBankForm] = useState(false);

const [bankInfo, setBankInfo] = useState({
  bank_name: "",
  bank_number: "",
  bank_owner: "",
});
  // =========================
  // USE EFFECT
  // =========================

  useEffect(() => {
    fetchUser();
    fetchBookings();
  }, []);

  // =========================
  // GET CURRENT USER
  // =========================

  const fetchUser = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const token = userInfo?.token || userInfo?.accessToken;

    if (!token) {
      console.log("NO TOKEN FOUND");
      return;
    }

    const res = await API.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;
setUser(data?.user || data?.data || data);
  } catch (error) {
    console.log("FETCH USER ERROR:", error);

    // 👉 tránh crash UI
    setUser(null);
  }
};

  // =========================
  // GET MY BOOKINGS
  // =========================

  const fetchBookings = async () => {
  try {
    setLoadingBookings(true);
    setBookings([]);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token || userInfo?.accessToken;

    if (!token) {
      setBookings([]);
      setLoadingBookings(false);
      return;
    }

    const res = await API.get("/bookings/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = res.data;

setBookings(
  Array.isArray(data)
    ? data
    : Array.isArray(data?.bookings)
    ? data.bookings
    : []
);
  } catch (error) {
    console.log("BOOKINGS ERROR:", error);
    setBookings([]);
  } finally {
    setLoadingBookings(false);
  }
};

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
  setUser((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};

  // =========================
  // UPDATE USER
  // =========================

  const handleUpdate =
    async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token =
          userInfo?.token ||
          userInfo?.accessToken ||
          userInfo?.user?.token;

        await API.put(
  "/auth/update-profile",
  {
    name: user.name,
    phone: user.phone,
    birthday: user.birthday,
    address: user.address,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        const old = JSON.parse(localStorage.getItem("userInfo")); 
localStorage.setItem(
  "userInfo",
  JSON.stringify({
    ...old,
    user: {
      ...old.user,
      ...user,
    },
  })
);

        alert(
          "Cập nhật thành công"
        );

        fetchUser();
      } catch (error) {
        console.log(error);

        alert(
          "Cập nhật thất bại"
        );
      }
    };
    const handleCancelBooking = async (bookingId) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token || userInfo?.accessToken;

    const confirmCancel = window.confirm("Bạn có chắc muốn hủy sân này không?");
    if (!confirmCancel) return;

    const booking = bookings.find((b) => b.id === bookingId);

    const isOnlinePayment =
      booking.payment_method !== "cash";

    const needRefundForm =
      isOnlinePayment &&
      booking.payment_status !== "refunded" &&
      booking.status !== "cancelled";

    // 👉 CASH: hủy luôn, KHÔNG form hoàn tiền
    if (!isOnlinePayment) {
      const res = await API.put(
        `/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data?.message);
      fetchBookings();
      setSelectedBooking(null);
      return;
    }

    // 👉 ONLINE: mở form hoàn tiền
    if (needRefundForm) {
      setSelectedBooking(booking);
      setShowBankForm(true);
      return;
    }

  } catch (error) {
    console.log("CANCEL ERROR:", error);
    alert(error?.response?.data?.message || "Hủy sân thất bại");
  }
};

const handleConfirmCancelTransfer = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token || userInfo?.accessToken;

    const res = await API.put(
      `/bookings/${selectedBooking.id}/cancel`,
      {
        bank_name: bankInfo.bank_name,
        bank_number: bankInfo.bank_number,
        bank_owner: bankInfo.bank_owner,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(res.data?.message);

    setShowBankForm(false);
    setSelectedBooking(null);
    setBankInfo({
      bank_name: "",
      bank_number: "",
      bank_owner: "",
    });

    fetchBookings();
  } catch (error) {
    console.log(error);
    alert("Hủy sân thất bại");
  }
};
  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
  localStorage.clear(); // sạch toàn bộ cho chắc

  window.location.href = "/login";
};

  // =========================
  // LOADING USER
  // =========================

  if (!user) {
    return (
      <div className="profile-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* SIDEBAR */}

      <div className="profile-sidebar">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name?.charAt(0) ||
              "U"}
          </div>

          <p className="profile-email">
            {user.email}
          </p>
        </div>

        <div className="sidebar-menu">
          {/* PROFILE */}

          <button
            className={`menu-item ${
              activeTab ===
              "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "profile"
              )
            }
          >
            <FaUser />

            <span>
              Thông tin cá nhân
            </span>
          </button>

          {/* HISTORY */}

          <button
            className={`menu-item ${
              activeTab ===
              "history"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "history"
              )
            }
          >
            <FaCalendarAlt />

            <span>
              Lịch sử đặt sân
            </span>
          </button>

          {/* LOGOUT */}

          <button
            className="menu-item logout"
            onClick={
              handleLogout
            }
          >
            <FaSignOutAlt />

            <span>
              Đăng xuất
            </span>
          </button>
        </div>
      </div>

      {/* ========================= */}
      {/* PROFILE */}
      {/* ========================= */}

      {activeTab ===
        "profile" && (
        <div className="profile-content">
          <h2>
            Thông tin cá nhân
          </h2>

          <div className="profile-form">
            {/* NAME */}

            <div className="form-group">
              <label>
                <FaUser /> Họ và
                tên
              </label>

              <input
                type="text"
                name="name"
                value={
                  user?.name || ""
                }
                onChange={
                  handleChange
                }
              />
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label>
                <FaEnvelope />{" "}
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  user.email || ""
                }
                disabled
              />
            </div>

            {/* PHONE */}

            <div className="form-group">
              <label>
                <FaPhone /> Số
                điện thoại
              </label>

              <input
                type="text"
                name="phone"
                value={
                  user.phone || ""
                }
                onChange={
                  handleChange
                }
              />
            </div>

            {/* BIRTHDAY */}

            <div className="form-group">
              <label>
                Ngày sinh
              </label>

              <input
                type="date"
                name="birthday"
                value={
                  user.birthday ||
                  ""
                }
                onChange={
                  handleChange
                }
              />
            </div>

            {/* ADDRESS */}

            <div className="form-group full-width">
              <label>
                <FaMapMarkerAlt />{" "}
                Địa chỉ
              </label>

              <input
                type="text"
                name="address"
                value={
                  user.address ||
                  ""
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>

          <button
            className="update-btn"
            onClick={
              handleUpdate
            }
          >
            Cập nhật thông tin
          </button>
        </div>
      )}

      {/* ========================= */}
      {/* HISTORY */}
      {/* ========================= */}

      {activeTab ===
        "history" && (
        <div className="profile-content">
          <h2>
            Lịch sử đặt sân
          </h2>

          {loadingBookings ? (
            <div className="empty-history">
              Đang tải dữ liệu...
            </div>
          ) : bookings.length ===
            0 ? (
            <div className="empty-history">
              Chưa có lịch sử
              đặt sân
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>
                      Tên sân
                    </th>

                    <th>Ngày</th>

                    <th>
                      Khung giờ
                    </th>

                    <th>
                      Tổng tiền
                    </th>

                    <th>
                      Trạng thái
                    </th>

                    <th>
                      Chi tiết
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map(
                    (booking) => {
                      // =========================
                      // FORMAT DATE
                      // =========================

                      const date =
                        booking.booking_date
                          ? new Date(
                              booking.booking_date
                            ).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Không có ngày";

                      // =========================
                      // FORMAT TIME
                      // =========================

                      const startTime =
                        booking.start_time ||
                        "--:--";

                      const endTime =
                        booking.end_time ||
                        "--:--";

                      // =========================
                      // PRICE
                      // =========================

                      const totalPrice =
                        booking.total_price >
                        0
                          ? booking.total_price
                          : booking
                              .field
                              ?.price_per_hour ||
                            0;

                      return (
                        <tr
                          key={booking.id || booking._id}
                        >
                          {/* FIELD */}

                          <td className="field-name">
                            {booking
                              .field
                              ?.name ||
                              "Sân bóng mini"}
                          </td>

                          {/* DATE */}

                          <td>
                            {date}
                          </td>

                          {/* TIME */}

                          <td>
                            {
                              startTime
                            }{" "}
                            -{" "}
                            {
                              endTime
                            }
                          </td>

                          {/* PRICE */}

                          <td className="price">
                            {totalPrice.toLocaleString()}
                            đ
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={`status-badge ${
  booking.status === "cancelled"
    ? "cancelled"
    : booking.payment_status === "refund_pending"
    ? "pending"
    : booking.payment_status === "refunded"
    ? "paid"
    : booking.payment_method === "cash"
    ? "pending"
    : "paid"
}`}
                            >
                              {booking.status ===
                              "cancelled"
                                ? "Đã hủy"
                                : booking.payment_method ===
                                  "cash"
                                ? "Chờ thanh toán"
                                : "Đã thanh toán"}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td>
                            <button
                              className="action-btn"
                              onClick={() =>
                                setSelectedBooking(
                                  booking
                                )
                              }
                            >
                              👁 Xem
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================= */}
{/* BOOKING DETAIL MODAL */}
{/* ========================= */}

{selectedBooking && (
  <div className="booking-modal-overlay">
    <div className="booking-modal">
      {/* IMAGE */}

      <img
        src={
          selectedBooking.field
            ?.image ||
          selectedBooking.field
            ?.images?.[0] ||
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"
        }
        alt={
          selectedBooking.field
            ?.name ||
          "Football Field"
        }
        className="booking-image"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop";
        }}
      />

      {/* HEADER */}

      <div className="booking-header">
        <h2>
          {selectedBooking.field
            ?.name ||
            selectedBooking.field_name ||
            "Sân bóng"}
        </h2>

        <span
          className={`booking-status ${
            selectedBooking.status ===
            "cancelled"
              ? "cancelled"
              : selectedBooking.payment_method ===
                "cash"
              ? "pending"
              : "paid"
          }`}
        >
          {selectedBooking.status ===
          "cancelled"
            ? "Đã hủy"
            : selectedBooking.payment_method ===
              "cash"
            ? "Chờ thanh toán"
            : "Đã thanh toán"}
        </span>
      </div>

      {/* DETAIL */}

      <div className="booking-detail">
        {/* USER */}

        <div className="detail-item">
          <span>Người đặt</span>

          <strong>
            {selectedBooking.name ||
              user.name ||
              "Chưa có"}
          </strong>
        </div>

        {/* PHONE */}

        <div className="detail-item">
          <span>Số điện thoại</span>

          <strong>
            {selectedBooking.phone ||
              user.phone ||
              "Chưa có"}
          </strong>
        </div>

        {/* EMAIL */}

        <div className="detail-item">
          <span>Email</span>

          <strong>
            {selectedBooking.email ||
              user.email ||
              "Chưa có"}
          </strong>
        </div>

        {/* DATE */}

        <div className="detail-item">
          <span>Ngày đặt</span>

          <strong>
            {selectedBooking.booking_date
              ? new Date(
                  selectedBooking.booking_date
                ).toLocaleDateString(
                  "vi-VN"
                )
              : "Không có"}
          </strong>
        </div>

        {/* TIME */}

        <div className="detail-item">
          <span>Khung giờ</span>

          <strong>
            {selectedBooking.start_time ||
              "--:--"}{" "}
            -
            {" "}
            {selectedBooking.end_time ||
              "--:--"}
          </strong>
        </div>

        {/* PRICE */}

        <div className="detail-item">
          <span>Tổng tiền</span>

          <strong className="price-text">
            {Number(
              selectedBooking.total_price >
                0
                ? selectedBooking.total_price
                : selectedBooking
                    .field
                    ?.price_per_hour || 0
            ).toLocaleString()}
            đ
          </strong>
        </div>

        {/* ADDRESS */}

        <div className="detail-item">
          <span>Địa điểm</span>

          <strong>
            {selectedBooking.field
              ?.address ||
              "Chưa cập nhật"}
          </strong>
        </div>

        {/* PAYMENT */}

        <div className="detail-item">
          <span>Thanh toán</span>

          <strong>
            {selectedBooking.payment_method ===
            "cash"
              ? "Tiền mặt"
              : "Chuyển khoản"}
          </strong>
        </div>

        {/* TRANSACTION */}

        {selectedBooking.transaction_code && (
          <div className="detail-item">
            <span>Mã giao dịch</span>

            <strong>
              {
                selectedBooking.transaction_code
              }
            </strong>
          </div>
        )}
      </div>
{showBankForm && selectedBooking && (
  <div className="bank-form">
    <h3>Nhập thông tin hoàn tiền</h3>

    <input
      placeholder="Tên ngân hàng"
      value={bankInfo.bank_name}
      onChange={(e) =>
        setBankInfo({ ...bankInfo, bank_name: e.target.value })
      }
    />

    <input
      placeholder="Số tài khoản"
      value={bankInfo.bank_number}
      onChange={(e) =>
        setBankInfo({ ...bankInfo, bank_number: e.target.value })
      }
    />

    <input
      placeholder="Tên chủ tài khoản"
      value={bankInfo.bank_owner}
      onChange={(e) =>
        setBankInfo({ ...bankInfo, bank_owner: e.target.value })
      }
    />

    <button
      className="update-btn"
      onClick={handleConfirmCancelTransfer}
    >
      Xác nhận hủy & hoàn tiền
    </button>
  </div>
)}
      {/* CLOSE */}
      {selectedBooking.status !== "cancelled" &&
 selectedBooking.payment_status !== "refunded" && (
  
  <button
    className="cancel-booking-btn"
    onClick={() =>
       handleCancelBooking(selectedBooking.id)
    }
  >
    ❌ Hủy sân
  </button>
)}
      <button
        className="close-modal-btn"
        onClick={() =>
          setSelectedBooking(null) 
        }
      >
        Đóng
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default Profile;