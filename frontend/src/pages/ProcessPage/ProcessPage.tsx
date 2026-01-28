import React, {useState, useEffect} from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
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
    const storage_key = localStorage.getItem(STORAGE_KEY);

    const [title, setTitle] = useState("");
    const [org, setOrg] = useState("");
    const [budget, setBudget] = useState("");
    const [period, setPeriod] = useState("");
    const [url, setUrl] = useState("");
    const [summary, setSummary] = useState("");

    const location = useLocation();
    const noticeId = location.state?.noticeId as number | undefined;

    const loadItems = (): NoticeItem[] => {
        try {
        if (!storage_key) return [];
        const parsed = JSON.parse(storage_key);
        return Array.isArray(parsed) ? (parsed as NoticeItem[]) : [];
        } catch {
        return [];
        }
    };
    
    // 공고문 분석 버튼
    const handleAnalysis = (id:number) => {
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

    useEffect(() => {
        if (!noticeId) return;
        
        const items = loadItems();
        const target = items.find((it) => it.id === noticeId);
        
        if (!target) return;
        
        setTitle(target.title ?? "");
        setOrg(target.org ?? "");
        setBudget(target.budget ?? "");
        setPeriod(target.period ?? "");
        setUrl(target.url ?? "");
        setSummary(target.summary ?? "");
        }, [noticeId]);

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
                    <div className="text">{url}</div>     
                    <label>요약</label>
                    <div className="text">{summary}</div>                  
                </ModalGrid>
            </Section>

            <ButtonGroup>
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

  .label {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
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
`;