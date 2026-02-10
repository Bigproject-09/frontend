import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import http from "../../api/http";

import { jsPDF } from "jspdf";
import { NotoSansKR } from "../../utils/NotoSansKR";

// ====== HEAD 쪽 DB/API 결과 타입(요약 리스트) ======
type ChecklistRow = {
  checklistId: number;
  type: string;
  content: string;
};

type RefRow = {
  referenceId: number;
  type: string;
  title: string;
  url: string;
};

type StoredRaw = {
  checklist?: any; // FastAPI checklist_json
  analysis?: any; // FastAPI analysis_json
  overall_eligibility?: any;
};

// ====== frontend UI가 쓰는 타입 ======
interface Judgment {
  id: number;
  category: string;
  requirement_text: string;
  judgment: "가능" | "불가능" | "확인 필요";
  reason: string;
  // 최종적으로 UI/PDF에서 항상 배열로 다룰 거라 string[]로 고정
  quote_from_announcement: string[];
  additional_action: string;
}

interface AnalysisData {
  judgments: Judgment[];
  purpose?: string;
  evaluationItems?: string;
}

// ====== FastAPI / DB raw JSON -> UI 타입으로 변환 ======
function normalizeAnalysisData(rawChecklist: any, rawAnalysis: any): AnalysisData | null {
  if (!rawChecklist && !rawAnalysis) return null;

  const list =
    rawChecklist?.judgments ??
    rawChecklist?.requirements ??
    rawChecklist?.items ??
    rawAnalysis?.judgments ??
    rawAnalysis?.requirements ??
    rawAnalysis?.items ??
    [];

  const judgments: Judgment[] = Array.isArray(list)
    ? list.map((it: any, idx: number) => {
        // quote_from_announcement: string | string[] 케이스 모두 처리
        const quotes = (() => {
          const q = it?.quote_from_announcement ?? it?.quotes ?? [];
          if (Array.isArray(q)) return q.map((x: any) => String(x));
          if (q === null || q === undefined) return [];
          return [String(q)];
        })();

        return {
          id: Number(it?.id ?? idx + 1),
          category: String(it?.category ?? it?.title ?? it?.requirement_category ?? `항목 ${idx + 1}`),
          requirement_text: String(it?.requirement_text ?? it?.requirement ?? it?.text ?? it?.requirementText ?? ""),
          judgment: ((): Judgment["judgment"] => {
            const v = String(it?.judgment ?? it?.result ?? it?.status ?? "").trim();
            if (v === "가능" || v === "불가능" || v === "확인 필요") return v as any;
            if (v.toLowerCase() === "ok" || v.toLowerCase() === "pass" || v === "충족") return "가능";
            if (v.toLowerCase() === "no" || v.toLowerCase() === "fail" || v === "미충족") return "불가능";
            return "확인 필요";
          })(),
          reason: String(it?.reason ?? it?.why ?? it?.rationale ?? ""),
          quote_from_announcement: quotes,
          additional_action: String(it?.additional_action ?? it?.action ?? it?.next_step ?? ""),
        };
      })
    : [];

  // ===== 목적/평가항목: 네가 준 실제 analysis_json 구조에 맞춤 =====
  // 목적 요약: background.summary
  const purpose = rawAnalysis?.background?.summary ?? "";

  // 평가항목 요약: evaluation_criteria[] (title + points)
  const evaluationItems = Array.isArray(rawAnalysis?.evaluation_criteria)
    ? rawAnalysis.evaluation_criteria
        .map((c: any) => {
          const t = c?.title ? `- ${String(c.title)}` : "";
          const p = c?.points !== undefined ? ` (${String(c.points)}점)` : "";
          return (t + p).trim();
        })
        .filter(Boolean)
        .join("\n")
    : "";

  return {
    judgments,
    purpose: purpose ? String(purpose) : undefined,
    evaluationItems: evaluationItems ? String(evaluationItems) : undefined,
  };
}

const NoticeNewPageResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const noticeId = location.state?.noticeId as number | undefined;
  const step1Result = location.state?.result as any | undefined;

  // HEAD 로직 유지(조회 + 에러/로딩)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checklists, setChecklists] = useState<ChecklistRow[]>([]);
  const [references, setReferences] = useState<RefRow[]>([]);
  const [storedRaw, setStoredRaw] = useState<StoredRaw>({});

  // frontend UI용 state
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const rawChecklist = useMemo(() => {
    return step1Result?.fastapi?.data?.checklist ?? storedRaw.checklist ?? null;
  }, [step1Result, storedRaw]);

  const rawAnalysis = useMemo(() => {
    return step1Result?.fastapi?.data?.analysis ?? storedRaw.analysis ?? null;
  }, [step1Result, storedRaw]);

  useEffect(() => {
    if (!noticeId) {
      setError("noticeId가 없습니다. /process에서 다시 들어오세요.");
      return;
    }

    setLoading(true);
    setError(null);

    http
      .get(`/api/notices/${noticeId}/analysis-results`)
      .then(({ data }) => {
        setChecklists((data.checklists ?? []) as ChecklistRow[]);
        setReferences((data.references ?? []) as RefRow[]);
        setStoredRaw((data.raw ?? {}) as StoredRaw);
      })
      .catch((e) => {
        console.error(e);
        setError("저장된 결과 조회 실패");
      })
      .finally(() => setLoading(false));
  }, [noticeId]);

  // raw -> UI 변환
  useEffect(() => {
    const normalized = normalizeAnalysisData(rawChecklist, rawAnalysis);
    setAnalysisData(normalized);
  }, [rawChecklist, rawAnalysis]);

  const handleBack = (id: number) => {
    navigate("/process/analysis", { state: { noticeId: id } });
  };

  const handleDownloadPDF = () => {
    if (!analysisData?.judgments || analysisData.judgments.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.addFileToVFS("NotoSansKR-Regular.ttf", NotoSansKR);
    doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
    doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "bold");

    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    doc.setFont("NotoSansKR", "bold");
    doc.setFontSize(18);
    doc.text("자격 요건 체크리스트", margin, y);
    y += 15;

    doc.setFont("NotoSansKR", "normal");
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString("ko-KR");
    doc.text(`작성일: ${today}`, margin, y);
    y += 10;

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    analysisData.judgments.forEach((req, idx) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("NotoSansKR", "bold");
      doc.setFontSize(12);
      doc.text(`${idx + 1}. ${req.category}`, margin, y);
      y += 8;

      doc.setFont("NotoSansKR", "normal");
      doc.setFontSize(10);

      doc.text("요구사항:", margin + 5, y);
      y += 6;
      doc.splitTextToSize(req.requirement_text, contentWidth - 10).forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + 10, y);
        y += 5;
      });
      y += 3;

      doc.text("가능 여부:", margin + 5, y);
      y += 6;
      doc.splitTextToSize(req.judgment, contentWidth - 10).forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + 10, y);
        y += 5;
      });
      y += 8;

      if (req.reason) {
        doc.text("근거:", margin + 5, y);
        y += 6;
        doc.splitTextToSize(req.reason, contentWidth - 10).forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin + 10, y);
          y += 5;
        });
        y += 6;
      }

      if (req.quote_from_announcement.length > 0) {
        doc.text("관련 법령:", margin + 5, y);
        y += 6;

        req.quote_from_announcement.forEach((quote: string) => {
          doc.splitTextToSize(quote, contentWidth - 10).forEach((line: string) => {
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, margin + 10, y);
            y += 5;
          });
          y += 4;
        });
        y += 4;
      }

      if (req.additional_action) {
        doc.text("추가 조치:", margin + 5, y);
        y += 6;
        doc.splitTextToSize(req.additional_action, contentWidth - 10).forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin + 10, y);
          y += 5;
        });
        y += 6;
      }

      if (idx < analysisData.judgments.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      }
    });

    doc.save(`자격요건_체크리스트_${today}.pdf`);
  };

  // ====== 에러/로딩 ======
  if (error) {
    return (
      <Container>
        <Card>
          <div className="title" style={{ marginLeft: 0, marginBottom: 20 }}>
            공고문 분석
          </div>
          <ErrorText>{error}</ErrorText>
          <RightActionRow>
            <button type="button" className="button_center" style={{ width: 120 }} onClick={() => navigate("/process")}>
              돌아가기
            </button>
          </RightActionRow>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Card>
          <div className="title" style={{ marginLeft: 0, marginBottom: 20 }}>
            공고문 분석
          </div>
          <div style={{ padding: 20 }}>로딩 중...</div>
        </Card>
      </Container>

    );
  }

  // ====== UI는 frontend 스타일 ======
  return (
    <Container>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 50 }}>
          공고문 분석
        </div>

        <ChecklistHeader>
          <div className="title" style={{ fontSize: 15 }}>
            자격 요건 체크리스트
          </div>
          <PDFDownloadButton onClick={handleDownloadPDF}>PDF로 다운로드</PDFDownloadButton>
        </ChecklistHeader>

        <Section>
          {analysisData?.judgments && analysisData.judgments.length > 0 ? (
            <RequirementList>
              {analysisData.judgments.map((req) => (
                <RequirementItem key={req.id}>
                  <RequirementHeader>
                    <HeaderLeft>
                      <RequirementTitle>{req.category}</RequirementTitle>
                    </HeaderLeft>
                    <StatusBadge status={req.judgment}>{req.judgment}</StatusBadge>
                  </RequirementHeader>

                  <ExpandableText text={req.requirement_text} />

                  {(req.reason || req.quote_from_announcement.length > 0 || req.additional_action) && (
                    <ArrowWrapper>{/* 여기서 토글 넣고 싶으면 넣어 */}</ArrowWrapper>
                  )}

                  {(req.reason || req.quote_from_announcement.length > 0 || req.additional_action) && (
                    <>
                      {req.reason && <ExpandableText text={req.reason} />}

                      {req.quote_from_announcement.length > 0 && (
                        <>
                          <Label style={{ marginTop: 12, color: "#0984e3" }}>관련 법령</Label>
                          <div
                            style={{
                              marginTop: 10,
                              padding: 14,
                              background: "#f1f3f5",
                              borderRadius: 8,
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {req.quote_from_announcement.map((q, idx) => (
                              <div key={idx} style={{ marginBottom: 8 }}>
                                {q}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {req.additional_action && (
                        <ConfirmationBox>
                          <Label>추가 조치</Label>
                          <Text>{req.additional_action}</Text>
                        </ConfirmationBox>
                      )}
                    </>
                  )}
                </RequirementItem>
              ))}
            </RequirementList>
          ) : (
            <EmptyMessage>자격 요건 데이터가 없습니다.</EmptyMessage>
          )}
        </Section>

        <br />

        <div className="title" style={{ fontSize: 15 }}>
          사업 목적 요약
        </div>
        <Section>
          <Text>{analysisData?.purpose ?? "데이터 없음"}</Text>
        </Section>

        <br />

        <div className="title" style={{ fontSize: 15 }}>
          평가항목 요약
        </div>
        <Section>
          <Text style={{ whiteSpace: "pre-wrap" }}>{analysisData?.evaluationItems ?? "데이터 없음"}</Text>
        </Section>

        <RightActionRow>
          <button
            type="button"
            className="button_center"
            style={{ width: 120 }}
            onClick={() => noticeId && handleBack(noticeId)}
          >
            재추출
          </button>
        </RightActionRow>

        {/* (옵션) HEAD 기능: DB에 저장된 요약 체크리스트/참고자료도 같이 보여주기 */}
        <br />
        <div className="title" style={{ fontSize: 15 }}>
          저장된 체크리스트(요약)
        </div>
        <Section>
          {checklists.length === 0 ? (
            <EmptyMessage>저장된 체크리스트가 없습니다.</EmptyMessage>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {checklists.map((c) => (
                <li key={c.checklistId} style={{ margin: "8px 0", lineHeight: 1.5 }}>
                  <Tag>{c.type}</Tag> {c.content}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="title" style={{ fontSize: 15 }}>
          참고자료
        </div>
        <Section>
          {references.length === 0 ? (
            <EmptyMessage>저장된 참고자료가 없습니다.</EmptyMessage>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {references.map((r) => (
                <li key={r.referenceId} style={{ margin: "8px 0", lineHeight: 1.5 }}>
                  <Tag>{r.type}</Tag>{" "}
                  {r.url?.startsWith("http") ? (
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.title}
                    </a>
                  ) : (
                    <>
                      {r.title} — <Code>{r.url}</Code>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Card>
    </Container>
  );
};

// ====== ExpandableText (frontend UI 컴포) ======
const ExpandableText: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current;
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <Text
        ref={textRef as any}
        style={
          isExpanded
            ? {}
            : {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                minWidth: 0,
              }
        }
      >
        {text}
      </Text>
      {isOverflowing && !isExpanded && (
        <MoreButton onClick={() => setIsExpanded(true)} style={{ flexShrink: 0 }}>
          [더보기]
        </MoreButton>
      )}
    </div>
  );
};

export default NoticeNewPageResult;

// ====== styled (frontend 스타일 우선 + 필요한 것만 추가) ======
const Container = styled.div`
  padding: 60px;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px;
`;

const RightActionRow = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
`;

const ErrorText = styled.div`
  color: #b91c1c;
  margin: 16px 0;
`;

const Label = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #636e72;
  margin-bottom: 6px;
`;

const Text = styled.div`
  font-size: 14px;
  color: #2d3436;
  line-height: 1.6;
`;

const Section = styled.div`
  width: 100%;
  height: 300px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 28px;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #636e72;
  padding: 40px;
`;

const RequirementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RequirementItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
`;

const RequirementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const RequirementTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #2d3436;
`;

const ConfirmationBox = styled.div`
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px;
  margin-top: 12px;
  border-radius: 4px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChecklistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PDFDownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  &:active {
    transform: translateY(0);
  }
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  color: #636e72;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 0;

  &:hover {
    color: #2d3436;
    text-decoration: underline;
  }
`;

const ArrowWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
  cursor: default;
  font-size: 14px;
  color: #636e72;
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  background-color: ${(props) => {
    switch (props.status) {
      case "가능":
        return "#00b894";
      case "불가능":
        return "#d63031";
      case "확인 필요":
        return "#fdcb6e";
      default:
        return "#b2bec3";
    }
  }};
  ${(props) =>
    props.status === "확인 필요" &&
    `
      color: #2d3436;
    `}
`;

const Tag = styled.span`
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #fff;
  margin-right: 6px;
`;

const Code = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
`;
