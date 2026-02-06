import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

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
          padding: "4vw",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "3rem",
        }}
      >
        {/* Title & Button Section */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "5rem" }}>
          <div style={{ fontSize: "4vw", fontWeight: "bold", lineHeight: 1 }}>
            RanDi
          </div>
          <button
            className="button"
            onClick={() => navigate("/login")}
            style={{
              background: "#e0e0e0",
              padding: "1rem 2rem",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              borderRadius: "0.5rem",
              fontWeight: "600",
            }}
          >
            지금 시작하기
          </button>
        </div>

        {/* Description Section */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.5rem", lineHeight: 1.6, color: "#374151" }}>
            R&D 공고 분석부터 발표자료 제작, 대본 작성까지!
            <br />
            RanDi가 성공적인 과제 수주를 위한
            <br />
            가장 확실한 솔루션을 제공합니다.
          </p>
        </div>

        {/* Feature Cards Section */}
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          <CardGrid>
            <FeatureCard>
              {/* <div className="step">STEP 1</div> */}
              <h3>공고문 분석</h3>
              <ul>
                <li>자격요건 체크리스트 제공</li>
                <li>사업 목적 요약</li>
                <li>평가항목 요약</li>
              </ul>
            </FeatureCard>
            <FeatureCard>
              {/* <div className="step">STEP 2</div> */}
              <h3>유관 RFP 검색</h3>
              <ul>
                <li>동일 주관 기관 내 유사 RFP 추천</li>
                <li>사내 유사 RFP 추천</li>
              </ul>
            </FeatureCard>
            <FeatureCard>
              {/* <div className="step">STEP 3</div> */}
              <h3>발표자료 제작</h3>
              <ul>
                <li>스토리라인 구성</li>
                <li>키워드 추출</li>
                <li>구조도/그림 생성</li>
              </ul>
            </FeatureCard>
            <FeatureCard>
              {/* <div className="step">STEP 4</div> */}
              <h3>스크립트 생성</h3>
              <ul>
                <li>스크립트 생성</li>
                <li>예상질문 생성</li>
              </ul>
            </FeatureCard>
          </CardGrid>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
  
  @media (max-width: 1024px) {
     grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
     grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 180px;
  position: relative; // For absolute positioning if needed, or just normal flow
  
  .step {
    display: inline-block;
    background: #e0e7ff;
    color: #4338ca;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    width: fit-content;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #111827;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 0.9rem;
    color: #4b5563;
    
    li {
      margin-bottom: 4px;
    }
  }
`;
