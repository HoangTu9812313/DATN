import React, {
  useEffect,
  useState,
} from "react";

import "./Style/AdminUsers.css";

import {
  FaFutbol,
  FaChartBar,
  FaClipboardList,
  FaUsers,
  FaTrash,
  FaEdit,
  FaTimes,
  FaPlus,
  FaComments,
  FaTicketAlt,
  FaBell
} from "react-icons/fa";

import { Link } from "react-router-dom";
import API from "../../services/api";

function AdminUsers() {

  // ================= STATE =================

  const [users, setUsers] = useState([]);
  const [loading, setLoading] =
    useState(true);

  // EDIT
  const [editingUser, setEditingUser] =
    useState(null);

  const [editForm, setEditForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
    });

  // ADD
  const [showAddModal, setShowAddModal] =
    useState(false);

  const [addForm, setAddForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
    });

  // USER INFO
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  // ================= ADMIN CHECK =================

  const isAdmin =
    userInfo?.user?.role
      ?.toLowerCase()
      ?.trim() === "admin" ||
    userInfo?.role
      ?.toLowerCase()
      ?.trim() === "admin";

  // ================= FETCH USERS =================

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const token = userInfo?.token;

      const res = await API.get(
        "/auth/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "USERS:",
        res.data
      );

      const data = Array.isArray(
        res.data
      )
        ? res.data
        : res.data?.users ||
        res.data?.data ||
        [];

      // SORT ID tăng dần
      const sortedUsers = data.sort(
        (a, b) =>
          Number(a.id) - Number(b.id)
      );

      setUsers(sortedUsers);

    } catch (error) {

      console.log(error);
      setUsers([]);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }

  }, []);

  // ================= DELETE USER =================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Bạn có chắc muốn xóa user này?"
      );

    if (!confirmDelete) return;

    try {

      const token = userInfo?.token;

      await API.delete(
        `/auth/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prev) =>
        prev.filter(
          (u) =>
            Number(u.id) !== Number(id)
        )
      );

      alert("Xóa thành công");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Xóa thất bại"
      );
    }
  };

  // ================= OPEN EDIT =================

  const openEditModal = (user) => {

    setEditingUser(user);

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "user",
    });
  };

  // ================= UPDATE USER =================

  const handleUpdate = async () => {

    try {

      const token = userInfo?.token;

      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
      };

      // chỉ update password khi có nhập
      if (
        editForm.password.trim() !== ""
      ) {
        updateData.password =
          editForm.password;
      }

      await API.put(
        `/auth/users/${editingUser.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prev) =>
        prev.map((u) =>
          Number(u.id) ===
            Number(editingUser.id)
            ? {
              ...u,
              ...updateData,
            }
            : u
        )
      );

      alert("Cập nhật thành công");

      setEditingUser(null);

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Cập nhật thất bại"
      );
    }
  };

  // ================= ADD USER =================

  const handleAddUser = async () => {

    try {

      const token = userInfo?.token;

      await API.post(
        "/auth/register",
        addForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUsers();

      setAddForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
      });

      setShowAddModal(false);

      alert("Thêm user thành công");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Thêm user thất bại"
      );
    }
  };

  // ================= LOADING =================

  // ================= NO ACCESS =================

  if (!isAdmin) {
    return (
      <div className="no-access">
        <h1>403</h1>
        <h2>Không có quyền truy cập</h2>
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
            <li>
              <FaClipboardList />
              Đơn đặt
            </li>
          </Link>

          <Link to="/admin/AdminUsers">
            <li className="active">
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

          <h1>Quản lý người dùng</h1>

          <button
            className="add-btn"
            onClick={() =>
              setShowAddModal(true)
            }
          >
            <FaPlus />
            Thêm user
          </button>

        </div>

        {/* CARDS */}

        <div className="dashboard-cards">

          <div className="card">
            <h3>Tổng người dùng</h3>
            <p>{users.length}</p>
          </div>

          <div className="card">
            <h3>Admin</h3>

            <p>
              {
                users.filter(
                  (u) =>
                    u.role === "admin"
                ).length
              }
            </p>
          </div>

          <div className="card">
            <h3>User</h3>

            <p>
              {
                users.filter(
                  (u) =>
                    u.role === "user"
                ).length
              }
            </p>
          </div>

        </div>

        {/* TABLE */}

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Role</th>
                <th>Hành động</th>
              </tr>

            </thead>

            <tbody>

              {users.length > 0 ? (
                users.map((u) => (

                  <tr key={u.id}>

                    <td>{u.id}</td>

                    <td>
                      {u.name ||
                        "Không có"}
                    </td>

                    <td>{u.email}</td>

                    <td>
                      {u.phone ||
                        "Không có"}
                    </td>

                    <td>

                      <span
                        className={`role-badge ${u.role}`}
                      >
                        {u.role}
                      </span>

                    </td>

                    <td className="action-buttons">

                      <FaEdit
                        className="edit-btn"
                        onClick={() =>
                          openEditModal(u)
                        }
                      />

                      <FaTrash
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(u.id)
                        }
                      />

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    Không có người dùng
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* EDIT MODAL */}

      {editingUser && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>Sửa người dùng</h2>

              <FaTimes
                className="close-icon"
                onClick={() =>
                  setEditingUser(null)
                }
              />

            </div>

            <div className="modal-body">

              <input
                type="text"
                placeholder="Tên"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name:
                      e.target.value,
                  })
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    email:
                      e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Số điện thoại"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    phone:
                      e.target.value,
                  })
                }
              />

              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    password:
                      e.target.value,
                  })
                }
              />

              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    role:
                      e.target.value,
                  })
                }
              >
                <option value="user">
                  User
                </option>

                <option value="admin">
                  Admin
                </option>

              </select>

              <button
                className="save-btn"
                onClick={handleUpdate}
              >
                Lưu thay đổi
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ADD MODAL */}

      {showAddModal && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>Thêm người dùng</h2>

              <FaTimes
                className="close-icon"
                onClick={() =>
                  setShowAddModal(false)
                }
              />

            </div>

            <div className="modal-body">

              <input
                type="text"
                placeholder="Tên"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    name:
                      e.target.value,
                  })
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    email:
                      e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Số điện thoại"
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    phone:
                      e.target.value,
                  })
                }
              />

              <input
                type="password"
                placeholder="Mật khẩu"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    password:
                      e.target.value,
                  })
                }
              />

              <select
                value={addForm.role}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    role:
                      e.target.value,
                  })
                }
              >
                <option value="user">
                  User
                </option>

                <option value="admin">
                  Admin
                </option>

              </select>

              <button
                className="save-btn"
                onClick={handleAddUser}
              >
                Thêm người dùng
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminUsers;