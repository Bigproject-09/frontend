import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import http from "../../api/http";

type NoticeItem = {
  id: number;
  title: string;
  dday: string;
  score: number;
  isRead: boolean;
  url?: string;

  org?: string;
  budget?: string;
  period?: string;
  summary?: string;
};

const ProcessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const noticeId = location.state?.noticeId as number | undefined;

  const [searchParams] = useSearchParams();
  // view가 없으면 기본값으로 "notice" 취급
  const view = (searchParams.get("view") ?? "notice") as "notice" | "service";

  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // 공고 상세 로드 (noticeId 있을 때만)
  // ============================================
  useEffect(() => {
    if (!noticeId) {
      // 서비스에서 들어오면 공고 상세를 보여줄 필요가 없어서 에러로 막지 않음
      // (버튼은 공고 선택으로 유도)
      setError(null);
      return;
    }

    const stripHtml = (html: string) => {
      if (!html) return "-";
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "-";
    };

    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await http.get(`/api/notices/${noticeId}`);
        if (!alive) return;

        setTitle(data.title || "-");
        setOrg(data.author || data.excInsttNm || "-");
        setPeriod(data.reqstDt || "-");
        setUrl(data.link || "-");
        setSummary(stripHtml(data.description));
        setBudget("-"); // 백엔드 예산 필드 생기면 매핑
      } catch (err) {
        console.error("공고 조회 오류:", err);
        if (!alive) return;
        setError("공고 정보를 불러오는데 실패했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [noticeId]);

  // ============================================
  // 이동 헬퍼
  // - noticeId 없으면 공고 선택 화면으로 유도
  // ============================================
  const goNeedNotice = () => {
    // 서비스에서 들어온 경우: 공고 선택/목록으로 보내는 의도
    // 기존 너 코드 흐름을 최대한 유지해서 view=service 붙여줌
    navigate("/notice?view=service");
  };

  const goAnalysis = () => {
    if (!noticeId) return goNeedNotice();
    navigate("/process/analysis", { state: { noticeId } });
  };

  const goRfp = () => {
    if (!noticeId) return goNeedNotice();
    navigate("/process/rfp", { state: { noticeId } });
  };

  const goAnnounce = () => {
    if (!noticeId) return goNeedNotice();
    navigate("/process/announce", { state: { noticeId } });
  };

  const goScript = () => {
    if (!noticeId) return goNeedNotice();
    navigate("/process/script", { state: { noticeId } });
  };

  // 로딩 UI (noticeId 있을 때만 로딩이 의미 있음)
  if (loading) {
    return (
      <Container>
        <Section>
          <div style={{ textAlign: "center", padding: "40px" }}>로딩 중...</div>
        </Section>
      </Container>
    );
  }

  // 에러 UI (noticeId 있는 상태에서만 의미 있음)
  if (error && noticeId) {
    return (
      <Container>
        <Section>
          <div style={{ color: "crimson" }}>{error}</div>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      {/* service 뷰에서는 상세 박스 숨김 유지 */}
      {view !== "service" && noticeId && (
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
      )}

      {/* noticeId가 없을 때 가이드(선택사항) */}
      {!noticeId && (
        <Section>
          <div style={{ fontSize: 14, color: "#374151" }}>
            공고를 선택하면 분석/추천 기능을 사용할 수 있습니다.
          </div>
        </Section>
      )}

      <ButtonGroup>
        <ProcessBtn type="button" onClick={goAnalysis}>
          <h3>공고문 분석</h3>
          <ul>
            <li>자격요건 체크리스트 제공</li>
            <li>사업 목적 요약</li>
            <li>평가항목 요약</li>
          </ul>
        </ProcessBtn>

        <ProcessBtn type="button" onClick={goRfp}>
          <h3>유관 RFP 검색</h3>
          <ul>
            <li>동일 주관 기관 내 유사 RFP 추천</li>
            <li>사내 유사 RFP 추천</li>
          </ul>
        </ProcessBtn>

        <ProcessBtn type="button" onClick={goAnnounce}>
          <h3>발표자료 제작</h3>
          <ul>
            <li>스토리라인 구성</li>
            <li>키워드 추출</li>
            <li>구조도/그림 생성</li>
          </ul>
        </ProcessBtn>

        <ProcessBtn type="button" onClick={goScript}>
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

// ===== styled-components (그대로) =====
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

  .label {
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

  /* 🔧 미세 조정 포인트 */
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
