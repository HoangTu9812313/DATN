import React, {
  useEffect,
  useState,
} from "react";

import "./AdminVoucher.css";
import {
  FaFutbol,
  FaChartBar,
  FaClipboardList,
  FaUsers,
  FaEdit,
  FaTrash,
  FaTimes,
  FaComments,
  FaTicketAlt,
  FaBell
} from "react-icons/fa";

import { Link } from "react-router-dom";

import API from "../../services/api";

function AdminVouchers() {

  // ================= STATE =================

  const [vouchers, setVouchers] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingVoucher, setEditingVoucher] =
    useState(null);

  const [formData, setFormData] =
    useState({

      code: "",
      type: "percent",
      value: "",
      minAmount: "",
      maxDiscount: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      isActive: true,
      isOneTimePerUser: false,
    });

  const userInfo =
    JSON.parse(
      localStorage.getItem(
        "userInfo"
      )
    );

  // ================= FETCH =================

  const fetchVouchers =
    async () => {

      try {

        const res =
          await API.get(
            "/vouchers"
          );

        const data =
          Array.isArray(
            res.data
          )
            ? res.data
            : [];

        setVouchers(data);

      } catch (err) {

        console.log(err);

        setVouchers([]);
      }
    };

  useEffect(() => {

    fetchVouchers();

  }, []);

  // ================= HANDLE INPUT =================

  const handleChange =
    (e) => {

      const {
        name,
        value,
        type,
        checked,
      } = e.target;

      setFormData({

        ...formData,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      });
    };

  // ================= OPEN ADD =================

  const openAddModal =
    () => {

      setEditingVoucher(null);

      setFormData({

        code: "",
        type: "percent",
        value: "",
        minAmount: "",
        maxDiscount: "",
        usageLimit: "",
        startDate: "",
        endDate: "",
        isActive: true,
        isOneTimePerUser: false,
      });

      setShowModal(true);
    };

  // ================= OPEN EDIT =================

  const openEditModal =
    (voucher) => {

      setEditingVoucher(voucher);

      setFormData({

        code:
          voucher.code || "",

        type:
          voucher.type || "percent",

        value:
          voucher.value || "",

        minAmount:
          voucher.minAmount || "",

        maxDiscount:
          voucher.maxDiscount || "",

        usageLimit:
          voucher.usageLimit || "",

        startDate:
          voucher.startDate
            ? voucher.startDate.slice(0, 16)
            : "",

        endDate:
          voucher.endDate
            ? voucher.endDate.slice(0, 16)
            : "",

        isActive:
          voucher.isActive,

        isOneTimePerUser:
          voucher.isOneTimePerUser,
      });

      setShowModal(true);
    };

  // ================= SUBMIT =================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        const token =
          userInfo?.token;

        const config = {

          headers: {

            Authorization:
              `Bearer ${token}`,
          },
        };

        if (
          editingVoucher
        ) {

          await API.put(

            `/vouchers/${editingVoucher.id}`,

            formData,

            config
          );

          alert(
            "Cập nhật voucher thành công"
          );

        } else {

          await API.post(

            "/vouchers",

            formData,

            config
          );

          alert(
            "Tạo voucher thành công"
          );
        }

        setShowModal(false);

        fetchVouchers();

      } catch (err) {

        console.log(err);

        alert(

          err.response?.data?.message ||
          "Lỗi server"
        );
      }
    };

  // ================= DELETE =================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Xóa voucher này?"
        );

      if (
        !confirmDelete
      ) return;

      try {

        const token =
          userInfo?.token;

        await API.delete(

          `/vouchers/${id}`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setVouchers(
          (prev) =>

            prev.filter(
              (v) =>
                v.id !== id
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
            <li>
              <FaComments />
              Đánh giá
            </li>
          </Link>

          <Link to="/admin/AdminVouchers">
            <li className="active">
              <FaTicketAlt />
              Voucher
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
            Quản lý Voucher
          </h1>

          <button
            className="add-btn"
            onClick={
              openAddModal
            }
          >
            + Thêm Voucher
          </button>

        </div>

        {/* TABLE */}

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>Code</th>

                <th>Loại</th>

                <th>Giá trị</th>

                <th>Đơn tối thiểu</th>

                <th>Giảm tối đa</th>

                <th>Số lượt</th>

                <th>Bắt đầu</th>

                <th>Kết thúc</th>

                <th>Trạng thái</th>

                <th>1 user / 1 lần</th>

                <th>Hành động</th>

              </tr>

            </thead>

            <tbody>

              {vouchers.map(
                (voucher) => (

                <tr
                  key={voucher.id}
                >

                  <td>
                    {voucher.code}
                  </td>

                  <td>
                    {voucher.type}
                  </td>

                  <td>
                    {voucher.value}
                  </td>

                  <td>
                    {voucher.minAmount}
                  </td>

                  <td>
                    {voucher.maxDiscount}
                  </td>

                  <td>
                    {voucher.usageLimit}
                  </td>

                  <td>

                    {voucher.startDate
                      ? new Date(
                          voucher.startDate
                        ).toLocaleDateString(
                          "vi-VN"
                        )
                      : ""}

                  </td>

                  <td>

                    {voucher.endDate
                      ? new Date(
                          voucher.endDate
                        ).toLocaleDateString(
                          "vi-VN"
                        )
                      : ""}

                  </td>

                  <td>

                    {voucher.isActive
                      ? "Hoạt động"
                      : "Ẩn"}

                  </td>

                  <td>

                    {voucher.isOneTimePerUser
                      ? "Có"
                      : "Không"}

                  </td>

                  <td
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >

                    <FaEdit
                      style={{
                        cursor: "pointer",
                        color: "#2563eb",
                      }}
                      onClick={() =>
                        openEditModal(
                          voucher
                        )
                      }
                    />

                    <FaTrash
                      style={{
                        cursor: "pointer",
                        color: "red",
                      }}
                      onClick={() =>
                        handleDelete(
                          voucher.id
                        )
                      }
                    />

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

        {/* MODAL */}

        {showModal && (

          <div className="modal-overlay">

            <div className="modal">

              <div className="modal-header">

                <h2>

                  {editingVoucher
                    ? "Sửa Voucher"
                    : "Thêm Voucher"}

                </h2>

                <FaTimes
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setShowModal(false)
                  }
                />

              </div>

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <input
                  name="code"
                  value={
                    formData.code
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Mã voucher"
                  required
                />

                <select
                  name="type"
                  value={
                    formData.type
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="percent">
                    Giảm %
                  </option>

                  <option value="fixed">
                    Giảm tiền
                  </option>

                </select>

                <input
                  type="number"
                  name="value"
                  value={
                    formData.value
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Giá trị giảm"
                  required
                />

                <input
                  type="number"
                  name="minAmount"
                  value={
                    formData.minAmount
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Đơn tối thiểu"
                />

                <input
                  type="number"
                  name="maxDiscount"
                  value={
                    formData.maxDiscount
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Giảm tối đa"
                />

                <input
                  type="number"
                  name="usageLimit"
                  value={
                    formData.usageLimit
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Số lượt sử dụng"
                />

                <label>
                  Ngày bắt đầu
                </label>

                <input
                  type="datetime-local"
                  name="startDate"
                  value={
                    formData.startDate
                  }
                  onChange={
                    handleChange
                  }
                />

                <label>
                  Ngày kết thúc
                </label>

                <input
                  type="datetime-local"
                  name="endDate"
                  value={
                    formData.endDate
                  }
                  onChange={
                    handleChange
                  }
                />

                <label
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      formData.isActive
                    }
                    onChange={
                      handleChange
                    }
                  />

                  Hoạt động

                </label>

                <label
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >

                  <input
                    type="checkbox"
                    name="isOneTimePerUser"
                    checked={
                      formData.isOneTimePerUser
                    }
                    onChange={
                      handleChange
                    }
                  />

                  1 user / 1 lần

                </label>

                <button
                  type="submit"
                  className="add-btn"
                  style={{
                    marginTop: "15px",
                  }}
                >

                  {editingVoucher
                    ? "Cập nhật"
                    : "Thêm Voucher"}

                </button>

              </form>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default AdminVouchers;

