import React, {
  useEffect,
  useState,
} from "react";

import "./Style/AdminFields.css";

import {
  FaFutbol,
  FaChartBar,
  FaClipboardList,
  FaUsers,
  FaTrash,
  FaStar,
  FaComments,
  FaTicketAlt,
  FaBell,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import API from "../../services/api";

function AdminReviews() {

  // ================= STATE =================

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const userInfo = JSON.parse(
    localStorage.getItem(
      "userInfo"
    )
  );

  // ================= FETCH REVIEWS =================

  const fetchReviews =
    async () => {

      try {

        setLoading(true);

        // ================= GET FIELDS =================

        const fieldsRes =
          await API.get(
            "/fields"
          );

        const fields =
          Array.isArray(
            fieldsRes.data
          )
            ? fieldsRes.data
            : fieldsRes.data
              ?.fields || [];

        let allReviews = [];

        // ================= GET REVIEWS BY FIELD =================

        for (const field of fields) {

          try {

            const res =
              await API.get(
                `/reviews/field/${field.id}`
              );

            const fieldReviews =
              Array.isArray(
                res.data
              )
                ? res.data
                : res.data
                  ?.reviews || [];

            const mapped =
              fieldReviews.map(
                (review) => ({

                  ...review,

                  fieldName:
                    field.name,
                })
              );

            allReviews.push(
              ...mapped
            );

          } catch (err) {

            console.log(
              `Lỗi review sân ${field.id}:`,
              err
            );
          }
        }

        // ================= SORT NEWEST =================

        allReviews.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        );

        setReviews(
          allReviews
        );

      } catch (err) {

        console.log(
          "FETCH REVIEWS ERROR:",
          err
        );

        setReviews([]);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchReviews();

  }, []);

  // ================= DELETE =================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Xóa đánh giá này?"
        );

      if (!confirmDelete)
        return;

      try {

        await API.delete(
          `/reviews/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${userInfo?.token}`,
            },
          }
        );

        setReviews(
          (prev) =>
            prev.filter(
              (r) =>
                r.id !== id
            )
        );

        alert(
          "Xóa thành công"
        );

      } catch (err) {

        console.log(err);

        alert(
          "Xóa thất bại"
        );
      }
    };

  // ================= UI =================

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
            <li className="active">
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
            Quản lý đánh giá
          </h1>
        </div>

        {/* TABLE */}

        <div className="table-container">

          <table>

            <thead>
              <tr>

                <th>User</th>

                <th>Sân</th>

                <th>Đánh giá</th>

                <th>Bình luận</th>

                <th>Ngày</th>

                <th>Hành động</th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                    }}
                  >
                    Đang tải...
                  </td>
                </tr>

              ) : reviews.length >
                0 ? (

                reviews.map(
                  (review) => (

                    <tr
                      key={
                        review.id
                      }
                    >

                      {/* USER */}

                      <td>
                        {review
                          .user
                          ?.name ||
                          "User"}
                      </td>

                      {/* FIELD */}

                      <td>
                        {
                          review.fieldName
                        }
                      </td>

                      {/* RATING */}

                      <td>

                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap: "6px",

                            color:
                              "#facc15",

                            fontWeight:
                              "700",
                          }}
                        >
                          <FaStar />

                          {
                            review.rating
                          }

                        </div>
                      </td>

                      {/* COMMENT */}

                      <td>
                        {review.comment ||
                          "Không có nội dung"}
                      </td>

                      {/* DATE */}

                      <td>
                        {review.createdAt
                          ? new Date(
                            review.createdAt
                          ).toLocaleDateString(
                            "vi-VN"
                          )
                          : "Không có"}
                      </td>

                      {/* ACTION */}

                      <td>

                        <FaTrash
                          style={{
                            color:
                              "#dc2626",

                            cursor:
                              "pointer",
                          }}

                          onClick={() =>
                            handleDelete(
                              review.id
                            )
                          }
                        />

                      </td>
                    </tr>
                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign:
                        "center",

                      padding:
                        "30px",
                    }}
                  >
                    Không có đánh giá
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

export default AdminReviews;