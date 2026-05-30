// src/pages/Login.js

import React, {
  useState,
} from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  useGoogleLogin,
} from "@react-oauth/google";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  // =========================
// GOOGLE LOGIN
// =========================

const googleLogin =
  useGoogleLogin({

    onSuccess: async (
      tokenResponse
    ) => {

      try {

        const res =
          await API.post(
            "/auth/google",
            {
              access_token:
                tokenResponse.access_token,
            }
          );

        localStorage.setItem(
          "token",
          res.data.token
        );

        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id:
              res.data.user.id,

            token:
              res.data.token,

            name:
              res.data.user.name,

            email:
              res.data.user.email,

            role:
              res.data.user.role,
          })
        );

        alert(
          "Đăng nhập Google thành công"
        );

        navigate("/");

      } catch (err) {

        console.log(
          "GOOGLE LOGIN ERROR:",
          err.response?.data || err
        );

        alert(
          err.response?.data?.message ||
          "Google Login thất bại"
        );
      }
    },

    onError: () => {

      alert(
        "Google Login thất bại"
      );
    },
  });
  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    // VALIDATE

    if (!email.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      // API LOGIN

      const res = await API.post(
        "/auth/login",
        {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      console.log(
        "LOGIN SUCCESS:",
        res.data
      );

      // =========================
      // SAVE USER
      // =========================

      localStorage.setItem(
  "userInfo",
  JSON.stringify({
    id: res.data.user.id,

    token: res.data.token,

    name: res.data.user.name,

    email: res.data.user.email,

    role: res.data.user.role,
  })
);
      // SAVE TOKEN

      localStorage.setItem(
        "token",
        res.data.token
      );

      // SUCCESS

      alert(
        res.data.message ||
          "Đăng nhập thành công"
      );

      navigate("/");
    } catch (err) {
      console.log(
        "LOGIN ERROR:",
        err.response?.data || err
      );

      // =========================
      // ERROR HANDLE
      // =========================

      if (
        err.response?.data?.message
      ) {
        alert(
          err.response.data.message
        );
      } else {
        alert(
          "Server lỗi, vui lòng thử lại"
        );
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
            Đặt sân bóng
            <br />
            nhanh chóng
            <br />& tiện lợi
          </h1>

          <p>
            Tham gia cùng hàng ngàn
            người chơi bóng đá.
          </p>
        </div>
      </div>

      {/* RIGHT */}

      <div className="auth-right">
        <div className="auth-box">
          <h1>Đăng nhập</h1>

          {/* FORM */}

          <form onSubmit={handleLogin}>
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
                    setEmail(
                      e.target.value
                    )
                  }
                  required
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
                  required
                />

                {showPassword ? (
                  <FaEyeSlash
                    className="eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  />
                ) : (
                  <FaEye
                    className="eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
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
                ? "Đang đăng nhập..."
                : "Đăng nhập"}
            </button>
          </form>

          {/* OR */}

          <div className="or">
            <span>Hoặc</span>
          </div>

          {/* GOOGLE */}

          <button
  type="button"
  className="google-btn"
  onClick={() =>
    googleLogin()
  }
>
  <FaGoogle />
  Đăng nhập bằng Google
</button>

          {/* REGISTER */}

          <p className="register-text">
            Chưa có tài khoản?

            <Link
              to="/register"
              className="register-link"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;