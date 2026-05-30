// src/pages/FieldList.js

import React, { useEffect, useState } from "react";
import "./FieldList.css";

import { Link } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaSearch,
} from "react-icons/fa";

import API from "../services/api";

function FieldList() {
  const [search, setSearch] = useState("");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= GET API =================

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await API.get("/fields");

      console.log(res.data);

      setFields(res.data);
    } catch (err) {
      console.log("Lỗi lấy sân bóng:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH =================

  const normalizeText = (text) =>
  text
    ?.toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // bỏ dấu tiếng Việt

const filtered = fields.filter((f) => {
  const keyword = normalizeText(search);

  const name = normalizeText(f.name);
  const address = normalizeText(f.address);
  const type = normalizeText(f.type);

  return (
    name?.includes(keyword) ||
    address?.includes(keyword) ||
    type?.includes(keyword)
  );
});

  return (
    <div className="all-fields">
      {/* ================= HERO ================= */}

      <div className="hero-header">
        <h1>Danh Sách Sân Bóng</h1>

        <p>
          Khám phá hàng trăm sân bóng chất lượng cao
        </p>

        <div className="search-box">
          <FaSearch />

          <input
            type="text"
            placeholder="Tìm kiếm theo tên sân..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button>Tìm kiếm</button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="content-container">
        
        {/* ================= LOADING ================= */}

        {loading ? (
          <h2 className="loading">
            Đang tải dữ liệu...
          </h2>
        ) : (
          <div className="field-list">
            {filtered.map((f) => (
              <div
                className="field-card"
                key={f.id}
              >
                {/* ================= IMAGE ================= */}

                <div className="field-image">
                  <img
                    src={
                      f.images?.[0] ||
                      "https://images.unsplash.com/photo-1522778119026-d647f0596c20"
                    }
                    alt={f.name}
                  />

                  {/* TYPE */}

                  <span className="field-type">
                    {f.type}
                  </span>

                  {/* RATING */}

                  {f.rating && (
                    <span className="rating">
                      <FaStar /> {f.rating}
                    </span>
                  )}
                </div>

                {/* ================= INFO ================= */}

                <div className="field-info">
                  <h3>{f.name}</h3>

                  {/* LOCATION */}

                  <div className="field-location">
                    <FaMapMarkerAlt />

                    <span>{f.address}</span>
                  </div>

                  {/* DESCRIPTION */}

                  <p className="desc">
                    {f.description}
                  </p>

                  {/* PRICE */}

                  <div className="price">
                    {Number(
                      f.price_per_hour
                    ).toLocaleString()}
                    đ / giờ
                  </div>

                  {/* FOOTER */}

                  <div className="footer">
                    <span>
                      <FaUsers /> {f.type}
                    </span>
                  </div>

                  {/* BUTTON */}

                  <Link to={`/fields/${f.id}`}>
                    <button>
                      Đặt sân ngay
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FieldList;