  import React, { useEffect, useState } from "react";

  import "./Style/AdminFields.css";
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

  function AdminFields() {
    // ================= STATE =================
    const [fields, setFields] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [previewImages, setPreviewImages] = useState([]);
    const [mainFile, setMainFile] =
    useState(null);

  const [subFiles, setSubFiles] =
    useState([]);

    const [existingImages, setExistingImages] =
      useState([]);
    const [pricingList, setPricingList] = useState([]);

    const [pricingForm, setPricingForm] = useState({
      start_time: "",
      end_time: "",
      price_per_hour: "",
      label: "",
    });
    const [formData, setFormData] = useState({
      name: "",
      address: "",
      type: "Sân 5",
      description: "",
      price_per_hour: "",
      open_time: "05:00",
      close_time: "23:00",
      slot_duration: 30,

      image: "",
      images: [],
    });

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    // ================= FETCH FIELDS =================
    const fetchFields = async () => {
      try {
        const res = await API.get("/fields");

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.fields || [];

        setFields(data);
      } catch (err) {
        console.log(err);
        setFields([]);
      }
    };

    useEffect(() => {
      fetchFields();
    }, []);


    // ================= CHANGE PRICING =================
    const handlePricingChange = (e) => {
      setPricingForm({
        ...pricingForm,
        [e.target.name]: e.target.value,
      });
    };

    // ================= ADD PRICING =================
    const handleAddPricing = async () => {
      if (!editingField) {
        alert("Vui lòng lưu sân trước");
        return;
      }

      try {
        const token = userInfo?.token;

        await API.post(
          "/field-pricing",
          {
            fieldId: editingField.id,
            start_time: pricingForm.start_time,
            end_time: pricingForm.end_time,
            price_per_hour: Number(pricingForm.price_per_hour),
            label: pricingForm.label,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedFields = await API.get("/fields");

        const updatedField = (
          Array.isArray(updatedFields.data)
            ? updatedFields.data
            : updatedFields.data.fields
        ).find(
          (f) => f.id === editingField.id
        );

        setPricingList(
          updatedField?.pricingRules || []
        );

        setPricingForm({
          start_time: "",
          end_time: "",
          price_per_hour: "",
          label: "",
        });

        alert("Thêm khung giá thành công");
      } catch (err) {
        console.log(err);
        alert("Thêm khung giá thất bại");
      }
    };
    // ================= INPUT =================
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    // ================= IMAGE UPLOAD =================
    const handleImageUpload = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setMainFile(file);

    setPreviewImage(
      URL.createObjectURL(file)
    );
  };
    const handleMultipleImages = (
    e
  ) => {
    const files =
      Array.from(
        e.target.files
      );

    setSubFiles(files);

    setPreviewImages(
      files.map((file) =>
        URL.createObjectURL(file)
      )
    );
  };
    // ================= IMAGE URL =================
    const handleImageUrl = (e) => {
      const value = e.target.value;

      setPreviewImage(value);

      setFormData((prev) => ({
        ...prev,
        image: value,
      }));
    };

    // ================= OPEN ADD =================
    const openAddModal = () => {
      setEditingField(null);
      setPreviewImage("");
      setPreviewImages([]);
      setExistingImages([]);
      setPreviewImage("");
  setPreviewImages([]);
  setExistingImages([]);

  setMainFile(null);
  setSubFiles([]);
      setFormData({
        name: "",
        address: "",
        type: "Sân 5",
        description: "",
        price_per_hour: "",
        open_time: "05:00",
        close_time: "23:00",
        slot_duration: 30,
        image: "",
        images: [],
      });

      setPricingList([]);

      setShowModal(true);
    };

    // ================= OPEN EDIT =================
    const openEditModal = async (field) => {
      setEditingField(field);

      setPreviewImage(field.image || "");

      setExistingImages(
        field.images || []
      );

      setPreviewImages([]);
      setMainFile(null);
  setSubFiles([]);
      setFormData({
        name: field.name || "",
        address: field.address || "",
        type: field.type || "Sân 5",
        description: field.description || "",
        price_per_hour: field.price_per_hour || "",
        open_time: field.open_time || "05:00",
        close_time: field.close_time || "23:00",
        slot_duration: field.slot_duration || 30,

        image: field.image || "",

        images: field.images || [],
      });

      setPricingList(field.pricingRules || []);

      setShowModal(true);
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const token = userInfo?.token;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const form =
    new FormData();

  form.append(
    "name",
    formData.name
  );

  form.append(
    "address",
    formData.address
  );

  form.append(
    "description",
    formData.description
  );

  form.append(
    "type",
    formData.type
  );

  form.append(
    "open_time",
    formData.open_time
  );

  form.append(
    "close_time",
    formData.close_time
  );

  form.append(
    "slot_duration",
    formData.slot_duration
  );

  form.append(
    "price_per_hour",
    formData.price_per_hour
  );

  form.append(
    "existingImages",
    JSON.stringify(
      existingImages
    )
  );

  form.append(
    "pricingRules",
    JSON.stringify(
      pricingList
    )
  );

  if (mainFile) {
    form.append(
      "image",
      mainFile
    );
  }

  subFiles.forEach((file) => {
    form.append(
      "images",
      file
    );
  });
        if (editingField) {
          await API.put(
    `/fields/${editingField.id}`,
    form,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

          alert("Cập nhật thành công");
        } else {
          await API.post(
    "/fields",
    form,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

          alert("Thêm sân thành công");
        }
        setPricingList([]);

        setShowModal(false);
        fetchFields();
      } catch (err) {
        console.log(err.response?.data);
        alert("Lỗi server");
      }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
      const confirm = window.confirm("Xóa sân này?");
      if (!confirm) return;

      try {
        const token = userInfo?.token;

        await API.delete(`/fields/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFields((prev) => prev.filter((f) => f.id !== id));
      } catch (err) {
        console.log(err);
        alert("Xóa thất bại");
      }
    };

    // ================= UI =================
    return (
      <div className="admin-layout">

        {/* SIDEBAR */}
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

            {/* DASHBOARD */}
            <Link to="/admin">
              <li>
                <FaChartBar />
                Dashboard
              </li>
            </Link>

            {/* FIELDS */}
            <Link to="/admin/AdminFields">
              <li className="active">
                <FaFutbol />
                Quản lý sân bóng
              </li>
            </Link>

            {/* BOOKINGS */}
            <Link to="/admin/AdminBookings">
              <li>
                <FaClipboardList />
                Đơn đặt
              </li>
            </Link>

            {/* USERS */}
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

            <h1>Quản lý sân bóng</h1>

            <button className="add-btn" onClick={openAddModal}>
              + Thêm sân bóng
            </button>

          </div>



          {/* TABLE */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tên sân</th>
                  <th>Địa chỉ</th>
                  <th>Loại</th>
                  <th>Giá cơ bản</th>
                  <th>Giờ hoạt động</th>
                  <th>Slot</th>
                  <th>Ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {fields.map((field) => (
                  <tr key={field.id}>
                    <td>{field.name}</td>

                    <td>{field.address}</td>

                    <td>{field.type}</td>

                    <td>
                      {Number(field.price_per_hour).toLocaleString()}đ
                    </td>

                    <td>
                      {field.open_time} - {field.close_time}
                    </td>

                    <td>
                      {field.slot_duration} phút
                    </td>

                    <td>
                      <img
                        src={field.image}
                        alt={field.name}
                        width="80"
                        height="60"
                        style={{
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </td>

                    <td>
                      <FaEdit
                        style={{ cursor: "pointer", marginRight: 10 }}
                        onClick={() => openEditModal(field)}
                      />

                      <FaTrash
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(field.id)}
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
                  <h2>{editingField ? "Sửa sân" : "Thêm sân"}</h2>

                  <FaTimes onClick={() => setShowModal(false)} />
                </div>

                <form onSubmit={handleSubmit}>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tên sân"
                  />

                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ"
                  />

                  {/* ✅ FIX: THÊM LOẠI SÂN */}
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="Sân 5">Sân 5</option>
                    <option value="Sân 7">Sân 7</option>
                    <option value="Sân 11">Sân 11</option>
                  </select>

                  <input
                    name="price_per_hour"
                    value={formData.price_per_hour}
                    onChange={handleChange}
                    placeholder="Giá"
                    type="number"
                  />
                  <input
                    type="time"
                    name="open_time"
                    value={formData.open_time}
                    onChange={handleChange}
                  />

                  <input
                    type="time"
                    name="close_time"
                    value={formData.close_time}
                    onChange={handleChange}
                  />

                  <input
                    type="number"
                    name="slot_duration"
                    value={formData.slot_duration}
                    onChange={handleChange}
                    placeholder="Thời lượng slot (phút)"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả"
                  />
                  <hr />

                  <div className="pricing-section">

                    <input
                      type="time"
                      name="start_time"
                      value={pricingForm.start_time}
                      onChange={handlePricingChange}
                    />

                    <input
                      type="time"
                      name="end_time"
                      value={pricingForm.end_time}
                      onChange={handlePricingChange}
                    />

                    <input
                      type="number"
                      name="price_per_hour"
                      placeholder="Giá theo giờ"
                      value={pricingForm.price_per_hour}
                      onChange={handlePricingChange}
                    />
                    <input
                      type="text"
                      name="label"
                      placeholder="normal / peak / night"
                      value={pricingForm.label}
                      onChange={handlePricingChange}
                    />
                    <button
                      type="button"
                      onClick={handleAddPricing}
                    >
                      + Thêm khung giá
                    </button>

                  </div>

                  <div className="pricing-list">
                    {pricingList?.map((item) => (
                      <div
                        key={item.id}
                        className="pricing-item"
                      >
                        <strong>
                          {item.start_time} - {item.end_time}
                        </strong>

                        <div>
                          {Number(item.price_per_hour).toLocaleString()}đ / giờ
                        </div>

                        <small>{item.label}</small>
                      </div>
                    ))}
                  </div>
                  <h3>Ảnh đại diện sân</h3>

                  <input
                    type="text"
                    value={formData.image || ""}
                    onChange={handleImageUrl}
                    placeholder="https://..."
                  />

                  <input
                    type="file"
                    onChange={handleImageUpload}
                  />

                  {previewImage && (
                    <div className="main-image-preview">
                      <img
                        src={previewImage}
                        alt="Ảnh chính"
                        width="200"
                      />

                      <span className="main-badge">
                        Ảnh chính
                      </span>
                    </div>
                  )}

                  <hr />

                  <h3>Ảnh phụ (Album sân)</h3>

                  <input
                    type="file"
                    multiple
                    onChange={handleMultipleImages}
                  />
                  <div className="images-grid">
                    {existingImages.map((img, index) => (
                      <div
                        key={index}
                        className="image-item"
                      >
                        <img
                          src={img}
                          alt=""
                          width="90"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setExistingImages(
                              existingImages.filter(
                                (_, i) => i !== index
                              )
                            )
                          }
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="images-grid">
                    {previewImages.map((img, index) => (
                      <div
                        key={index}
                        className="image-item"
                      >
                        <img
                          src={img}
                          alt=""
                          width="90"
                        />

                        <button
                          type="button"
                          onClick={() => {

                            setPreviewImages(
                              previewImages.filter(
                                (_, i) => i !== index
                              )
                            );

                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>

                  <button type="submit">
                    {editingField ? "Cập nhật" : "Thêm"}
                  </button>

                </form>

              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  export default AdminFields;