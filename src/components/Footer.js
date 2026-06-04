import React from "react";
import "./Footer.css";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-col">
          <h2 className="footer-logo">⚽ SânBóngPro</h2>
          <p className="footer-desc">
            Hệ thống đặt sân bóng online nhanh chóng, tiện lợi và hiện đại hàng đầu Việt Nam.
          </p>

          <div className="footer-social">
            <a href="#facebook">Facebook</a>
<a href="#instagram">Instagram</a>
<a href="#tiktok">TikTok</a>
          </div>
        </div>

        {/* LINKS */}
        <div className="footer-col">
          <h3>Liên kết</h3>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/">Sân bóng</a></li>
            <li><a href="/">Đặt sân</a></li>
            <li><a href="/">Tin tức</a></li>
            <li><a href="/">Liên hệ</a></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div className="footer-col">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><a href="/">Chính sách bảo mật</a></li>
            <li><a href="/">Điều khoản dịch vụ</a></li>
            <li><a href="/">Hướng dẫn đặt sân</a></li>
            <li><a href="/">FAQ</a></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-col">
          <h3>Liên hệ</h3>

          <p><FaMapMarkerAlt /> Đà Nẵng, Việt Nam</p>
          <p><FaPhoneAlt /> 0123 456 789</p>
          <p><FaEnvelope /> sanbongpro@gmail.com</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 <span>SânBóngPro</span>. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;