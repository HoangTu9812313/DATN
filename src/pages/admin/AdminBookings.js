    // src/pages/admin/AdminBookings.js

    import React, { useEffect, useState } from "react";
    import "./Style/AdminBookings.css";

    import {
      FaFutbol,
      FaChartBar,
      FaClipboardList,
      FaUsers,
      FaTrash,
      FaEye,
      FaTimes,
      FaComments,
      FaTicketAlt,
      FaClock,
      FaBell
    } from "react-icons/fa";

    import { Link } from "react-router-dom";
    import API from "../../services/api";

    function AdminBookings() {
      // ================= STATE =================

      const [bookings, setBookings] = useState([]);
      const [loading, setLoading] = useState(true);
      const [updatingId, setUpdatingId] = useState(null);

      // ================= MODAL =================

      const [showModal, setShowModal] = useState(false);
      const [selectedBooking, setSelectedBooking] =
        useState(null);

      // ================= USER =================

      const userInfo = JSON.parse(
        localStorage.getItem("userInfo")
      );

      const token = userInfo?.token;
      const [showBank, setShowBank] = useState(false);
      const isAdmin =
        userInfo?.user?.role
          ?.toLowerCase()
          ?.trim() === "admin" ||
        userInfo?.role
          ?.toLowerCase()
          ?.trim() === "admin";

      // ================= FETCH BOOKINGS =================

      const fetchBookings = async () => {
        try {
          setLoading(true);

          const res = await API.get(
            "/bookings/all",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("BOOKINGS:", res.data);

          const data = Array.isArray(
            res.data
          )
            ? res.data
            : res.data?.bookings || [];

          setBookings(data);
        } catch (error) {
          console.log(error);
          setBookings([]);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        if (isAdmin) {
          fetchBookings();
        } else {
          setLoading(false);
        }
      }, []);

      // ================= FORMAT TIME =================

      const formatTime = (time) => {
        if (!time) return "--:--";

        return time.slice(0, 5);
      };

      // ================= GET BOOKING SLOTS =================

      const getBookingSlots = (booking) => {
        if (Array.isArray(booking?.slots)) {
        return booking.slots
          .filter(
            (s) =>
              s.payment_status !== "cancelled" &&
              s.status !== "cancelled"
          )
          .map((s) => ({
            date: s.date,
            start: s.start,
            end: s.end,
            price: Number(s.price ?? 0),
          }));
      }

        if (booking?.start_time && booking?.end_time) {
          return [
            {
              date: booking.booking_date,
              start: booking.start_time,
              end: booking.end_time,

              // 🔥 FIX QUAN TRỌNG
              price: Number(booking.total_price ?? 0),
            },
          ];
        }

        return [];
      };
      // ================= CALCULATE TOTAL =================

      const calculateTotal = (booking) => {
        const slots = getBookingSlots(booking);

        return slots.reduce((sum, slot) => {
          return sum + Number(slot.price || 0);
        }, 0);
      };
const calculatePaidAmount = (booking) => {

  const totalPrice =
    calculateTotal(booking);

  if (
    booking.payment_method ===
    "deposit"
  ) {

    return Math.round(
      totalPrice *
      Number(
        booking.deposit_percent || 30
      ) / 100
    );
  }

  return totalPrice;
};
const calculateRemainingAmount = (
  booking
) => {

  const totalPrice =
    calculateTotal(booking);

  return (
    totalPrice -
    calculatePaidAmount(
      booking
    )
  );
};
      // ================= TOTAL REVENUE =================

      const totalRevenue =
  bookings.reduce((sum, booking) => {

    if (
      booking.payment_status === "paid" ||
      booking.payment_status === "deposit_paid"
    ) {
      return (
        sum +
        calculatePaidAmount(
          booking
        )
      );
    }

    return sum;

  }, 0);

      // ================= UPDATE STATUS =================

      const updateStatus = async (id, payment_status) => {
        try {
          setUpdatingId(id);

          await API.put(
            `/bookings/${id}`,
            { payment_status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          await fetchBookings();

          alert("Cập nhật trạng thái thành công");
        } catch (error) {
          console.log(error);
          alert(
            error?.response?.data?.message ||
            "Cập nhật thất bại"
          );
        } finally {
          setUpdatingId(null);
        }
      };
      const handleRefund = async (
  id
) => {

  try {

    const ok =
      window.confirm(
        "Xác nhận hoàn tiền?"
      );

    if (!ok) return;

    await API.post(
      `/bookings/refund/${id}`,
      {},
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    alert(
      "Hoàn tiền thành công"
    );

    fetchBookings();

  } catch (err) {

    console.log(err);

    alert(
      err?.response?.data
        ?.message ||
      "Hoàn tiền thất bại"
    );
  }
};
const handleRejectRefund =
  async (id) => {

  const reason =
    prompt(
      "Nhập lý do từ chối"
    );

  if (!reason) return;

  try {

    await API.post(
      `/bookings/refund/${id}/reject`,
      {
        reason,
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    alert(
      "Đã từ chối hoàn tiền"
    );

    fetchBookings();

  } catch (err) {

    console.log(err);

    alert(
      err?.response?.data
        ?.message ||
      "Thao tác thất bại"
    );
  }
};
      // ================= DELETE / CANCEL =================

      const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Bạn muốn hủy booking này?");

        if (!confirmDelete) return;

        try {
          await API.put(
            `/bookings/${id}/cancel`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          await fetchBookings();
          alert("Hủy booking thành công");
        } catch (error) {
          console.log(error);
          alert("Hủy thất bại");
        }
      };
const handleCancelSlot = async (
  bookingId,
  slot
) => {

  const ok = window.confirm(
    `Hủy slot ${slot.start}-${slot.end}?`
  );

  if (!ok) return;

  try {

    await API.put(
      `/bookings/${bookingId}/slot/cancel`,
      {
        date: slot.date,
        start: slot.start
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    alert(
      "Hủy slot thành công"
    );

    fetchBookings();

  } catch (err) {

    console.log(err);

    alert(
      err?.response?.data?.message ||
      "Hủy slot thất bại"
    );

  }
};
      // ================= OPEN DETAIL =================

      const openBookingDetail = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
        setShowBank(false); // FIX BUG
      };

      // ================= FILTER =================

      const pendingBookings =
        bookings.filter(
          (b) =>
            b.payment_status ===
            "pending"
        );

      const paidBookings =
        bookings.filter(
          (b) =>
            b.payment_status === "paid"
        );
        const depositBookings =
  bookings.filter(
    (b) =>
      b.payment_status ===
      "deposit_paid"
  );

const refundRejectedBookings =
  bookings.filter(
    (b) =>
      b.payment_status ===
      "refund_rejected"
  );
      const cancelledBookings =
        bookings.filter(
          (b) =>
            b.payment_status ===
            "cancelled" ||
            b.status === "cancelled"
        );
      const refundPendingBookings = bookings.filter(
        (b) => b.payment_status === "refund_pending"
      );

      const refundedBookings = bookings.filter(
        (b) => b.payment_status === "refunded"
      );

      // ================= NO ACCESS =================

      if (!isAdmin) {
        return (
          <div className="no-access">
            <h1>403</h1>
            <h2>
              Không có quyền truy cập
            </h2>
          </div>
        );
      }

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
                  <FaChartBar />
                  Dashboard
                </li>
              </Link>

              <Link to="/admin/AdminFields">
                <li>
                  <FaFutbol />
                  Quản lý sân
                </li>
              </Link>

              <Link to="/admin/AdminBookings">
                <li className="active">
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

          {/* MAIN */}

          <div className="main-content">
            <div className="page-header">
              <h1>
                Quản lý đơn đặt sân
              </h1>
            </div>

            {/* CARDS */}

            <div className="dashboard-cards">
              <div className="card">
                <h3>Chờ thanh toán</h3>
                <p>
                  {
                    pendingBookings.length
                  }
                </p>
              </div>

              <div className="card">
                <h3>Đã thanh toán</h3>
                <p>
                  {paidBookings.length}
                </p>
              </div>
                  <div className="card">
  <h3>Đã cọc</h3>
  <p>
    {depositBookings.length}
  </p>
</div>

<div className="card">
  <h3>Chờ hoàn</h3>
  <p>
    {
      refundPendingBookings.length
    }
  </p>
</div>

<div className="card">
  <h3>Từ chối hoàn</h3>
  <p>
    {
      refundRejectedBookings.length
    }
  </p>
</div>

<div className="card">
  <h3>Đã hoàn</h3>
  <p>
    {
      refundedBookings.length
    }
  </p>
</div>
              <div className="card">
                <h3>Đã hủy</h3>
                <p>
                  {
                    cancelledBookings.length
                  }
                </p>
              </div>

              <div className="card">
                <h3>Tổng đơn</h3>
                <p>{bookings.length}</p>
              </div>

              <div className="card">
                <h3>Doanh thu</h3>

                <p>
                  {totalRevenue.toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </p>
              </div>
            </div>

            {/* TABLE */}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Sân</th>
                    <th>Ngày</th>
                    <th>Khung giờ</th>
                    <th>Thanh toán</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => {
                      const slots =
                        getBookingSlots(
                          b
                        );

                      return (
                        <tr
                          key={b.id}
                          className={
                            b.status ===
                              "cancelled" ||
                              b.payment_status ===
                              "cancelled"
                              ? "cancelled-row"
                              : ""
                          }
                        >
                          <td>{b.id}</td>

                          <td>
                            {b.user?.name ||
                              b.name ||
                              "Không có"}
                          </td>

                          <td>
                            {b.field?.name ||
                              "Không có"}
                          </td>

                          <td>
                            {b.booking_date}
                          </td>

                          <td>
                            <div className="slot-list-admin">
                              {slots.map((slot, index) => (
                                <div key={index}>
                                  {formatTime(slot.start)} - {formatTime(slot.end)}
                                  {" | "}
                                  {Number(slot.price ?? 0).toLocaleString("vi-VN")}đ
                                </div>
                              ))}
                            </div>
                          </td>

                          <td>
                            {b.payment_method ||
                              "Tiền mặt"}
                          </td>

                          <td className="price-cell">
  {calculatePaidAmount(b).toLocaleString("vi-VN")}đ
</td>

                          {/* STATUS */}

                          <td>
                            <select
                              value={b.payment_status || "pending"}
                              disabled={updatingId === b.id}
                              onChange={(e) => updateStatus(b.id, e.target.value)}
                              className={`status-select ${b.payment_status || "pending"}`}
                            >
                              <option value="pending">
  Chưa thanh toán
</option>

<option value="deposit_paid">
  Đã cọc 30%
</option>

<option value="paid">
  Đã thanh toán đủ
</option>

<option value="refund_pending">
  Chờ hoàn tiền
</option>

<option value="refund_rejected">
  Từ chối hoàn tiền
</option>

<option value="refunded">
  Đã hoàn tiền
</option>
                            </select>
                          </td>

                          {/* ACTION */}

                          <td>
                            <div className="action-buttons">
                              <FaEye
                                className="view-btn"
                                onClick={() =>
                                  openBookingDetail(
                                    b
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9">
                        {loading
                          ? "Đang tải dữ liệu..."
                          : "Không có booking nào"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL */}

          {showModal &&
            selectedBooking && (
              <div className="modal-overlay">
                <div className="booking-modal">
                  <div className="modal-header">
                    <h2>
                      Chi tiết đơn đặt
                    </h2>

                    <FaTimes
                      className="close-icon"
                      onClick={() =>
                        setShowModal(
                          false
                        )
                      }
                    />
                  </div>

                  <div className="booking-detail">
                    <div className="detail-item">
                      <span>
                        Mã đơn:
                      </span>

                      <strong>
                        #
                        {
                          selectedBooking.id
                        }
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Khách hàng:
                      </span>

                      <strong>
                        {selectedBooking
                          .user?.name ||
                          selectedBooking.name}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Email:
                      </span>

                      <strong>
                        {selectedBooking
                          .user?.email ||
                          selectedBooking.email}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Sân bóng:
                      </span>

                      <strong>
                        {
                          selectedBooking
                            .field?.name
                        }
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Địa chỉ:
                      </span>

                      <strong>
                        {
                          selectedBooking
                            .field
                            ?.address
                        }
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Ngày đặt:
                      </span>

                      <strong>
                        {
                          selectedBooking.booking_date
                        }
                      </strong>
                    </div>

                    {/* ALL SLOTS */}

                    <div className="detail-item">
                      <span>
                        Tất cả khung giờ:
                      </span>

                      <div className="all-slot-detail">
                        {getBookingSlots(selectedBooking).map(
  (slot, index) => (
    <div
      key={index}
      className="slot-detail-item"
    >
      <FaClock />

      <span>
        {slot.date}
        {" | "}
        {slot.start}
        -
        {slot.end}
      </span>

      <strong>
        {slot.price.toLocaleString(
          "vi-VN"
        )}
        đ
      </strong>

      <button
        className="cancel-slot-btn"
        onClick={() =>
          handleCancelSlot(
            selectedBooking.id,
            slot
          )
        }
      >
        Hủy slot
      </button>
    </div>
))}


                      </div>
                    </div>

                    <div className="detail-item">
                      <span>
                        Thanh toán:
                      </span>

                      <strong>
                        {
                          selectedBooking.payment_method
                        }
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>
                        Trạng thái:
                      </span>

                      <strong
                        className={`status-text ${selectedBooking.payment_status || "pending"
                          }`}
                      >
                        {
                          {
                            pending:
                              "Chưa thanh toán",

                            deposit_paid:
                              "Đã cọc 30%",

                            paid:
                              "Đã thanh toán",

                            refund_pending:
                              "Chờ hoàn tiền",

                            refund_rejected:
                              "Từ chối hoàn tiền",

                            refunded:
                              "Đã hoàn tiền",
                          }[
                            selectedBooking.payment_status
                          ] ||
                          selectedBooking.payment_status
                        }
                      </strong>
                    </div>
                        <div className="detail-item">
  <span>Tổng giá sân:</span>

  <strong>
    {Number(
      selectedBooking.total_price || 0
    ).toLocaleString("vi-VN")}đ
  </strong>
</div>

<div className="detail-item">
  <span>Đã thanh toán:</span>

  <strong className="price-detail">
    {calculatePaidAmount(
      selectedBooking
    ).toLocaleString("vi-VN")}đ
  </strong>
</div>
                    <div className="detail-item">
                      <span>
                        Tổng tiền:
                      </span>

                      <strong className="price-detail">
  {calculatePaidAmount(selectedBooking).toLocaleString("vi-VN")}đ
</strong>
                    </div>
                    <div className="detail-item">
  <span>Tổng giá sân:</span>
  <strong>
    {calculateTotal(
      selectedBooking
    ).toLocaleString("vi-VN")}đ
  </strong>
</div>

<div className="detail-item">
  <span>Đã thanh toán:</span>
  <strong>
    {calculatePaidAmount(
      selectedBooking
    ).toLocaleString("vi-VN")}đ
  </strong>
</div>

<div className="detail-item">
  <span>Còn lại:</span>
  <strong>
    {calculateRemainingAmount(
      selectedBooking
    ).toLocaleString("vi-VN")}đ
  </strong>
</div>
                    {(selectedBooking.payment_status === "refund_pending" ||
                      selectedBooking.payment_status === "refunded") && (
                        <button
                          className="bank-btn"
                          onClick={() => setShowBank(true)}
                        >
                          Xem thông tin hoàn tiền
                        </button>
                      )}
                      {selectedBooking.payment_status ===
  "refund_pending" && (
  <div
    className="refund-actions"
  >

    <button
      className="refund-btn"
      onClick={() =>
        handleRefund(
          selectedBooking.id
        )
      }
    >
      Hoàn tiền
    </button>

    <button
      className="reject-btn"
      onClick={() =>
        handleRejectRefund(
          selectedBooking.id
        )
      }
    >
      Từ chối
    </button>

  </div>
)}
                    {showBank && (
                      <div className="modal-overlay">
                        <div className="bank-modal">
                          <div className="modal-header">
                            <h2>Thông tin hoàn tiền</h2>

                            <FaTimes
                              className="close-icon"
                              onClick={() => setShowBank(false)}
                            />
                          </div>

                          <div className="bank-info-box">
                            <p>
                              <strong>Ngân hàng:</strong>{" "}
                              {selectedBooking.refund_bank_name}
                            </p>

                            <p>
                              <strong>Số tài khoản:</strong>{" "}
                              {selectedBooking.refund_bank_number}
                            </p>

                            <p>
                              <strong>Chủ tài khoản:</strong>{" "}
                              {selectedBooking.refund_bank_owner}
                            </p>
                            <p>
  <strong>Lý do:</strong>{" "}
  {
    selectedBooking.refund_reason
  }
</p>

<p>
  <strong>
    Số tiền hoàn:
  </strong>{" "}
  {Number(
    selectedBooking.refund_amount ||
      0
  ).toLocaleString("vi-VN")}
  đ
</p>

<p>
  <strong>
    Ngày yêu cầu:
  </strong>{" "}
  {selectedBooking.refund_requested_at
    ? new Date(
        selectedBooking.refund_requested_at
      ).toLocaleString(
        "vi-VN"
      )
    : "-"}
</p>

<p>
  <strong>
    Ngày hoàn:
  </strong>{" "}
  {selectedBooking.refunded_at
    ? new Date(
        selectedBooking.refunded_at
      ).toLocaleString(
        "vi-VN"
      )
    : "-"}
</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      );
    }

    export default AdminBookings;