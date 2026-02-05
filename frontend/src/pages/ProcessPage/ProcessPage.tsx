import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import http from "../../api/http";

const ProcessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const noticeId = location.state?.noticeId as number | undefined;

  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 공고 상세 조회 (UI는 예전 그대로)
  useEffect(() => {
    if (!noticeId) {
      setError("공고 ID가 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 기존: fetch(`/api/notices/${noticeId}`)
        const { data } = await http.get(`/api/notices/${noticeId}`);

        const stripHtml = (html: string) => {
          if (!html) return "-";
          const tmp = document.createElement("DIV");
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || "-";
        };

        setTitle(data.title || "-");
        setOrg(data.author || data.excInsttNm || "-");
        setPeriod(data.reqstDt || "-");
        setUrl(data.link || "-");
        setSummary(stripHtml(data.description));
        setBudget("-"); // 백엔드 예산 필드 생기면 매핑
      } catch (err) {
        console.error("공고 조회 오류:", err);
        setError("공고 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [noticeId]);

  // ============================================
  // 버튼 동작: (선택 1) 예전처럼 페이지 이동만 유지
  // ============================================
  const handleAnalysis = (id: number) => {
    navigate("/process/analysis", { state: { noticeId: id } });
  };

  const handleRFPSearch = (id: number) => {
    navigate("/process/rfp", { state: { noticeId: id } });
  };

  const handleAnnounce = (id: number) => {
    navigate("/process/announce", { state: { noticeId: id } });
  };

  const handleScript = (id: number) => {
    navigate("/process/script", { state: { noticeId: id } });
  };

  // ✅ 로딩 중 표시 (예전 UI 그대로)
  if (loading) {
    return (
      <Container>
        <Section>
          <div style={{ textAlign: "center", padding: "40px" }}>로딩 중...</div>
        </Section>
      </Container>
    );
  }

  // ✅ 에러 표시 (예전 UI 그대로)
  if (error) {
    return (
      <Container>
        <Section>
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            {error}
          </div>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <ModalGrid>
          <label>제목</label>
          <div className="text">{title}</div>
          <label>기관</label>
          <div className="text">{org}</div>
          <label>기간</label>
          <div className="text">{period}</div>
          <label>URL</label>
          <div className="text">
            {url !== "-" ? (
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            ) : (
              url
            )}
          </div>
          <label>요약</label>
          <div className="text">{summary}</div>
        </ModalGrid>
      </Section>

      <ButtonGroup>
        <ProcessBtn
          type="button"
          onClick={() => noticeId && handleAnalysis(noticeId)}
        >
          <h3>공고문 분석</h3>
          <ul>
            <li>자격요건 체크리스트 제공</li>
            <li>사업 목적 요약</li>
            <li>평가항목 요약</li>
          </ul>
        </ProcessBtn>

        <ProcessBtn
          type="button"
          onClick={() => noticeId && handleRFPSearch(noticeId)}
        >
          <h3>유관 RFP 검색</h3>
          <ul>
            <li>동일 주관 기관 내 유사 RFP 추천</li>
            <li>사내 유사 RFP 추천</li>
          </ul>
        </ProcessBtn>

        <ProcessBtn
          type="button"
          onClick={() => noticeId && handleAnnounce(noticeId)}
        >
          <h3>발표자료 제작</h3>
          <ul>
            <li>스토리라인 구성</li>
            <li>키워드 추출</li>
            <li>구조도/그림 생성</li>
          </ul>
        </ProcessBtn>

        <ProcessBtn
          type="button"
          onClick={() => noticeId && handleScript(noticeId)}
        >
          <h3>스크립트 생성</h3>
          <ul>
            <li>스크립트 생성</li>
            <li>예상질문 생성</li>
          </ul>
        </ProcessBtn>
      </ButtonGroup>
    </Container>
  );
};

export default ProcessPage;

// ===== styled-components (예전 그대로) =====
const Container = styled.div`
  padding: 60px;
`;

const Section = styled.div`
  background: #f9fafb;
  border-radius: 10px;
  padding: 18px 20px;
  box-sizing: border-box;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  row-gap: 12px;
  column-gap: 16px;
  align-items: center;

  label {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
  }

  .text {
    font-size: 14px;
    color: #1f2937;
  }

  a {
    color: #2563eb;
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin: 32px 0;
`;

const ProcessBtn = styled.button`
  padding: 24px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  text-align: left;
  cursor: pointer;
  height: 350px;
  display: flex;
  flex-direction: column;

  --title-offset: 4px;
  --list-offset: 170px;

  h3 {
    margin: 0;
    margin-top: var(--title-offset);
    font-size: 25px;
    font-weight: 600;
  }

  ul {
    margin-top: var(--list-offset);
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 18px;
  }

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
`;
