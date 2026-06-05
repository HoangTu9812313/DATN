// src/pages/Checkout.js

import React, { useState } from "react";
import "./style/Checkout.css";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";

function Checkout() {
  const { state } = useLocation();

  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] =
    useState("deposit");

  const [loading, setLoading] =
    useState(false);

  const bookingData = state;

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const token =
    userInfo?.token ||
    localStorage.getItem("token");

  const [name, setName] = useState(
    userInfo?.user?.name ||
    userInfo?.name ||
    ""
  );

  const [phone, setPhone] = useState(
    userInfo?.user?.phone ||
    userInfo?.phone ||
    ""
  );

  const [note, setNote] =
    useState("");

  // ================= NO DATA =================
  if (!bookingData) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="summary-card-modern">
            <h2>
              ❌ Không có dữ liệu
            </h2>

            <button
              className="confirm-btn"
              onClick={() =>
                navigate("/")
              }
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= GET DATA =================
  const {
    field,
    selectedDate,
    selectedTimes,
    voucher,
    discountAmount = 0,
    finalTotal = 0,
  } = bookingData;

  // ================= FORMAT DATE =================
  const formatDate = (date) => {
    const d = new Date(date);

    const year =
      d.getFullYear();

    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formattedDate =
    formatDate(selectedDate);

  // ================= FORMAT TIME =================
  const formatTime = (time) => {
    if (!time) return "";

    return time.slice(0, 5);
  };

  // ================= SORT SLOT =================
  const sortedSlots = [
    ...(selectedTimes || []),
  ].sort((a, b) => {
    const dateCompare =
      a.booking_date.localeCompare(
        b.booking_date
      );

    if (dateCompare !== 0)
      return dateCompare;

    return a.start_time.localeCompare(
      b.start_time
    );
  });

  // ================= TOTAL =================
  const subtotal =
    sortedSlots.reduce(
      (total, slot) =>
        total +
        Number(slot.price || 0),
      0
    );

  const totalPrice =
    Number(finalTotal || subtotal);

  const finalDiscount =
    Number(discountAmount || 0);

  // ================= HANDLE BOOKING =================
  const handleConfirm = async () => {
    try {
      if (!userInfo) {
        alert("Vui lòng đăng nhập");
        return navigate("/login");
      }

      if (!token) {
        alert("Token không tồn tại");
        return;
      }

      if (!field?.id || !formattedDate || sortedSlots.length === 0) {
        alert("Thiếu dữ liệu đặt sân");
        return;
      }

      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // ================= CREATE BOOKING (NO HOLD HERE) =================
      const payload = {
        field_id: Number(field.id),

        bookings: sortedSlots.map(
          (slot) => ({
            date: slot.booking_date,
            slot: slot.start_time,
          })
        ),

        duration: 60,

        voucher_code:
          voucher?.code || null,

        name,
        phone,

        email:
          userInfo?.user?.email ||
          userInfo?.email ||
          "",

        payment_method:
          paymentMethod,
      };

      console.log(
        "BOOKING PAYLOAD",
        payload
      );

      const bookingRes = await API.post(
        "/bookings",
        payload,
        config
      );
      // ================= CASH =================


      const bookingIds =
        bookingRes.data?.bookings?.map(
          (b) => b.id
        ) || [];

      if (!bookingIds.length) {
        alert("Không tìm thấy booking");
        return;
      }

      const paymentRes = await API.post(
        "/bookings/payment/create",
        {
          bookingIds,

          amount:
            paymentMethod === "deposit"
              ? Math.round(
                Number(totalPrice) * 0.3
              )
              : Number(totalPrice),

          platform: "web",
        },
        config
      );

      if (paymentRes.data?.checkoutUrl) {
        window.location.href = paymentRes.data.checkoutUrl;
        return;
      }

      alert("Không tạo được link thanh toán");
    } catch (err) {
      console.log(err);

      const message = err.response?.data?.message || "";

      if (message.includes("Slot already taken")) {
        alert("❌ Một trong các khung giờ đã được đặt");
        return;
      }

      if (message.includes("token") || message.includes("jwt")) {
        alert("❌ Hết phiên đăng nhập");
        return navigate("/login");
      }

      alert(message || "❌ Lỗi thanh toán");
    } finally {
      setLoading(false);
    }
  };
  const handleCancelBooking = async () => {
    try {
      const confirmCancel = window.confirm(
        "Bạn có chắc muốn huỷ đặt sân?"
      );

      if (!confirmCancel) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      for (const slot of sortedSlots) {
        await API.post(
          "/bookings/cancel-hold",
          {
            field_id: Number(field.id),
            booking_date: slot.booking_date,
            start_time: slot.start_time,
          },
          config
        );
      }

      alert("Đã huỷ các khung giờ đã chọn");

      navigate(`/fields/${field.id}`);
    } catch (err) {
      console.log(err);

      alert("Không thể huỷ giữ sân");
    }
  };
  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* LEFT */}
        <div className="checkout-left">

          {/* BACK */}
          <button
            className="back-btn"
            onClick={() =>
              navigate(-1)
            }
          >
            <FaArrowLeft />
            Quay lại
          </button>

          {/* TITLE */}
          <h1 className="checkout-title">
            Thanh toán đặt sân
          </h1>

          {/* FIELD */}
          <div className="checkout-card field-card-clean">
            <img
              src={
                field?.images?.[0] ||
                "https://via.placeholder.com/600x400"
              }
              alt={field?.name}
              className="field-img"
            />

            <div className="field-body">

              <div className="field-row">
                <h2 className="field-title">
                  {field?.name}
                </h2>

                <span className="field-price">
                  {totalPrice.toLocaleString()}
                  đ
                </span>
              </div>

              <p className="field-address">
                <FaMapMarkerAlt />
                {" "}
                {field?.address}
              </p>

              <div className="field-tags">
                <span className="tag">
                  <FaCalendarAlt />
                  {" "}
                  {formattedDate}
                </span>
              </div>

            </div>
          </div>

          {/* SLOT LIST */}
          <div className="checkout-card">

            <h2>
              Khung giờ đã chọn
            </h2>

            <div className="selected-slot-list">

              {sortedSlots.map(
                (
                  slot,
                  index
                ) => (
                  <div
                    key={index}
                    className="selected-slot-item"
                  >

                    <div>
                      <div>
                        📅 {slot.booking_date}
                      </div>

                      <div>
                        <FaClock />

                        {formatTime(
                          slot.start_time
                        )}

                        {" - "}

                        {formatTime(
                          slot.end_time
                        )}
                      </div>
                    </div>

                    <strong>
                      {Number(
                        slot.price
                      ).toLocaleString()}
                      đ
                    </strong>

                  </div>
                )
              )}

            </div>
          </div>

          {/* USER INFO */}
          <div className="checkout-card">

            <h2>
              Thông tin người đặt
            </h2>

            {/* NAME */}
            <div className="form-group">

              <label>
                👤 Họ và tên
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Nhập họ và tên"
              />

            </div>

            {/* PHONE */}
            <div className="form-group">

              <label>
                📞 Số điện thoại
              </label>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="Nhập số điện thoại"
              />

            </div>

            {/* NOTE */}
            <div className="form-group">

              <label>
                📝 Ghi chú
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(
                    e.target.value
                  )
                }
                placeholder="Nhập ghi chú (nếu có)"
              />

            </div>

          </div>

          {/* PAYMENT */}
          <div className="checkout-card">

            <h2>
              Phương thức thanh toán
            </h2>

            <div className="payment-grid">

              {/* DEPOSIT */}
              <div
                className={`payment-box ${paymentMethod === "deposit"
                  ? "active-payment"
                  : ""
                  }`}
                onClick={() =>
                  setPaymentMethod("deposit")
                }
              >
                <div className="payment-icon banking">
                  <FaMoneyBillWave />
                </div>

                <div className="payment-info">
                  <h4>Đặt cọc 30%</h4>

                  <p>
                    Thanh toán trước 30% giá trị đơn sân
                  </p>
                </div>
              </div>

              {/* FULL PAYMENT */}
              <div
                className={`payment-box ${paymentMethod === "banking"
                  ? "active-payment"
                  : ""
                  }`}
                onClick={() =>
                  setPaymentMethod("banking")
                }
              >
                <div className="payment-icon banking">
                  <FaMoneyBillWave />
                </div>

                <div className="payment-info">
                  <h4>Thanh toán toàn bộ</h4>

                  <p>
                    Thanh toán 100% giá trị đơn sân
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="checkout-right">

          <div className="summary-card-modern">

            <h2 className="summary-title">
              🧾 Tóm tắt đơn đặt
            </h2>

            <div className="summary-info">

              <div className="summary-row">
                <span className="label">
                  Sân
                </span>

                <span className="value">
                  {field?.name}
                </span>
              </div>

              <div className="summary-row">
                <span className="label">
                  Ngày
                </span>

                <span className="value">
                  {formattedDate}
                </span>
              </div>

              <div className="summary-row">
                <span className="label">
                  Số khung giờ
                </span>

                <span className="value">
                  {
                    sortedSlots.length
                  }
                </span>
              </div>

            </div>

            {/* SLOT LIST */}
            <div className="summary-slot-list">

              {sortedSlots.map(
                (
                  slot,
                  index
                ) => (
                  <div
                    key={index}
                    className="summary-slot-item"
                  >

                    <span>

                      {formatTime(
                        slot.start_time
                      )}

                      {" - "}

                      {formatTime(
                        slot.end_time
                      )}

                    </span>

                    <strong>

                      {Number(
                        slot.price
                      ).toLocaleString()}
                      đ

                    </strong>

                  </div>
                )
              )}

            </div>

            <div className="divider"></div>

            {/* TOTAL */}
            {/* SUBTOTAL */}

            <div className="summary-row">
              <span className="label">
                Tạm tính
              </span>

              <span className="value">
                {subtotal.toLocaleString()}đ
              </span>
            </div>

            {/* DISCOUNT */}

            {finalDiscount > 0 && (
              <div className="summary-row">
                <span className="label">
                  Giảm giá
                </span>

                <span
                  className="value"
                  style={{
                    color: "#22c55e",
                  }}
                >
                  -{finalDiscount.toLocaleString()}đ
                </span>
              </div>
            )}
            <div className="summary-total">

              <span>
                Tổng thanh toán
              </span>

              <h1>
                {totalPrice.toLocaleString()}
                đ
              </h1>

            </div>
            <div className="summary-row">
              <span className="label">
                Thanh toán ngay
              </span>

              <span
                className="value"
                style={{
                  color: "#22c55e",
                  fontWeight: "700",
                }}
              >
                {(
                  paymentMethod === "deposit"
                    ? totalPrice * 0.3
                    : totalPrice
                ).toLocaleString()}
                đ
              </span>
            </div>
            {paymentMethod === "deposit" && (
              <div className="summary-row">
                <span className="label">
                  Thanh toán tại sân
                </span>

                <span className="value">
                  {Math.round(
                    totalPrice * 0.7
                  ).toLocaleString()}
                  đ
                </span>
              </div>
            )}
            {/* BUTTON */}

            <button
              className="confirm-btn"
              onClick={
                handleConfirm
              }
              disabled={loading}
            >

              {loading
                ? "Đang xử lý..."
                : paymentMethod ===
                  "deposit"
                  ? "Thanh toán cọc 30%"
                  : "Thanh toán toàn bộ"}

            </button>

            <button
              className="cancel-btn"
              onClick={handleCancelBooking}
              disabled={loading}
            >
              Huỷ đặt sân
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Checkout;