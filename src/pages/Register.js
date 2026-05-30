// src/pages/Register.js

import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaPhone,
} from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  // STATES

  const [showPassword, setShowPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // REGISTER

  const handleRegister = async (e) => {
    e.preventDefault();

    // VALIDATE

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // VALID EMAIL

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Email không hợp lệ");
      return;
    }

    // VALID PHONE

    if (phone.length < 9) {
      alert(
        "Số điện thoại không hợp lệ"
      );
      return;
    }

    // VALID PASSWORD

    if (password.length < 6) {
      alert(
        "Mật khẩu phải từ 6 ký tự"
      );
      return;
    }

    try {
      setLoading(true);

      // CALL API

      const res = await API.post(
        "/auth/register",
        {
          name,
          phone,
          email,
          password,
        }
      );

      console.log(
        "REGISTER SUCCESS:",
        res.data
      );

      alert("Đăng ký thành công");

      // RESET FORM

      setName("");
      setPhone("");
      setEmail("");
      setPassword("");

      // REDIRECT

      navigate("/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err);

      console.log(
        "ERROR RESPONSE:",
        err.response
      );

      // SHOW ERROR

      if (err.response) {
        alert(
          err.response.data?.message ||
            "Lỗi server"
        );
      } else if (err.request) {
        alert(
          "Không thể kết nối server"
        );
      } else {
        alert("Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT */}

      <div className="auth-left">
        <div className="overlay">
          <h2>⚽ SanBongPro</h2>

          <h1>
            Tham gia
            <br />
            cộng đồng
            <br />
            bóng đá ngay
          </h1>

          <p>
            Kết nối hàng ngàn người
            yêu bóng đá trên toàn quốc.
          </p>
        </div>
      </div>

      {/* RIGHT */}

      <div className="auth-right">
        <div className="auth-box">
          <h1>Đăng ký</h1>

          <form onSubmit={handleRegister}>
            {/* NAME */}

            <div className="input-group">
              <label>Họ và tên</label>

              <div className="input-box">
                <FaUser className="icon" />

                <input
                  type="text"
                  placeholder="Nhập họ tên"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>
            </div>

            {/* PHONE */}

            <div className="input-group">
              <label>
                Số điện thoại
              </label>

              <div className="input-box">
                <FaPhone className="icon" />

                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="input-group">
              <label>Email</label>

              <div className="input-box">
                <FaEnvelope className="icon" />

                <input
                  type="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="input-group">
              <label>Mật khẩu</label>

              <div className="input-box">
                <FaLock className="icon" />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                />

                {showPassword ? (
                  <FaEyeSlash
                    className="eye"
                    onClick={() =>
                      setShowPassword(
                        false
                      )
                    }
                  />
                ) : (
                  <FaEye
                    className="eye"
                    onClick={() =>
                      setShowPassword(
                        true
                      )
                    }
                  />
                )}
              </div>
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Đang đăng ký..."
                : "Đăng ký →"}
            </button>
          </form>

          {/* OR */}

          <div className="or">
            <span>Hoặc</span>
          </div>

          {/* GOOGLE */}

          <button className="google-btn">
            <FaGoogle />
            Đăng ký bằng Google
          </button>

          {/* LOGIN */}

          <p className="register-text">
            Đã có tài khoản?

            <Link
              to="/login"
              className="register-link"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;