import React, {useState, useEffect} from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { STORAGE_KEY } from "../../common/constants";

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

    const view = searchParams.get("view");

    const storage_key = localStorage.getItem(STORAGE_KEY);

    const [title, setTitle] = useState("");
    const [org, setOrg] = useState("");
    const [budget, setBudget] = useState("");
    const [period, setPeriod] = useState("");
    const [url, setUrl] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 공고문 분석 버튼
    const handleAnalysis = (id:number) => {
        navigate("/process/analysis", {
            state: {noticeId: id},
        });
    };
    const handleAnalysis_Service = (id:number) => {
        navigate("/process/analysis", {
            state: {noticeId: id},
        });
    };


    // 유관 RFP 검색 버튼
    const handleRFPSearch = (id:number) => {
        navigate("/process/rfp", {
            state: {noticeId: id},
        });
    };

    // 발표 자료 제작 버튼
    const handleAnnounce = (id:number) => {
        navigate("/process/announce", {
            state: {noticeId: id},
        });
    };

    // 스크립트 및 예상질문 생성
    const handleScript = (id:number) => {
        navigate("/process/script", {
            state: {noticeId: id},
        });
    };

    // ✅ 백엔드 API에서 데이터 가져오기
    useEffect(() => {
        if (!noticeId) {
            setError("공고 ID가 없습니다.");
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`/api/notices/${noticeId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`API 오류: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                // HTML 태그 제거 함수
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
                setBudget("-"); // ✅ 백엔드에 예산 필드 추가 필요 시 수정
                setLoading(false);
            })
            .catch((err) => {
                console.error("공고 조회 오류:", err);
                setError("공고 정보를 불러오는데 실패했습니다.");
                setLoading(false);
            });
    }, [noticeId]);

    // ✅ 로딩 중 표시
    if (loading) {
        return (
            <Container>
                <Section>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        로딩 중...
                    </div>
                </Section>
            </Container>
        );
    }

    // ✅ 에러 표시
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
            {view !== "service" && (
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

            <ButtonGroup>
                {/* 공고 버튼을 통해 들어왔을 때 */}
                {view === "notice" && (
                <ProcessBtn
                    type="button"
                    onClick={() => {
                        if(!noticeId)
                            return;
                        handleAnalysis(noticeId);
                        }}>
                    <h3>공고문 분석</h3>
                    <ul>
                        <li>자격요건 체크리스트 제공</li>
                        <li>사업 목적 요약</li>
                        <li>평가항목 요약</li>
                    </ul>
                </ProcessBtn>
                )}
                {/* 서비스 버튼을 통해 들어왔을 때 */}
                {view === "service" && (
                    <ProcessBtn
                    type="button"
                    onClick={() => navigate("/notice?view=service")}>
                    <h3>공고문 분석</h3>
                    <ul>
                        <li>자격요건 체크리스트 제공</li>
                        <li>사업 목적 요약</li>
                        <li>평가항목 요약</li>
                    </ul>
                </ProcessBtn>
                )}

                {/* 공고 버튼을 통해 들어왔을 때 */}
                {view === "notice" && (
                <ProcessBtn
                    type="button"
                    onClick={() => {
                        if(!noticeId)
                            return;
                        handleRFPSearch(noticeId);
                        }}>
                    <h3>유관 RFP 검색</h3>
                    <ul>
                        <li>동일 주관 기관 내 유사 RFP 추천</li>
                        <li>사내 유사 RFP 추천</li>
                    </ul>
                </ProcessBtn>
                )}
                {/* 서비스 버튼을 통해 들어왔을 때 */}
                {view === "service" && (
                    <ProcessBtn
                    type="button"
                    onClick={() => navigate("/notice")}>
                    <h3>유관 RFP 검색</h3>
                    <ul>
                        <li>동일 주관 기관 내 유사 RFP 추천</li>
                        <li>사내 유사 RFP 추천</li>
                    </ul>
                </ProcessBtn>
                )}

                <ProcessBtn
                    type="button"
                    onClick={() => {
                        if(!noticeId)
                            return;
                        handleAnnounce(noticeId);
                        }}>
                    <h3>발표자료 제작</h3>
                    <ul>
                        <li>스토리라인 구성</li>
                        <li>키워드 추출</li>
                        <li>구조도/그림 생성</li>
                    </ul>
                </ProcessBtn>
                <ProcessBtn
                    type="button"
                    onClick={() => {
                        if(!noticeId)
                            return;
                        handleScript(noticeId);
                        }}>
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