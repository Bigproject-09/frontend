// import React, { useMemo, useRef, useState, useEffect } from "react";
// import styled from "styled-components";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../../styles/Global.css";
// import { STORAGE_KEY } from "../../common/constants";

// type NoticeItem = {
//   id: number;
//   title: string;
//   dday: string;
//   score: number;
//   isRead: boolean;
//   url?: string;

//   org?: string;
//   budget?: string;
//   period?: string;
//   summary?: string;
// };

// type RFPStep =
//   | "UPLOAD_CHECK"
//   | "CHECKLIST_CREATE"
//   | "PURPOSE_SUMMARY"
//   | "CATEGORY_SUMMARY";

// const STEP_TEXT: Record<RFPStep, string> = {
//   UPLOAD_CHECK: "추가 파일 확인 중...",
//   CHECKLIST_CREATE: "체크리스트 생성 중...",
//   PURPOSE_SUMMARY: "사업 목적 요약 중...",
//   CATEGORY_SUMMARY: "평가항목 요약 중...",
// };

// const RFPSearchPage: React.FC = () => {
//   const navigate = useNavigate();

//   const [title, setTitle] = useState("");
//   const [org, setOrg] = useState("");
//   const [budget, setBudget] = useState("");
//   const [period, setPeriod] = useState("");
//   const [url, setUrl] = useState("");
//   const [summary, setSummary] = useState("");
//   // 로딩 상태 추가
//   const [isLoading, setIsLoading] = useState(false);
//   const [step, setStep] = useState<RFPStep>("UPLOAD_CHECK");
//   const [progress, setProgress] = useState(0);

//   const titleRef = useRef<HTMLInputElement | null>(null);
//   const orgRef = useRef<HTMLInputElement | null>(null);
//   const budgetRef = useRef<HTMLInputElement | null>(null);
//   const periodRef = useRef<HTMLInputElement | null>(null);
//   const urlRef = useRef<HTMLInputElement | null>(null);
//   const summaryRef = useRef<HTMLTextAreaElement | null>(null);

//   const [files, setFiles] = useState<File[]>([]);
//   const location = useLocation();
//   const noticeId = location.state?.noticeId as number | undefined;

//   useEffect(() => {
//   if (!noticeId) return;

//   const items = loadItems();
//   const target = items.find((it) => it.id === noticeId);

//   if (!target) return;

//   setTitle(target.title ?? "");
//   setOrg(target.org ?? "");
//   setBudget(target.budget ?? "");
//   setPeriod(target.period ?? "");
//   setUrl(target.url ?? "");
//   setSummary(target.summary ?? "");
// }, [noticeId]);


//   const requiredFields = useMemo(
//     () => [
//       { label: "제목", value: title, ref: titleRef },
//       { label: "기관", value: org, ref: orgRef },
//       { label: "예산", value: budget, ref: budgetRef },
//       { label: "기간", value: period, ref: periodRef },
//       { label: "URL", value: url, ref: urlRef },
//       // { label: "요약", value: summary, ref: summaryRef },
//     ],
//     [title, org, budget, period, url, summary]
//   );

//   const loadItems = (): NoticeItem[] => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (!raw) return [];
//       const parsed = JSON.parse(raw);
//       return Array.isArray(parsed) ? (parsed as NoticeItem[]) : [];
//     } catch {
//       return [];
//     }
//   };

//   const focusFirstEmpty = () => {
//     const firstEmpty = requiredFields.find((f) => !f.value.trim());
//     if (!firstEmpty) return false;

//     alert(`${firstEmpty.label} 항목을 입력해 주세요.`);

//     const el = firstEmpty.ref.current;
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth", block: "center" });
//       setTimeout(() => el.focus(), 150);
//     }
//     return true;
//   };

//   // 공고와 추가파일들을 업로드 후 분석하면 발생하는 이벤트
//   const handleSubmit = async(id: number) => {
//     if (focusFirstEmpty()) return;

//     setIsLoading(true);

//     try {
//       // 🔥 실제로는 여기서 API 호출
//       await runStep("UPLOAD_CHECK", 800);
//       await runStep("CHECKLIST_CREATE", 1400);
//       await runStep("PURPOSE_SUMMARY", 1200);
//       await runStep("CATEGORY_SUMMARY", 900);

//       navigate("/process/analysis/result", {
//         state: { noticeId: id },
//       });
//     } catch (e) {
//         alert("분석 중 오류가 발생했습니다.");
//         setIsLoading(false);
//     }
//   };

//   const handleBackToProcess = (id:number) => {
//       navigate("/process", {
//       state: {noticeId: id},
//     });
//   }

//   const runStep = (s: RFPStep, duration: number) => {
//     return new Promise<void>((resolve) => {
//       setStep(s);
//       setProgress(0);

//       const start = Date.now();
//       const timer = setInterval(() => {
//         const elapsed = Date.now() - start;
//         const percent = Math.min(
//           Math.floor((elapsed / duration) * 100),
//           100
//         );
//         setProgress(percent);

//         if (percent >= 100) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 60);
//     });
//   };


//   return (
//     <Page>
//       {/* 로딩 상태일 때 채워주는 페이지 */}
//       {isLoading && (
//         <LoadingOverlay>
//           <LoadingBox>
//             <Spinner />
//               {STEP_TEXT[step]}<br />
//               {progress}%
//           </LoadingBox>
//         </LoadingOverlay>
//       )}

//       <Card>
//         <div className="title" style={{ marginLeft: 0, marginBottom: 18 }}>
//           유관 RFP 검색
//         </div>

//         <Section>
//           <ModalGrid>
//             <div className="label">제목</div>
//             <div className="text">{title}</div>

//             <div className="label">기관</div>
//             <div className="text">{org}</div>

//             <div className="label">기간</div>
//             <div className="text">{period}</div>

//             <div className="label">URL</div>
//             <div className="text">{url}</div>
//           </ModalGrid>

//             <ModalSummary>
//             <div className="label">요약</div>
//             <div className="text">{summary}</div>
//             </ModalSummary>

//           <UploadArea>
//             <UploadLabel htmlFor="file">
//             추가파일 업로드
//             </UploadLabel>
//             <HiddenInput
//               id="file"
//               type="file"
//               accept=".docx"
//               multiple
//               onChange={(e) => {
//                 const selectedFiles = Array.from(e.target.files ?? []);
//                 setFiles(selectedFiles);
//               }}
//             />
//               {files.length > 0 && (
//               <FileList>
//                 {files.map((file, idx) => (
//                   <li key={idx}>{file.name}</li>
//                 ))}
//               </FileList>
//             )}
//           </UploadArea>

//           <ModalActions>
//             <MiniBtn type="button" onClick={() => {
//               if (!noticeId) return;
//               handleSubmit(noticeId);
//             }}>
//               검색
//             </MiniBtn>
//             <MiniBtn type="button" onClick={() => 
//             {
//               if(!noticeId) return;
//               handleBackToProcess(noticeId);
//             }}>
//               닫기
//             </MiniBtn>
//           </ModalActions>
//         </Section>
//       </Card>
//     </Page>
//   );
// };

// export default RFPSearchPage;

// /* ===== styled-components ===== */

// const Page = styled.div`
//   width: 100%;
//   min-height: 100vh;
//   background: var(--color-bg-main);
//   display: flex;
//   justify-content: center;
//   align-items: flex-start;
//   padding: 30px 0;
//   box-sizing: border-box;
// `;

// const Card = styled.div`
//   width: 1100px;
//   background: #ffffff;
//   border-radius: 12px;
//   padding: 28px;
//   box-sizing: border-box;
//   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06)
// `;

// const Section = styled.div`
//   background: #f9fafb;
//   border-radius: 10px;
//   padding: 18px 20px;
//   box-sizing: border-box;
//   margin-bottom: 16px;
//   border: 1px solid #e5e7eb;
// `;

// const ModalGrid = styled.div`
//   display: grid;
//   grid-template-columns: 120px 1fr;
//   row-gap: 12px;
//   column-gap: 16px;
//   align-items: center;

//   .label {
//     font-size: 14px;
//     color: #374151;
//     font-weight: 500;
//   }

//   .input {
//     width: 100%;
//     height: 38px;
//     padding: 0 12px;
//     box-sizing: border-box;

//     border: 1px solid #d1d5db;
//     border-radius: 6px;
//     font-size: 14px;
//   }

//   .input:focus {
//     outline: none;
//     border-color: var(--color-accent);
//     box-shadow: 0 0 0 2px rgba(46, 111, 219, 0.15);
//   }
// `;

// const ModalSummary = styled.div`
//   margin-top: 16px;
//   padding-top: 12px;
//   border-top: 1px solid rgba(0, 0, 0, 0.12);
//   font-size: 14px;
//   line-height:1.45;
//   }
// `;

// /* 업로드 버튼 */
// const UploadLabel = styled.label`
//   padding: 12px 26px;
//   background-color: var(--color-accent);
//   color: white;
//   border-radius: 8px;
//   font-size: 15px;
//   cursor: pointer;

//   &:hover {
//     background-color: var(--color-accent-hover);
//   }
// `;

// const HiddenInput = styled.input`
//   display: none;
// `;

// const UploadArea = styled.div`
//   margin: 24px 0;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 10px;
// `;

// const ModalActions = styled.div`
//   margin-top: 22px;
//   display: flex;
//   justify-content: flex-end;
//   gap: 10px;
// `;


// const MiniBtn = styled.button`
//   width: 80px;
//   height: 36px;
//   background: #ffffff;
//   border: 1px solid #d1d5db;
//   border-radius: 6px;
//   cursor: pointer;
//   font-size: 13px;
//   color: #374151;

//   &:hover {
//     background: #f9fafb;
//   }
// `;


// // 올린 파일 리스트
// const FileList = styled.ul`
//   margin-top: 12px;
//   padding: 12px 16px;
//   width: 100%;
//   max-width: 420px;

//   background: #ffffff;
//   border: 1px solid #e5e7eb;
//   border-radius: 8px;

//   li {
//     font-size: 13px;
//     color: #374151;
//     line-height: 1.6;
//   }
// `;

// const LoadingOverlay = styled.div`
//   position: fixed;
//   inset: 0;
//   background: rgba(0, 0, 0, 0.45);
//   z-index: 9999;

//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;

// const LoadingBox = styled.div`
//   background: #ffffff;
//   padding: 32px 40px;
//   border-radius: 14px;
//   text-align: center;
//   min-width: 240px;
// `;

// const Spinner = styled.div`
//   width: 42px;
//   height: 42px;
//   border: 4px solid #e5e7eb;
//   border-top: 4px solid #2563eb;
//   border-radius: 50%;
//   animation: spin 0.9s linear infinite;
//   margin: 0 auto 16px;

//   @keyframes spin {
//     to {
//       transform: rotate(360deg);
//     }
//   }
// `;

import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";
import http from "../../api/http";

type RFPStep =
  | "UPLOAD_CHECK"
  | "CHECKLIST_CREATE"
  | "PURPOSE_SUMMARY"
  | "CATEGORY_SUMMARY";

const STEP_TEXT: Record<RFPStep, string> = {
  UPLOAD_CHECK: "추가 파일 확인 중...",
  CHECKLIST_CREATE: "체크리스트 생성 중...",
  PURPOSE_SUMMARY: "사업 목적 요약 중...",
  CATEGORY_SUMMARY: "평가항목 요약 중...",
};

const RFPSearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("-");
  const [org, setOrg] = useState("-");
  const [budget, setBudget] = useState("-");
  const [period, setPeriod] = useState("-");
  const [url, setUrl] = useState("-");
  const [summary, setSummary] = useState("-");

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<RFPStep>("UPLOAD_CHECK");
  const [progress, setProgress] = useState(0);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const orgRef = useRef<HTMLInputElement | null>(null);
  const budgetRef = useRef<HTMLInputElement | null>(null);
  const periodRef = useRef<HTMLInputElement | null>(null);
  const urlRef = useRef<HTMLInputElement | null>(null);
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const location = useLocation();
  const noticeId = location.state?.noticeId as number | undefined;

  // ✅ 공고 상세 API 호출 (ProcessPage와 동일)
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
        setBudget("-"); // 예산 필드 생기면 매핑
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

  const runStep = (s: RFPStep, duration: number) => {
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

  // ✅ 검색 버튼 (지금은 로딩 시뮬, 실제 API 연결은 나중에)
  const handleSubmit = async (id: number) => {
    setIsLoading(true);

    try {
      await runStep("UPLOAD_CHECK", 800);
      await runStep("CHECKLIST_CREATE", 1400);
      await runStep("PURPOSE_SUMMARY", 1200);
      await runStep("CATEGORY_SUMMARY", 900);

      // TODO: 실제 결과 페이지로 보내려면 여기 state에 rfpData 넣으면 됨
      // navigate("/process/rfp/result", { state: { noticeId: id, rfpData: result.data } });

      alert("RFP 검색(시뮬레이션) 완료");
    } catch (e) {
      console.error(e);
      alert("검색 중 오류가 발생했습니다.");
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
          유관 RFP 검색
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
            <UploadLabel htmlFor="file">추가파일 업로드</UploadLabel>
            <HiddenInput
              id="file"
              type="file"
              accept=".docx"
              multiple
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
            <MiniBtn
              type="button"
              onClick={() => {
                if (!noticeId) return;
                handleSubmit(noticeId);
              }}
            >
              검색
            </MiniBtn>
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
        </Section>
      </Card>
    </Page>
  );
};

export default RFPSearchPage;

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

/* 업로드 버튼 */
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

// 올린 파일 리스트
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
  min-width: 240px;
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
