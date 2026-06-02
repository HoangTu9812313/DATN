import React, { useEffect, useState } from "react";
import "./style/Profile.css";

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
  const [groupedBookings, setGroupedBookings] = useState([]);
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
  const [cancelMode, setCancelMode] = useState(null);
  // "cash" | "bank"
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

      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.bookings)
          ? data.bookings
          : [];

      // group slots
      const grouped = groupBookings(raw);

      setBookings(raw);
      setGroupedBookings(grouped);
    } catch (error) {
      console.log("BOOKINGS ERROR:", error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };
  const groupBookings = (list) => {
    const map = {};

    list.forEach((item) => {

      // group theo payment_group
      const key =
        item.payment_group ||
        item.id;

      if (!map[key]) {
        map[key] = {
          ...item,
          slots: [],
        };
      }

      map[key].slots.push({
        id: item.id,
        start_time: item.start_time,
        end_time: item.end_time,
        price:
          item.final_amount ||
          item.total_price ||
          0,
        status: item.status,
        payment_status: item.payment_status,
      });
    });
    Object.values(map).forEach((booking) => {
      const allCancelled = booking.slots.every(
        (slot) => slot.status === "cancelled"
      );

      if (allCancelled) {
        booking.status = "cancelled";
      }
    });
    return Object.values(map).sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
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

      const booking = bookings.find(
        (b) => String(b.id || b._id) === String(bookingId)
      );

      if (!booking) {
        alert("Không tìm thấy booking");
        return;
      }

      const isCash = booking.payment_method === "cash";

      // CASH → cancel luôn
      if (isCash) {
        const res = await API.put(
          `/bookings/${bookingId}/cancel`,
          {
            cancel_type: "cash",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert(res.data?.message || "Hủy thành công");
        fetchBookings();
        setSelectedBooking(null);
        return;
      }

      // BANK → mở form nhập bank
      setSelectedBooking(booking);
      setShowBankForm(true);
      setCancelMode("bank");
    } catch (error) {
      console.log("CANCEL ERROR:", error);
      alert(error?.response?.data?.message || "Hủy sân thất bại");
    }
  };
  const handleConfirmCancelTransfer = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token || userInfo?.accessToken;

      const bookingId = selectedBooking?.id || selectedBooking?._id;

      const res = await API.put(
        `/bookings/${bookingId}/cancel`,
        {
          cancel_type: "bank",
          bank_info: {
            bank_name: bankInfo.bank_name,
            bank_number: bankInfo.bank_number,
            bank_owner: bankInfo.bank_owner,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data?.message || "Hủy & hoàn tiền thành công");

      setShowBankForm(false);
      setSelectedBooking(null);
      setCancelMode(null);

      setBankInfo({
        bank_name: "",
        bank_number: "",
        bank_owner: "",
      });

      fetchBookings();
    } catch (error) {
      console.log("BANK CANCEL ERROR:", error);
      alert(error?.response?.data?.message || "Hủy sân thất bại");
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
            className={`menu-item ${activeTab ===
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
            className={`menu-item ${activeTab ===
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
                    {groupedBookings.map((booking) => {
                      const date = booking.booking_date
                        ? new Date(booking.booking_date).toLocaleDateString("vi-VN")
                        : "Không có ngày";

                      const totalPrice = booking.slots.reduce(
                        (sum, s) => sum + Number(s.price || 0),
                        0
                      );

                      return (
                        <tr
                          key={booking.booking_group_id || booking.id || booking._id}
                        >
                          {/* FIELD */}
                          <td className="field-name">
                            {booking.field?.name || "Sân bóng mini"}
                          </td>

                          {/* DATE */}
                          <td>{date}</td>

                          {/* TIME - FIX 100% */}
                          <td>
                            <div className="slot-list">
                              {booking.slots.map((slot) => (
                                <div key={slot.id} className="slot-item">
                                  <span>
                                    {slot.start_time} - {slot.end_time}
                                  </span>

                                  {slot.status === "cancelled" ? (
                                    <span className="slot-cancelled">
                                      Đã huỷ
                                    </span>
                                  ) : (
                                    <button
                                      className="cancel-slot-btn"
                                      onClick={() => handleCancelBooking(slot.id)}
                                    >
                                      ❌ Huỷ giờ này
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* PRICE */}
                          <td className="price">
                            {totalPrice.toLocaleString()}đ
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={`status-badge ${booking.status === "cancelled"
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
                              {booking.status === "cancelled"
                                ? "Đã hủy"
                                : booking.payment_method === "cash"
                                  ? "Chờ thanh toán"
                                  : "Đã thanh toán"}
                            </span>
                          </td>

                          {/* ACTION */}
                          <td>
                            <button
                              className="action-btn"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              👁 Xem
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
                className={`booking-status ${selectedBooking.status ===
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
                  {selectedBooking.slots?.map((slot) => (
                    <div key={slot.id} className="slot-detail-row">
                      <span>
                        {slot.start_time} - {slot.end_time}
                      </span>

                      {slot.status === "cancelled" ? (
                        <span className="slot-cancelled">
                          Đã huỷ
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCancelBooking(slot.id)}
                        >
                          Huỷ giờ này
                        </button>
                      )}
                    </div>
                  ))}
                </strong>
              </div>

              {/* PRICE */}

              <div className="detail-item">
                <span>Tổng tiền</span>

                <strong className="price-text">
                  {selectedBooking.slots
                    ?.reduce((sum, slot) => sum + Number(slot.price || 0), 0)
                    .toLocaleString()}
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
            {showBankForm && cancelMode === "bank" && selectedBooking && (
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
            {selectedBooking &&
              selectedBooking.status !== "cancelled" &&
              selectedBooking.payment_status !== "refunded" &&
              !showBankForm && (
                <button
                  className="cancel-booking-btn"
                  onClick={() =>
                    handleCancelBooking(selectedBooking.id || selectedBooking._id)
                  }
                >
                  ❌ Hủy sân
                </button>
              )}
            <button
              className="close-modal-btn"
              onClick={() => {
                setSelectedBooking(null);
                setShowBankForm(false);
                setCancelMode(null);
                setBankInfo({
                  bank_name: "",
                  bank_number: "",
                  bank_owner: "",
                });
              }}
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