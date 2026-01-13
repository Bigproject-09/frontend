import React from "react";
import { useNavigate } from "react-router-dom";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        paddingTop: "20px", // 헤더와 간격
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "4vw", // 화면 폭에 따라 자동 조정
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap", // 화면 좁으면 세로 정렬
            gap: "4vw",       // 좌우 영역 사이 간격
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* 왼쪽 영역 */}
          <div
            style={{
              flex: "1 1 40%",
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "1.5rem",
            }}
          >
            <div style={{ fontSize: "4vw", fontWeight: "bold", lineHeight: 1 }}>
              B&b
            </div>

            <button
              onClick={() => navigate("/login")}
              style={{
                background: "#e0e0e0",
                padding: "1vw 2vw",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              지금 시작하기 버튼
              <br />
              (누르면 로그인 창으로 감)
            </button>
          </div>

          {/* 오른쪽 영역 */}
          <div
            style={{
              flex: "1 1 55%",
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <h1 style={{ fontSize: "3vw", marginBottom: "1rem" }}>Biz & Busy</h1>

            <p style={{ fontSize: "1.2vw", lineHeight: 1.5 }}>
              시간은 금이다. B&B와 함께 금을 지켜보세요
              <br />
              혁신적인 제안서
              <br />
              와! 너무 감사하다!
            </p>

            <div
              style={{
                border: "1px solid #999",
                minHeight: "20vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#555",
                padding: "1vw",
                textAlign: "center",
                fontSize: "1vw",
              }}
            >
              대충 제일 소개할만한 그림
              <br />
              혹은 제안서 작성 페이지 보여줘도 될듯
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
