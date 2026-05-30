import React from "react";

function FieldCard({ field }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        overflow: "hidden",
        width: "300px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={field.image}
        alt={field.name}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
        }}
      />

      <div style={{ padding: "15px" }}>
        <h3>{field.name}</h3>

        <p>Loại sân: {field.type}</p>

        <p>Giá: {field.price} VNĐ</p>

        <button
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "10px",
            width: "100%",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Đặt sân
        </button>
      </div>
    </div>
  );
}

export default FieldCard;