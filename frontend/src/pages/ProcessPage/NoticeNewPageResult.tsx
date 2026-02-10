import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import http from "../../api/http";

import { jsPDF } from "jspdf";
import { NotoSansKR } from "../../utils/NotoSansKR";

type EligibilityStatus = "가능" | "불가" | "보류";

type NoticeAnalysisAggregatedResponse = {
  eligibility: {
    status: EligibilityStatus;
    summary: string;

    judgments: Array<{
      id: number;
      category: string;
      requirement_text: string;
      judgment: EligibilityStatus;
      reason: string;
      company_info_used: string;
      quote_from_announcement: string;
      additional_action: string | null;
    }>;

    missing_info: string[];
    warning_items: string[];
    recommendations: string[];
  };

  research_intent: {
    policy_background: string;
    target_issues: string[];
  };

  evaluation_weight_analysis: {
    summary: string;
    high_weight_items: Array<{
      item: string;
      points: number;
      strategy: string;
    }>;
  };

  deliverables: string[];
  mandatory_requirements: string[];
};

const NoticeNewPageResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const noticeId = location.state?.noticeId as number | undefined;

  // HEAD 로직 유지(조회 + 에러/로딩)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aggregated, setAggregated] = useState<NoticeAnalysisAggregatedResponse | null>(null);

  useEffect(() => {
    if (!noticeId) {
      setError("noticeId가 없습니다. /process에서 다시 들어오세요.");
      return;
    }

    setLoading(true);
    setError(null);

    http
      .get(`/api/notices/${noticeId}/analysis-aggregated`)
      .then(({ data }) => {
        setAggregated(data as NoticeAnalysisAggregatedResponse);
      })
      .catch((e) => {
        console.error(e);
        setError("분석 결과 조회 실패");
      })
      .finally(() => setLoading(false));
  }, [noticeId]);

  const handleBack = (id: number) => {
    navigate("/process/analysis", { state: { noticeId: id } });
  };

  const handleDownloadPDF = () => {
    if (!aggregated) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.addFileToVFS("NotoSansKR-Regular.ttf", NotoSansKR);
    doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
    doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "bold");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const today = new Date().toLocaleDateString("ko-KR");

    let y = 20;

    const addPageIfNeeded = (minSpace: number) => {
      if (y + minSpace <= pageHeight - margin) return;
      doc.addPage();
      y = 20;
    };

    const writeParagraph = (text: string, opts?: { indent?: number; fontSize?: number }) => {
      const indent = opts?.indent ?? 0;
      const fontSize = opts?.fontSize ?? 10;
      doc.setFontSize(fontSize);

      const lines = doc.splitTextToSize(text ?? "", contentWidth - indent);
      lines.forEach((line: string) => {
        addPageIfNeeded(8);
        doc.text(line, margin + indent, y);
        y += 5;
      });
    };

    const writeSectionTitle = (title: string) => {
      addPageIfNeeded(18);
      doc.setFont("NotoSansKR", "bold");
      doc.setFontSize(14);
      doc.text(title, margin, y);
      y += 8;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setFont("NotoSansKR", "normal");
    };

    // ====== Header ======
    doc.setFont("NotoSansKR", "bold");
    doc.setFontSize(18);
    doc.text("공고문 분석 결과", margin, y);
    y += 12;

    doc.setFont("NotoSansKR", "normal");
    doc.setFontSize(10);
    doc.text(`작성일: ${today}`, margin, y);
    y += 7;

    if (noticeId) {
      doc.text(`noticeId: ${noticeId}`, margin, y);
      y += 7;
    }

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    // ====== 1. 자격요건 체크리스트 ======
    writeSectionTitle("1. 자격요건 체크리스트");
    doc.setFont("NotoSansKR", "normal");
    writeParagraph(`전체 판정: ${aggregated.eligibility?.status ?? "보류"}`);
    writeParagraph(aggregated.eligibility?.summary ?? "데이터 없음");
    y += 4;

    const judgments = aggregated.eligibility?.judgments ?? [];
    if (judgments.length === 0) {
      writeParagraph("판정 항목이 없습니다.");
    } else {
      judgments.forEach((req, idx) => {
        addPageIfNeeded(16);
        doc.setFont("NotoSansKR", "bold");
        doc.setFontSize(12);
        doc.text(`${idx + 1}. ${req.category} (${req.judgment})`, margin, y);
        y += 8;

        doc.setFont("NotoSansKR", "normal");
        writeParagraph(`요구사항: ${req.requirement_text}`, { indent: 4 });
        if (req.reason) writeParagraph(`근거: ${req.reason}`, { indent: 4 });
        if (req.quote_from_announcement) writeParagraph(`관련 법령/인용: ${req.quote_from_announcement}`, { indent: 4 });
        if (req.additional_action) writeParagraph(`추가 조치: ${req.additional_action}`, { indent: 4 });

        y += 4;
        if (idx < judgments.length - 1) {
          addPageIfNeeded(10);
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;
        }
      });
    }

    const missingInfo = aggregated.eligibility?.missing_info ?? [];
    const warningItems = aggregated.eligibility?.warning_items ?? [];
    const recommendations = aggregated.eligibility?.recommendations ?? [];

    if (missingInfo.length > 0) {
      y += 2;
      doc.setFont("NotoSansKR", "bold");
      writeParagraph("확인 필요한 정보", { fontSize: 11 });
      doc.setFont("NotoSansKR", "normal");
      missingInfo.forEach((v) => writeParagraph(`- ${v}`, { indent: 4 }));
    }

    if (warningItems.length > 0) {
      y += 2;
      doc.setFont("NotoSansKR", "bold");
      writeParagraph("주의 사항", { fontSize: 11 });
      doc.setFont("NotoSansKR", "normal");
      warningItems.forEach((v) => writeParagraph(`- ${v}`, { indent: 4 }));
    }

    if (recommendations.length > 0) {
      y += 2;
      doc.setFont("NotoSansKR", "bold");
      writeParagraph("추천 사항", { fontSize: 11 });
      doc.setFont("NotoSansKR", "normal");
      recommendations.forEach((v) => writeParagraph(`- ${v}`, { indent: 4 }));
    }

    // ====== 2. 과제 의도 및 목적 ======
    y += 6;
    writeSectionTitle("2. 과제 의도 및 목적");
    writeParagraph(aggregated.research_intent?.policy_background ?? "데이터 없음");
    const targetIssues = aggregated.research_intent?.target_issues ?? [];
    if (targetIssues.length > 0) {
      y += 2;
      doc.setFont("NotoSansKR", "bold");
      writeParagraph("해결하려는 이슈", { fontSize: 11 });
      doc.setFont("NotoSansKR", "normal");
      targetIssues.forEach((v) => writeParagraph(`- ${v}`, { indent: 4 }));
    }

    // ====== 3. 평가지표 분석 ======
    y += 6;
    writeSectionTitle("3. 평가지표 분석");
    writeParagraph(aggregated.evaluation_weight_analysis?.summary ?? "데이터 없음");
    const highWeightItems = aggregated.evaluation_weight_analysis?.high_weight_items ?? [];
    if (highWeightItems.length > 0) {
      y += 2;
      doc.setFont("NotoSansKR", "bold");
      writeParagraph("고배점 항목 및 대응 전략", { fontSize: 11 });
      doc.setFont("NotoSansKR", "normal");

      highWeightItems.forEach((it) => {
        y += 2;
        doc.setFont("NotoSansKR", "bold");
        writeParagraph(`- (${it.points}점) ${it.item}`, { indent: 4 });
        doc.setFont("NotoSansKR", "normal");
        if (it.strategy) writeParagraph(it.strategy, { indent: 8 });
      });
    }

    // ====== 4. 제출 문서 리스트 ======
    y += 6;
    writeSectionTitle("4. 제출 문서 리스트");
    const deliverables = aggregated.deliverables ?? [];
    if (deliverables.length === 0) {
      writeParagraph("데이터 없음");
    } else {
      deliverables.forEach((v) => writeParagraph(`- ${v}`, { indent: 4 }));
    }

    // ====== 5. 필수 준수사항 ======
    y += 6;
    writeSectionTitle("5. 필수 준수사항");
    const mandatory = aggregated.mandatory_requirements ?? [];
    if (mandatory.length === 0) {
      writeParagraph("데이터 없음");
    } else {
      mandatory.forEach((v) => writeParagraph(`- ${v}`, { indent: 4 }));
    }

    doc.save(`공고문_분석_결과_${today}.pdf`);
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

        <ScrollSection>
          {aggregated?.eligibility && (
            <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <StatusBadge status={aggregated.eligibility.status}>{aggregated.eligibility.status}</StatusBadge>
              <Text>{aggregated.eligibility.summary}</Text>
            </div>
          )}

          {aggregated?.eligibility?.judgments && aggregated.eligibility.judgments.length > 0 ? (
            <RequirementList>
              {aggregated.eligibility.judgments.map((req) => (
                <RequirementItem key={req.id}>
                  <RequirementHeader>
                    <HeaderLeft>
                      <RequirementTitle>{req.category}</RequirementTitle>
                    </HeaderLeft>
                    <StatusBadge status={req.judgment}>{req.judgment}</StatusBadge>
                  </RequirementHeader>

                  <ExpandableText text={req.requirement_text} />

                  {(req.reason || req.quote_from_announcement || req.additional_action) && (
                    <ArrowWrapper>{/* 여기서 토글 넣고 싶으면 넣어 */}</ArrowWrapper>
                  )}

                  {(req.reason || req.quote_from_announcement || req.additional_action) && (
                    <>
                      {req.reason && <ExpandableText text={req.reason} />}

                      {req.quote_from_announcement && (
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
                            <div style={{ marginBottom: 8 }}>{req.quote_from_announcement}</div>
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
        </ScrollSection>

        <br />

        <div className="title" style={{ fontSize: 15 }}>
          과제 의도 및 목적
        </div>
        <Section>
          <Text>{aggregated?.research_intent?.policy_background ?? "데이터 없음"}</Text>
          {aggregated?.research_intent?.target_issues && aggregated.research_intent.target_issues.length > 0 && (
            <ul style={{ margin: "12px 0 0 0", paddingLeft: 18 }}>
              {aggregated.research_intent.target_issues.map((it, idx) => (
                <li key={idx} style={{ margin: "6px 0", lineHeight: 1.5 }}>
                  {it}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <br />

        <div className="title" style={{ fontSize: 15 }}>
          평가지표 분석
        </div>
        <Section>
          {aggregated?.evaluation_weight_analysis?.summary && (
            <Text style={{ marginBottom: 12 }}>{aggregated.evaluation_weight_analysis.summary}</Text>
          )}

          {aggregated?.evaluation_weight_analysis?.high_weight_items &&
          aggregated.evaluation_weight_analysis.high_weight_items.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {aggregated.evaluation_weight_analysis.high_weight_items.map((it, idx) => (
                <li key={idx} style={{ margin: "10px 0", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700 }}>{it.item}</div>
                  <div style={{ marginTop: 4, color: "#636e72" }}>
                    <Tag>{it.points}점</Tag> {it.strategy}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Text>데이터 없음</Text>
          )}
        </Section>

        <br />
        <div className="title" style={{ fontSize: 15 }}>
          제출 문서 리스트
        </div>
        <Section>
          {aggregated?.deliverables && aggregated.deliverables.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {aggregated.deliverables.map((c, idx) => (
                <li key={idx} style={{ margin: "8px 0", lineHeight: 1.5 }}>
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMessage>데이터 없음</EmptyMessage>
          )}
        </Section>

        <br />
        <div className="title" style={{ fontSize: 15 }}>
          필수 준수사항
        </div>
        <Section>
          {aggregated?.mandatory_requirements && aggregated.mandatory_requirements.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {aggregated.mandatory_requirements.map((c, idx) => (
                <li key={idx} style={{ margin: "8px 0", lineHeight: 1.5 }}>
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMessage>데이터 없음</EmptyMessage>
          )}
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
      {(isOverflowing || isExpanded) && (
        <MoreButton onClick={() => setIsExpanded((v) => !v)} style={{ flexShrink: 0 }}>
          [{isExpanded ? "접기" : "더보기"}]
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
  background: #f8f9fa;
  border-radius: 12px;
  padding: 28px;
  box-sizing: border-box;
  position: relative;
`;

const ScrollSection = styled(Section)`
  height: clamp(420px, 60vh, 760px);
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
      case "불가":
        return "#d63031";
      case "보류":
        return "#fdcb6e";
      default:
        return "#b2bec3";
    }
  }};
  ${(props) =>
    props.status === "보류" &&
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
