import React, {
  useEffect,
  useState,
} from "react";

import "./style/Home.css";

import { Link } from "react-router-dom";

import API from "../services/api";

import {
  FaMapMarkerAlt,
  FaHeart,
} from "react-icons/fa";

function Home() {
  // =========================
  // STATE
  // =========================

  const [fields, setFields] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // FETCH API
  // =========================

  useEffect(() => {
    fetchFields();
    fetchReviews();
  }, []);

  // =========================
  // FETCH FIELDS
  // =========================

  const fetchFields =
    async () => {
      try {
        const res =
          await API.get(
            "/fields"
          );

        console.log(
          "Danh sách sân:",
          res.data
        );

        setFields(
          res.data
        );
      } catch (error) {
        console.log(
          "Lỗi lấy sân:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // FETCH REVIEWS
  // =========================

  const fetchReviews =
    async () => {
      try {
        const fieldRes =
          await API.get(
            "/fields"
          );

        const fieldsData =
          fieldRes.data || [];

        let allReviews =
          [];

        for (const field of fieldsData) {
          try {
            const res =
              await API.get(`/reviews/field/${field.id}`);

            const fieldReviews =
              (
                res.data || []
              ).map(
                (r) => ({
                  ...r,

                  fieldName:
                    field.name,
                })
              );

            allReviews = [
              ...allReviews,
              ...fieldReviews,
            ];
          } catch (err) {
            console.log(
              "Lỗi review:",
              err
            );
          }
        }

        // SORT MỚI NHẤT

        // Ưu tiên rating cao nhất
        // nếu bằng sao thì lấy mới nhất

        allReviews.sort(
          (a, b) => {

            // SORT STAR DESC
            if (
              b.rating !==
              a.rating
            ) {
              return (
                b.rating -
                a.rating
              );
            }

            // SORT NEWEST
            return (
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
            );
          }
        );

        // CHỈ LẤY 3 REVIEW TỐT NHẤT

        setReviews(
          allReviews.slice(
            0,
            3
          )
        );
      } catch (err) {
        console.log(err);
      }
    };

  return (
    <div className="home">
      {/* HERO */}

      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>
              Đặt sân bóng <br />

              <span>
                nhanh chóng
              </span>{" "}
              & dễ dàng
            </h1>

            <p>
              Tìm sân,
              chọn giờ và
              thanh toán chỉ
              trong vài phút.
            </p>

            {/* STATS */}

            <div className="stats">
              <div>
                <h2>
                  500+
                </h2>

                <p>
                  Sân bóng
                </p>
              </div>

              <div>
                <h2>
                  10K+
                </h2>

                <p>
                  Lượt đặt
                </p>
              </div>

              <div>
                <h2>
                  63
                </h2>

                <p>
                  Tỉnh thành
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}

      <section className="featured">
        <div className="section-header">
          <div>
            <h2>
              Sân nổi bật
            </h2>

            <p>
              Những sân được
              đặt nhiều nhất
              tuần này
            </p>
          </div>

          <Link
            to="/fields"
            className="view-all-btn"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="field-list">
          {loading ? (
            <h3>
              Đang tải dữ
              liệu...
            </h3>
          ) : fields.length >
            0 ? (
            fields
              .slice(0, 6)
              .map(
                (
                  field
                ) => (
                  <div
                    className="field-card"
                    key={
                      field.id
                    }
                  >
                    {/* IMAGE */}

                    <div className="field-image">
                      <img
                        src={
                          field
                            .images?.[0] ||
                          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"
                        }
                        alt={
                          field.name
                        }
                      />

                      <div className="heart">
                        <FaHeart />
                      </div>
                    </div>

                    {/* INFO */}

                    <div className="field-info">
                      <h3>
                        {
                          field.name
                        }
                      </h3>

                      <div className="field-location">
                        <FaMapMarkerAlt />

                        <span>
                          {
                            field.address
                          }
                        </span>
                      </div>

                      <h4 className="price">
                        {Number(
                          field.price_per_hour
                        ).toLocaleString()}
                        đ / giờ
                      </h4>

                      <span className="field-type">
                        {
                          field.type
                        }
                      </span>

                      <Link
                        to={`/fields/${field.id}`}
                      >
                        <button>
                          Đặt
                          sân
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              )
          ) : (
            <h3>
              Không có dữ
              liệu sân bóng
            </h3>
          )}
        </div>
      </section>

      {/* REVIEWS */}

      <section className="reviews">
        <div className="section-header">
          <div>
            <h2>
              Khách hàng
              đánh giá
            </h2>

            <p>
              Những phản hồi
              từ người dùng
            </p>
          </div>
        </div>

        <div className="review-grid">
          {reviews.length >
            0 ? (
            reviews.map(
              (
                review
              ) => (
                <div
                  className="review-card"
                  key={
                    review.id
                  }
                >
                  {/* USER */}

                  <div className="review-user">
                    <img
                      src={
                        review
                          .user
                          ?.avatar ||
                        "https://i.pravatar.cc/100"
                      }
                      alt=""
                    />

                    <div>
                      <h4>
                        {review
                          .user
                          ?.name ||
                          "User"}
                      </h4>

                      <small>
                        {
                          review.fieldName
                        }
                      </small>
                    </div>
                  </div>

                  {/* COMMENT */}

                  <p className="review-comment">
                    “
                    {
                      review.comment
                    }
                    ”
                  </p>

                  {/* RATING */}

                  <span className="review-rating">
                    {"⭐".repeat(
                      review.rating ||
                      5
                    )}
                  </span>
                </div>
              )
            )
          ) : (
            <h3>
              Chưa có đánh
              giá nào
            </h3>
          )}
        </div>
      </section>

      {/* NEWS */}

      <section className="news">
        <div className="section-header">
          <div>
            <h2>
              Tin tức nổi
              bật
            </h2>

            <p>
              Cập nhật mới
              nhất về bóng đá
              & sân bãi
            </p>
          </div>
        </div>

        <div className="news-grid">
          <div className="news-card">
            <img
              src="https://images.unsplash.com/photo-1508098682722-e99c643e7485"
              alt=""
            />

            <h3>
              Giải bóng đá
              sinh viên 2026
            </h3>

            <p>
              Cập nhật lịch
              thi đấu và đội
              tham gia...
            </p>
          </div>

          <div className="news-card">
            <img
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20"
              alt=""
            />

            <h3>
              Mẹo chọn sân
              bóng tốt
            </h3>

            <p>
              Cách chọn sân
              phù hợp với đội
              của bạn...
            </p>
          </div>

          <div className="news-card">
            <img
              src="https://images.unsplash.com/photo-1518604666860-9ed391f76460"
              alt=""
            />

            <h3>
              Bí quyết chơi
              bóng hiệu quả
            </h3>

            <p>
              Cải thiện kỹ
              năng bóng đá
              nhanh chóng...
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;