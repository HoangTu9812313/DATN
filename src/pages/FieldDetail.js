import React, {
  useEffect,
  useState,
} from "react";

import "./style/FieldDetail.css";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";

import socket from "../services/socket";

import {
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

function FieldDetail() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [field, setField] =
    useState(null);

  const [slots, setSlots] =
    useState([]);
  const [pricingRules, setPricingRules] =
    useState([]);
  const [loading, setLoading] =
    useState(true);

  const [duration, setDuration] =
    useState(60);

  const [
    selectedTimes,
    setSelectedTimes,
  ] = useState([]);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(new Date());

  const [
    bookingsByDate,
    setBookingsByDate,
  ] = useState({});

  // ================= REVIEW =================

  const [reviews, setReviews] =
    useState([]);

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [
    reviewLoading,
    setReviewLoading,
  ] = useState(false);
  // ================= VOUCHER =================

  const [voucherCode, setVoucherCode] =
    useState("");

  const [voucher, setVoucher] =
    useState(null);

  const [discountAmount, setDiscountAmount] =
    useState(0);

  const [voucherLoading, setVoucherLoading] =
    useState(false);
  // ================= DATE =================

  const formatDate = (
    date
  ) => {
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

  // ================= NORMALIZE =================

  const normalizeTime = (
    time
  ) => {
    if (!time) return "";

    return time
      .toString()
      .slice(0, 5);
  };
  const getPriceForTime = (
    startTime,
    duration
  ) => {

    const rule =
      pricingRules.find(
        (p) =>
          startTime >= p.start_time &&
          startTime < p.end_time
      );

    if (rule) {
      return (
        Number(rule.price_per_hour) *
        (duration / 60)
      );
    }

    return (
      Number(field?.price_per_hour || 0) *
      (duration / 60)
    );
  };

  const getRuleForTime = (startTime) => {
    return pricingRules.find(
      (p) =>
        startTime >= p.start_time &&
        startTime < p.end_time
    );
  };
  const isPastTime = (slot) => {
    const now = new Date();

    const selected = new Date(selectedDate);

    // Chỉ kiểm tra khi là ngày hôm nay
    const isToday =
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate();

    if (!isToday) return false;

    const [hour, minute] = slot.start_time
      .split(":")
      .map(Number);

    const slotDate = new Date(selected);

    slotDate.setHours(hour);
    slotDate.setMinutes(minute);
    slotDate.setSeconds(0);
    slotDate.setMilliseconds(0);

    return slotDate < now;
  };
  // ================= GENERATE SLOT =================

  const generateSlots = (
    field
  ) => {
    if (!field) return [];

    const result = [];

    const [
      openH,
      openM,
    ] = field.open_time
      .split(":")
      .map(Number);

    const [
      closeH,
      closeM,
    ] = field.close_time
      .split(":")
      .map(Number);

    const open =
      openH * 60 + openM;

    const close =
      closeH * 60 + closeM;

    const slotDuration =
      duration;

    const step = 30;

    for (
      let start = open;
      start + slotDuration <=
      close;
      start += step
    ) {
      const end =
        start + slotDuration;

      const sh = Math.floor(
        start / 60
      );

      const sm = start % 60;

      const eh = Math.floor(
        end / 60
      );

      const em = end % 60;

      const startTime =
        `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;

      const endTime =
        `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

      const rule = getRuleForTime(startTime);

      result.push({
        start_time: startTime,
        end_time: endTime,
        price: getPriceForTime(
          startTime,
          slotDuration
        ),
        label: rule?.label || "default",
      });
    }

    return result;
  };

  // ================= FETCH FIELD =================

  const fetchField =
    async () => {
      try {
        const res =
          await API.get(
            `/fields/${id}`
          );

        setField(res.data);

        setSlots(
          generateSlots(
            res.data
          )
        );
      } catch (err) {
        console.log(err);

        alert(
          "Không tải được sân"
        );
      }
    };


  const fetchPricing = async () => {
    try {
      const res = await API.get(
        `/field-pricing/${id}`
      );

      console.log(
        "PRICING DATA:",
        res.data
      );

      setPricingRules(
        res.data.pricing || []
      );
    } catch (err) {
      console.log(
        "FETCH PRICING ERROR",
        err
      );
    }
  };
  // ================= FETCH REVIEW =================

  const fetchReviews =
    async () => {
      try {

        const res =
          await API.get(
            `/reviews/field/${id}`
          );

        setReviews(
          res.data || []
        );

      } catch (err) {

        console.log(
          "FETCH REVIEW ERROR:",
          err
        );
      }
    };

  useEffect(() => {
    const load =
      async () => {
        setLoading(true);

        await fetchField();

        await fetchPricing();

        await fetchReviews();

        setLoading(false);
      };

    load();
  }, [id]);

  // ================= UPDATE SLOT =================

  useEffect(() => {
    if (field) {
      setSlots(
        generateSlots(field)
      );
    }
  }, [
    duration,
    field,
    pricingRules,
  ]);

  // ================= FETCH BOOKINGS =================

  const fetchBookings =
    async () => {
      try {
        const user =
          JSON.parse(
            localStorage.getItem(
              "userInfo"
            )
          );

        const res =
          await API.get(
            `/bookings?field_id=${id}&booking_date=${formattedDate}`
          );

        const bookings =
          res.data.bookings ||
          [];

        const grouped = {};

        bookings.forEach((b) => {
          const date =
            b.booking_date;

          if (
            !grouped[date]
          ) {
            grouped[date] = {
              booked: [],
              holding: [],
            };
          }

          const occupied =
            b.occupied_slots ||
            [
              normalizeTime(
                b.start_time
              ),
            ];

          if (
            b.status ===
            "booked" ||
            b.status ===
            "completed"
          ) {
            grouped[
              date
            ].booked.push(
              ...occupied.map(
                (t) =>
                  normalizeTime(
                    t
                  )
              )
            );
          }

          if (
            b.status ===
            "holding"
          ) {
            grouped[
              date
            ].holding.push(
              ...occupied.map(
                (t) =>
                  normalizeTime(
                    t
                  )
              )
            );
          }
        });

        Object.keys(
          grouped
        ).forEach((date) => {
          grouped[
            date
          ].booked = [
              ...new Set(
                grouped[date]
                  .booked
              ),
            ];

          grouped[
            date
          ].holding = [
              ...new Set(
                grouped[date]
                  .holding
              ),
            ];
        });

        setBookingsByDate(
          grouped
        );

        if (user) {
          const myHolding = bookings.filter(
            (b) =>
              b.status === "holding" &&
              Number(
                b.user_id || b.userId
              ) === Number(user.id)
          );

          setSelectedTimes((prev) => {
            const keepOldDates =
              prev.filter(
                (s) =>
                  s.booking_date !==
                  formattedDate
              );

            const currentDateSlots =
              myHolding.map((b) => ({
                booking_date:
                  b.booking_date,

                start_time:
                  normalizeTime(
                    b.start_time
                  ),

                end_time:
                  normalizeTime(
                    b.end_time
                  ),

                price:
                  field?.price_per_hour ||
                  0,
              }));

            return [
              ...keepOldDates,
              ...currentDateSlots,
            ];
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    if (!field) return;

    fetchBookings();
  }, [
    selectedDate,
    id,
    field?.id,
  ]);

  // ================= CHECK SLOT =================

  const isBooked = (
    slot
  ) => {
    const data =
      bookingsByDate?.[
      formattedDate
      ];

    if (!data)
      return false;

    return data.booked?.some(
      (t) =>
        normalizeTime(t) ===
        normalizeTime(
          slot.start_time
        )
    );
  };

  const isHolding = (
    slot
  ) => {
    const data =
      bookingsByDate?.[
      formattedDate
      ];

    if (!data)
      return false;

    return data.holding?.some(
      (t) =>
        normalizeTime(t) ===
        normalizeTime(
          slot.start_time
        )
    );
  };

  // ================= SOCKET =================

  useEffect(() => {
    socket.emit(
      "join_field",
      id
    );

    const handleSlotUpdate =
      (data) => {
        if (
          Number(
            data.field_id
          ) !== Number(id)
        )
          return;

        const slotTime =
          normalizeTime(
            data.time ||
            data.start_time ||
            data.startTime
          );

        if (!slotTime)
          return;

        setBookingsByDate(
          (prev) => {
            const dayData =
              prev[
              formattedDate
              ] || {
                booked: [],
                holding: [],
              };

            if (
              data.status ===
              "booked"
            ) {
              return {
                ...prev,

                [formattedDate]:
                {
                  booked:
                    [
                      ...new Set(
                        [
                          ...dayData.booked,
                          slotTime,
                        ]
                      ),
                    ],

                  holding:
                    dayData.holding.filter(
                      (
                        t
                      ) =>
                        t !==
                        slotTime
                    ),
                },
              };
            }

            if (
              data.status ===
              "holding"
            ) {
              return {
                ...prev,

                [formattedDate]:
                {
                  ...dayData,

                  holding:
                    [
                      ...new Set(
                        [
                          ...dayData.holding,
                          slotTime,
                        ]
                      ),
                    ],
                },
              };
            }

            if (
              data.status ===
              "available" ||
              data.status ===
              "cancelled"
            ) {
              return {
                ...prev,

                [formattedDate]:
                {
                  booked:
                    dayData.booked.filter(
                      (
                        t
                      ) =>
                        t !==
                        slotTime
                    ),

                  holding:
                    dayData.holding.filter(
                      (
                        t
                      ) =>
                        t !==
                        slotTime
                    ),
                },
              };
            }

            return prev;
          }
        );
      };

    socket.on(
      "slot_update",
      handleSlotUpdate
    );

    return () => {
      socket.emit(
        "leave_field",
        id
      );

      socket.off(
        "slot_update",
        handleSlotUpdate
      );
    };
  }, [id, formattedDate]);

  // ================= SELECT SLOT =================

  const handleSelectTime =
    async (slot) => {
      if (isPastTime(slot)) {
        return alert(
          "Khung giờ này đã qua, không thể đặt"
        );
      }
      const user =
        JSON.parse(
          localStorage.getItem(
            "userInfo"
          )
        );

      if (!user)
        return alert(
          "Vui lòng đăng nhập"
        );

      const token =
        localStorage.getItem(
          "token"
        );

      const slotTime =
        normalizeTime(
          slot.start_time
        );

      const alreadySelected =
        selectedTimes.some(
          (s) =>
            s.booking_date === formattedDate &&
            normalizeTime(s.start_time) === slotTime
        );

      if (
        alreadySelected
      ) {
        try {
          await API.post(
            "/bookings/cancel-hold",
            {
              field_id:
                Number(id),

              booking_date:
                formattedDate,

              start_time:
                slotTime,
            },

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          setSelectedTimes(
            (prev) =>
              prev.filter(
                (s) =>
                  !(
                    s.booking_date === formattedDate &&
                    normalizeTime(s.start_time) === slotTime
                  )
              )
          );

          return;
        } catch (err) {
          console.log(err);

          return alert(
            "Không thể bỏ giữ sân"
          );
        }
      }

      if (isBooked(slot))
        return alert(
          "🔴 Slot đã được đặt"
        );

      if (
        isHolding(slot)
      )
        return alert(
          "🟡 Slot đang được giữ"
        );

      try {
        await API.post(
          "/bookings/hold",

          {
            field_id:
              Number(id),

            booking_date:
              formattedDate,

            start_time:
              slotTime,

            duration,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setSelectedTimes((prev) => [
          ...prev,
          {
            booking_date: formattedDate,
            start_time: slotTime,
            end_time: slot.end_time,
            price: slot.price,
          },
        ]);
      } catch (err) {
        console.log(err);

        alert(
          err.response?.data
            ?.message ||
          "Không thể giữ sân"
        );
      }
    };

  // ================= BOOKING =================
  // ================= TOTAL =================

  const subtotal = selectedTimes.reduce(
    (t, s) =>
      t + Number(s.price || 0),
    0
  );

  const finalTotal =
    subtotal - discountAmount > 0
      ? subtotal - discountAmount
      : 0;
  // ================= APPLY VOUCHER =================

  // ================= APPLY VOUCHER =================

  const handleApplyVoucher =
    async () => {

      if (!voucherCode.trim()) {

        return alert(
          "Vui lòng nhập mã voucher"
        );
      }

      try {

        setVoucherLoading(true);

        const user =
          JSON.parse(
            localStorage.getItem(
              "userInfo"
            )
          );

        const res =
          await API.post(
            "/vouchers/validate",
            {
              code:
                voucherCode.trim(),

              amount:
                Number(subtotal),

              userId:
                user?.id,
            }
          );

        const data =
          res.data;

        console.log(
          "VOUCHER RESPONSE:",
          data
        );

        // ================= INVALID =================

        if (!data.valid) {

          setVoucher(null);

          setDiscountAmount(0);

          return alert(
            data.message ||
            "Voucher không hợp lệ"
          );
        }

        // ================= SUCCESS =================

        setVoucher(
          data.voucher
        );

        // QUAN TRỌNG
        setDiscountAmount(
          Number(
            data.discount || 0
          )
        );

        alert(
          `Giảm ${Number(
            data.discount || 0
          ).toLocaleString()}đ`
        );

      } catch (err) {

        console.log(
          "VOUCHER ERROR:",
          err
        );

        setVoucher(null);

        setDiscountAmount(0);

        alert(
          err.response?.data
            ?.message ||
          "Voucher không hợp lệ"
        );

      } finally {

        setVoucherLoading(false);
      }
    };
  const handleBooking =
    () => {
      const user =
        JSON.parse(
          localStorage.getItem(
            "userInfo"
          )
        );

      if (!user)
        return alert(
          "Vui lòng đăng nhập"
        );

      if (
        selectedTimes.length ===
        0
      ) {
        return alert(
          "Vui lòng chọn ít nhất 1 khung giờ"
        );
      }

      navigate(
        "/checkout",
        {
          state: {
            voucher,
            discountAmount,
            finalTotal,
            field,

            selectedDate:
              formattedDate,

            selectedTimes,

            duration,

            user,
          },
        }
      );
    };

  // ================= CREATE REVIEW =================

  const handleCreateReview =
    async () => {
      try {
        const user =
          JSON.parse(
            localStorage.getItem(
              "userInfo"
            )
          );

        if (!user) {
          return alert(
            "Vui lòng đăng nhập"
          );
        }

        if (!comment.trim()) {
          return alert(
            "Vui lòng nhập nội dung đánh giá"
          );
        }

        if (!user.id) {
          return alert(
            "Không tìm thấy user id"
          );
        }

        setReviewLoading(true);

        const payload = {
          fieldId: Number(id),

          userId: Number(
            user.id
          ),

          rating: Number(
            rating
          ),

          comment:
            comment.trim(),
        };

        console.log(
          "REVIEW PAYLOAD:",
          payload
        );

        const res =
          await API.post(
            "/reviews",
            payload
          );

        console.log(
          "REVIEW SUCCESS:",
          res.data
        );

        setComment("");

        setRating(5);

        await fetchReviews();

        alert(
          "Đánh giá thành công"
        );
      } catch (err) {
        console.log(
          "CREATE REVIEW ERROR:",
          err
        );

        console.log(
          "ERROR RESPONSE:",
          err.response?.data
        );

        alert(
          err.response?.data
            ?.message ||
          "Không thể gửi đánh giá"
        );
      } finally {
        setReviewLoading(false);
      }
    };
  // ================= UI =================

  const getDaysInMonth =
    () => {
      const year =
        selectedDate.getFullYear();

      const month =
        selectedDate.getMonth();

      const lastDay =
        new Date(
          year,
          month + 1,
          0
        );

      const firstDay =
        new Date(
          year,
          month,
          1
        ).getDay();

      const days = [];

      for (
        let i = 0;
        i < firstDay;
        i++
      ) {
        days.push(null);
      }

      for (
        let i = 1;
        i <=
        lastDay.getDate();
        i++
      ) {
        days.push(i);
      }

      return days;
    };

  if (
    loading ||
    !field
  ) {
    return (
      <div>
        Đang tải...
      </div>
    );
  }

  return (
    <div className="field-detail">
      <div className="detail-banner">
        <img
          src={
            field.images?.[0]
          }
          alt={field.name}
        />

        <div className="overlay">
          <h1>
            {field.name}
          </h1>

          <p>
            <FaMapMarkerAlt />{" "}
            {field.address}
          </p>
        </div>
      </div>

      <div className="detail-container">

        <div className="detail-left">
          {/* SLOT */}

          <div className="detail-card">
            <h2>
              Chọn khung giờ
            </h2>

            <div className="duration-select">
              <button
                className={
                  duration ===
                    60
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setDuration(
                    60
                  )
                }
              >
                60 phút
              </button>

              <button
                className={
                  duration ===
                    90
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setDuration(
                    90
                  )
                }
              >
                90 phút
              </button>
            </div>

            <div className="time-grid">
              {slots.map(
                (
                  slot,
                  i
                ) => {
                  const selected =
                    selectedTimes.some(
                      (s) =>
                        s.booking_date === formattedDate &&
                        normalizeTime(s.start_time) ===
                        normalizeTime(slot.start_time)
                    );

                  return (
                    <div
                      key={i}
                      className={`time-slot
  ${isPastTime(slot) ? "past-slot" : ""}
  ${isBooked(slot) ? "booked-slot" : ""}
  ${isHolding(slot) && !selected ? "holding-slot" : ""}
  ${selected ? "selected" : ""}
`}
                      onClick={() => {
                        if (isPastTime(slot))
                          return;

                        if (isBooked(slot))
                          return;

                        if (
                          isHolding(slot) &&
                          !selected
                        )
                          return;

                        handleSelectTime(slot);
                      }}
                    >
                      <div>
                        <FaClock /> {slot.start_time} - {slot.end_time}

                        {isPastTime(slot) && (
                          <span
                            style={{
                              marginLeft: 8,
                              color: "red",
                              fontWeight: "bold"
                            }}
                          >
                            ⛔ Đã qua
                          </span>
                        )}
                      </div>

                      <div>
                        {Number(
                          slot.price
                        ).toLocaleString()}
                        đ

                        {slot.label === "peak" && (
                          <span className="golden-badge peak">
                            🔥 Giờ cao điểm
                          </span>
                        )}

                        {slot.label === "night" && (
                          <span className="golden-badge night">
                            🌙 Ca đêm
                          </span>
                        )}

                        {slot.label === "normal" && (
                          <span className="golden-badge normal">
                            ⚽ Thường
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* DATE */}

          <div className="detail-card">
            <h2>
              Chọn ngày
            </h2>

            <div className="days-grid">
              {getDaysInMonth().map(
                (
                  day,
                  i
                ) => (
                  <div
                    key={i}
                    className={`day ${selectedDate.getDate() ===
                      day
                      ? "active-day"
                      : ""
                      }`}
                    onClick={() => {
                      if (!day) return;

                      const newDate = new Date(selectedDate);
                      newDate.setDate(day);

                      const today = new Date();

                      today.setHours(0, 0, 0, 0);
                      newDate.setHours(0, 0, 0, 0);

                      if (newDate < today) {
                        return;
                      }

                      setSelectedDate(newDate);
                    }}
                  >
                    {day}
                  </div>
                )
              )}
            </div>
          </div>

          {/* REVIEW */}

          <div className="detail-card review-section">
            <h2>
              Đánh giá sân
            </h2>

            <div className="review-form">
              <select
                className="rating-select"
                value={rating}
                onChange={(e) =>
                  setRating(Number(e.target.value))
                }
              >
                <option value={5}>
                  ⭐⭐⭐⭐⭐
                </option>

                <option value={4}>
                  ⭐⭐⭐⭐
                </option>

                <option value={3}>
                  ⭐⭐⭐
                </option>

                <option value={2}>
                  ⭐⭐
                </option>

                <option value={1}>
                  ⭐
                </option>
              </select>

              <textarea
                placeholder="Nhập đánh giá của bạn..."
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
              />

              <button
                className="review-submit-btn"
                onClick={handleCreateReview}
                disabled={reviewLoading}
              >
                {reviewLoading
                  ? "Đang gửi..."
                  : "Gửi đánh giá"}
              </button>
            </div>

            <div className="review-list">
              {reviews.length >
                0 ? (
                reviews.map(
                  (
                    review
                  ) => (
                    <div
                      className="review-item"
                      key={
                        review.id
                      }
                    >
                      <div className="review-top">
                        <img
                          src={
                            review
                              .user
                              ?.avatar ||
                            "https://i.pravatar.cc/100"
                          }
                          alt=""
                        />

                        <div>
                          <h4>
                            {review
                              .user
                              ?.name ||
                              "User"}
                          </h4>

                          <span>
                            {"⭐".repeat(
                              review.rating
                            )}
                          </span>
                        </div>
                      </div>

                      <p>
                        {
                          review.comment
                        }
                      </p>
                    </div>
                  )
                )
              ) : (
                <p>
                  Chưa có đánh
                  giá nào
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="detail-right">
          <div className="booking-card">
            <h2>
              {field.name}
            </h2>
            <div className="field-description">
              <p>
                {field.description ||
                  "Chưa có mô tả cho sân bóng này"}
              </p>
            </div>
            <div>
              📅 {formattedDate}
            </div>

            <div>
              ⏱️ {duration} phút
            </div>

            <div>
              🕒{" "}
              {selectedTimes.length > 0 ? (
                selectedTimes.map((slot, i) => (
                  <div key={i}>
                    <div>
                      📅 {slot.booking_date}
                    </div>

                    <div>
                      🕒 {slot.start_time} - {slot.end_time}
                    </div>
                  </div>
                ))
              ) : (
                "Chưa chọn"
              )}
            </div>

            <div>
              💰{" "}
              {selectedTimes
                .reduce(
                  (t, s) =>
                    t + Number(s.price),
                  0
                )
                .toLocaleString()}
              đ
            </div>
            {/* VOUCHER */}

            <div className="voucher-box">

              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={voucherCode}
                onChange={(e) =>
                  setVoucherCode(
                    e.target.value
                  )
                }
              />

              <button
                className="voucher-btn"
                onClick={
                  handleApplyVoucher
                }
                disabled={
                  voucherLoading
                }
              >
                {voucherLoading
                  ? "Đang kiểm tra..."
                  : "Áp dụng"}
              </button>

            </div>

            {/* PRICE */}

            <div className="price-summary">

              <div>
                <span>Tạm tính:</span>

                <strong>
                  {subtotal.toLocaleString()}đ
                </strong>
              </div>

              <div>
                <span>Giảm giá:</span>

                <strong
                  style={{
                    color: "#22c55e",
                  }}
                >
                  - {discountAmount.toLocaleString()}đ
                </strong>
              </div>

              <div className="final-total">
                <span>Tổng tiền:</span>

                <strong>
                  {finalTotal.toLocaleString()}đ
                </strong>
              </div>

            </div>
            <button
              onClick={
                handleBooking
              }
            >
              Đặt sân ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FieldDetail;