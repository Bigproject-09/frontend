import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";
import http from "../../api/http";

type AnnounceStep =
  | "UPLOAD_CHECK"
  | "TEXT_EXTRACT"
  | "SECTION_SPLIT"
  | "SLIDE_GENERATE"
  | "SLIDE_MERGE"
  | "PPT_CREATE";

const STEP_TEXT: Record<AnnounceStep, string> = {
  UPLOAD_CHECK: "파일 확인 중...",
  TEXT_EXTRACT: "텍스트 추출 중...",
  SECTION_SPLIT: "섹션 분할 중...",
  SLIDE_GENERATE: "슬라이드 생성 중 (Gemini API)...",
  SLIDE_MERGE: "슬라이드 병합 중...",
  PPT_CREATE: "PPTX 생성 중 (Gamma API)...",
};

const AnnounceCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("-");
  const [org, setOrg] = useState("-");
  const [budget, setBudget] = useState("-");
  const [period, setPeriod] = useState("-");
  const [url, setUrl] = useState("-");
  const [summary, setSummary] = useState("-");

  const [isLoading, setIsLoading] = useState(false);
  const [pptResult, setPptResult] = useState<any | null>(null);
  const [step, setStep] = useState<AnnounceStep>("UPLOAD_CHECK");
  const [progress, setProgress] = useState(0);

  const [files, setFiles] = useState<File[]>([]);
  const location = useLocation();
  const noticeId = location.state?.noticeId as number | undefined;

  // ✅ 공고 상세 API 호출
  useEffect(() => {
    if (!noticeId) return;

    (async () => {
      try {
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
        setBudget("-");
      } catch (err) {
        console.error("공고 조회 오류:", err);
        setTitle("-");
        setOrg("-");
        setBudget("-");
        setPeriod("-");
        setUrl("-");
        setSummary("-");
      }
    })();
  }, [noticeId]);

  const runStep = (s: AnnounceStep, duration: number) => {
    return new Promise<void>((resolve) => {
      setStep(s);
      setProgress(0);

      const start = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.min(Math.floor((elapsed / duration) * 100), 100);
        setProgress(percent);

        if (percent >= 100) {
          clearInterval(timer);
          resolve();
        }
      }, 60);
    });
  };

  // ✅ PPT 생성 핸들러 (FastAPI Step 3 호출)
  const handleGeneratePPT = async () => {
    if (files.length === 0) {
      alert("제안서 파일을 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setPptResult(null);

    try {
      // 1) 파일 확인
      await runStep("UPLOAD_CHECK", 500);

      // 2) FormData 생성
      const formData = new FormData();
      formData.append("file", files[0]); // 첫 번째 파일 사용
      if (noticeId) {
        formData.append("notice_id", noticeId.toString());
      }

      // 3) FastAPI Step 3 호출 (각 단계별 progress 시뮬레이션)
      const steps: AnnounceStep[] = [
        "TEXT_EXTRACT",
        "SECTION_SPLIT",
        "SLIDE_GENERATE",
        "SLIDE_MERGE",
        "PPT_CREATE",
      ];

      // 병렬: API 호출 + 진행률 시뮬레이션
      const apiPromise = http.post(
        "http://localhost:8000/api/analyze/step3",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 진행률 시뮬레이션 (총 60초 가정: 텍스트 5초, 섹션 5초, 슬라이드 30초, 병합 5초, PPTX 15초)
      const durations = [5000, 5000, 30000, 5000, 15000];

      for (let i = 0; i < steps.length; i++) {
        await runStep(steps[i], durations[i]);
      }

      // API 응답 대기
      const { data } = await apiPromise;

      setPptResult(data.data);
      alert(`PPT 생성 완료!\n파일: ${data.data.pptx_path}`);
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.response?.data?.message || "PPT 생성 중 오류가 발생했습니다.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToProcess = (id: number) => {
    navigate("/process", { state: { noticeId: id } });
  };

  return (
    <Page>
      {isLoading && (
        <LoadingOverlay>
          <LoadingBox>
            <Spinner />
            {STEP_TEXT[step]}
            <br />
            {progress}%
          </LoadingBox>
        </LoadingOverlay>
      )}

      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 18 }}>
          발표 자료 제작
        </div>

        <Section>
          <ModalGrid>
            <div className="label">제목</div>
            <div className="text">{title}</div>

            <div className="label">기관</div>
            <div className="text">{org}</div>

            <div className="label">기간</div>
            <div className="text">{period}</div>

            <div className="label">URL</div>
            <div className="text">
              {url !== "-" ? (
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              ) : (
                url
              )}
            </div>
          </ModalGrid>

          <ModalSummary>
            <div className="label">요약</div>
            <div className="text">{summary}</div>
          </ModalSummary>

          <UploadArea>
            <UploadLabel htmlFor="file">제안서 파일 업로드 (.pdf)</UploadLabel>
            <HiddenInput
              id="file"
              type="file"
              accept=".pptx,.pdf,.docx"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files ?? []);
                setFiles(selectedFiles);
              }}
            />
            {files.length > 0 && (
              <FileList>
                {files.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </FileList>
            )}
          </UploadArea>

          <ModalActions>
            <GenerateBtn
              type="button"
              onClick={handleGeneratePPT}
              disabled={files.length === 0 || isLoading}
            >
              PPT 생성
            </GenerateBtn>
            <MiniBtn
              type="button"
              onClick={() => {
                if (!noticeId) return;
                handleBackToProcess(noticeId);
              }}
            >
              닫기
            </MiniBtn>
          </ModalActions>

          {/* ✅ PPT 생성 결과 출력 */}
          {pptResult && (
            <ResultBox>
              <ResultTitle>✅ PPT 생성 완료!</ResultTitle>
              <ResultItem>
                <ResultLabel>제목:</ResultLabel>
                <ResultValue>{pptResult.deck_title}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>슬라이드 수:</ResultLabel>
                <ResultValue>{pptResult.total_slides}장</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>파일 경로:</ResultLabel>
                <ResultValue>{pptResult.pptx_path}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>섹션:</ResultLabel>
                <ResultValue>{pptResult.sections?.join(", ")}</ResultValue>
              </ResultItem>
              {pptResult.db_saved !== undefined && (
                <ResultItem>
                  <ResultLabel>DB 저장:</ResultLabel>
                  <ResultValue>{pptResult.db_saved ? "성공" : "실패"}</ResultValue>
                </ResultItem>
              )}
            </ResultBox>
          )}
        </Section>
      </Card>
    </Page>
  );
};

export default AnnounceCreatePage;

/* ===== styled-components ===== */

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg-main);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px 0;
  box-sizing: border-box;
`;

const Card = styled.div`
  width: 1100px;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
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
    line-height: 1.5;
    word-break: break-word;
  }

  a {
    color: #2563eb;
    text-decoration: underline;

    &:hover {
      opacity: 0.85;
    }
  }
`;

const ModalSummary = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 14px;
  line-height: 1.45;

  .label {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .text {
    font-size: 14px;
    color: #1f2937;
    white-space: pre-wrap;
  }
`;

const UploadLabel = styled.label`
  padding: 12px 26px;
  background-color: var(--color-accent);
  color: white;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-accent-hover);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadArea = styled.div`
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ModalActions = styled.div`
  margin-top: 22px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const GenerateBtn = styled.button`
  padding: 10px 24px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const MiniBtn = styled.button`
  width: 80px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;

  &:hover {
    background: #f9fafb;
  }
`;

const FileList = styled.ul`
  margin-top: 12px;
  padding: 12px 16px;
  width: 100%;
  max-width: 420px;

  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  li {
    font-size: 13px;
    color: #374151;
    line-height: 1.6;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingBox = styled.div`
  background: #ffffff;
  padding: 32px 40px;
  border-radius: 14px;
  text-align: center;
  min-width: 280px;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
`;

const Spinner = styled.div`
  width: 42px;
  height: 42px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ResultBox = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 2px solid #10b981;
  border-radius: 12px;
  background: #f0fdf4;
`;

const ResultTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 16px;
`;

const ResultItem = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
`;

const ResultLabel = styled.span`
  font-weight: 600;
  color: #374151;
  min-width: 100px;
`;

const ResultValue = styled.span`
  color: #1f2937;
`;