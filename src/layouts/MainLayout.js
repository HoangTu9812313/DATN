import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <div style={{ minHeight: "80vh" }}>
        {children}
      </div>

      <Footer />
    </>
  );
}

export default MainLayout;