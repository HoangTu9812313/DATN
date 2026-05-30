import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        background: "#1e293b",
        height: "100vh",
        padding: "20px",
      }}
    >
      <h2 style={{ color: "white" }}>ADMIN</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <Link to="/admin" style={linkStyle}>
          Dashboard
        </Link>

        <Link to="/admin/fields" style={linkStyle}>
          Quản lý sân
        </Link>

        <Link to="/admin/bookings" style={linkStyle}>
          Quản lý đặt sân
        </Link>

        <Link to="/admin/users" style={linkStyle}>
          Quản lý user
        </Link>
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
};

export default Sidebar;