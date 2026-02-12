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

/** 섹션 타이틀 + 섹션 카드 공통 블록 */
const SectionBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const id = title.replace(/\s+/g, "-");
  return (
    <SectionWrap id={id}>
      <SectionTitleRow>
        <SectionTitle>{title}</SectionTitle>
      </SectionTitleRow>
      <SectionCard>{children}</SectionCard>
    </SectionWrap>
  );
};

const NoticeNewPageResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const noticeId = location.state?.noticeId as number | undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aggregated, setAggregated] = useState<NoticeAnalysisAggregatedResponse | null>(null);

  const handleClose = (id: number) => {
    navigate("/process", {
      state: { noticeId: id },
    });
  };

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

    // --- Colors ---
    const PRIMARY_COLOR = [0, 184, 148]; // #00b894
    const TEXT_COLOR = [45, 52, 54]; // #2d3436
    const SUBTEXT_COLOR = [99, 110, 114]; // #636e72
    const BORDER_COLOR = [223, 230, 233]; // #dfe6e9
    const BG_COLOR = [241, 243, 245]; // #f1f3f5

    const addPageIfNeeded = (minSpace: number) => {
      if (y + minSpace <= pageHeight - margin) return;
      doc.addPage();
      y = 20;
    };

    const writeParagraph = (text: string, opts?: { indent?: number; fontSize?: number; color?: number[] }) => {
      const indent = opts?.indent ?? 0;
      const fontSize = opts?.fontSize ?? 10;
      const color = opts?.color ?? TEXT_COLOR;

      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(text ?? "", contentWidth - indent);
      lines.forEach((line: string) => {
        addPageIfNeeded(6);
        doc.text(line, margin + indent, y);
        y += 5;
      });
    };

    const writeSectionTitle = (title: string) => {
      addPageIfNeeded(20);
      y += 5;

      // Left accents
      doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.rect(margin, y - 4, 5, 8, "F");

      doc.setFont("NotoSansKR", "bold");
      doc.setFontSize(14);
      doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
      doc.text(title, margin + 8, y + 2);

      y += 10;

      // Divider line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setFont("NotoSansKR", "normal");
    };

    // ====== Header ======
    // Header Background
    doc.setFillColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
    doc.rect(0, 0, pageWidth, 40, "F");

    y = 25;
    doc.setFont("NotoSansKR", "bold");
    doc.setFontSize(22);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text("공고문 분석 결과 리포트", margin, y);

    y += 8;
    doc.setFont("NotoSansKR", "normal");
    doc.setFontSize(10);
    doc.setTextColor(SUBTEXT_COLOR[0], SUBTEXT_COLOR[1], SUBTEXT_COLOR[2]);
    doc.text(`작성일: ${today}  |  Notice ID: ${noticeId ?? "-"}`, margin, y);

    y = 50; // Reset Y after header

    // ====== 1. 자격요건 체크리스트 ======
    writeSectionTitle("1. 자격요건 체크리스트");

    // Summary Box
    doc.setFont("NotoSansKR", "normal");
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(aggregated.eligibility?.summary ?? "데이터 없음", contentWidth - 10);
    const textHeight = summaryLines.length * 5; // Approx 5mm line height
    const boxHeight = Math.max(24, 16 + textHeight + 6); // 16 top padding + text + 6 bottom padding

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, "S"); // Box outline

    doc.setFont("NotoSansKR", "bold");
    doc.setFontSize(12);
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text("종합 판정 결과:", margin + 5, y + 8);

    const status = aggregated.eligibility?.status ?? "보류";
    let statusColor = [253, 203, 110]; // Orange (default)
    if (status === "가능") statusColor = [0, 184, 148]; // Green
    if (status === "불가") statusColor = [214, 48, 49]; // Red

    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(status, margin + 40, y + 8);

    doc.setFont("NotoSansKR", "normal");
    doc.setFontSize(10);
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text(summaryLines, margin + 5, y + 16);

    y += boxHeight + 8;

    const judgments = aggregated.eligibility?.judgments ?? [];
    if (judgments.length === 0) {
      writeParagraph("판정 항목이 없습니다.");
    } else {
      judgments.forEach((req, idx) => {
        // Calculate height estimation for box
        // This is tricky in jsPDF, so we'll just check page break generously
        addPageIfNeeded(40);

        // Item Status Badge
        let badgeColor = [178, 190, 195]; // Grey
        if (req.judgment === "가능") badgeColor = [0, 184, 148];
        if (req.judgment === "불가") badgeColor = [214, 48, 49];
        if (req.judgment === "보류") badgeColor = [253, 203, 110];

        doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        doc.roundedRect(margin, y, 16, 6, 2, 2, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("NotoSansKR", "bold");
        doc.text(req.judgment, margin + 8, y + 4.2, { align: "center" });

        // Category Title
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.setFontSize(11);
        doc.text(req.category, margin + 20, y + 4.5);

        y += 10;

        // Content
        doc.setFont("NotoSansKR", "normal");
        writeParagraph(`요구사항: ${req.requirement_text}`, { indent: 4 });

        if (req.reason) {
          // Gray box for reason
          doc.setTextColor(SUBTEXT_COLOR[0], SUBTEXT_COLOR[1], SUBTEXT_COLOR[2]);
          writeParagraph(`→ ${req.reason}`, { indent: 8, fontSize: 9 });
        }
        if (req.quote_from_announcement) {
          doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
          writeParagraph(`[관련 근거]: ${req.quote_from_announcement}`, { indent: 8, fontSize: 9 });
        }
        if (req.additional_action) {
          doc.setTextColor(211, 84, 0); // Orange-Red
          writeParagraph(`※ 추가 조치: ${req.additional_action}`, { indent: 8, fontSize: 9 });
        }

        y += 6;
        // Dotted Separator
        if (idx < judgments.length - 1) {
          doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(margin + 4, y, pageWidth - margin - 4, y);
          doc.setLineDashPattern([], 0); // Reset
          y += 6;
        }
      });
    }

    // Additional Info Sections
    const additionalInfo = [
      { title: "확인 필요한 정보", items: aggregated.eligibility?.missing_info, color: [230, 126, 34] },
      { title: "주의 사항", items: aggregated.eligibility?.warning_items, color: [192, 57, 43] },
      { title: "추천 사항", items: aggregated.eligibility?.recommendations, color: [41, 128, 185] },
    ];

    additionalInfo.forEach((info) => {
      if (info.items && info.items.length > 0) {
        addPageIfNeeded(20);
        y += 4;
        doc.setFont("NotoSansKR", "bold");
        doc.setTextColor(info.color[0], info.color[1], info.color[2]);
        doc.setFontSize(11);
        doc.text(`■ ${info.title}`, margin, y);
        y += 6;
        doc.setFont("NotoSansKR", "normal");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        info.items.forEach((v) => writeParagraph(`- ${v}`, { indent: 6 }));
      }
    });

    // ====== 2. 과제 의도 및 목적 ======
    writeSectionTitle("2. 과제 의도 및 목적");

    // Background text
    // doc.setFillColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
    // doc.rect(margin, y, contentWidth, 15, "F"); // Simple background for context
    // doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text("정책 배경 및 의도", margin + 4, y + 6);
    y += 16;

    writeParagraph(aggregated.research_intent?.policy_background ?? "데이터 없음", { indent: 4 });
    y += 4;

    const targetIssues = aggregated.research_intent?.target_issues ?? [];
    if (targetIssues.length > 0) {
      addPageIfNeeded(20);
      y += 4;
      doc.setFont("NotoSansKR", "bold");
      doc.text("해결하려는 주요 이슈", margin, y);
      y += 6;
      doc.setFont("NotoSansKR", "normal");
      targetIssues.forEach((v) => writeParagraph(`• ${v}`, { indent: 4 }));
    }

    // ====== 3. 평가지표 분석 ======
    writeSectionTitle("3. 평가지표 분석");
    writeParagraph(aggregated.evaluation_weight_analysis?.summary ?? "데이터 없음");

    const highWeightItems = aggregated.evaluation_weight_analysis?.high_weight_items ?? [];
    if (highWeightItems.length > 0) {
      y += 6;
      doc.setFont("NotoSansKR", "bold");
      doc.setFontSize(11);
      doc.text("고배점 항목 및 전략", margin, y);
      y += 6;

      highWeightItems.forEach((it) => {
        addPageIfNeeded(25);
        // Box for each strategy
        doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "S");

        doc.setFont("NotoSansKR", "bold");
        doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.text(`[${it.points}점]`, margin + 4, y + 6);

        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.text(it.item, margin + 20, y + 6);

        doc.setFont("NotoSansKR", "normal");
        doc.setFontSize(9);
        doc.setTextColor(SUBTEXT_COLOR[0], SUBTEXT_COLOR[1], SUBTEXT_COLOR[2]);
        const strategyLines = doc.splitTextToSize(`전략: ${it.strategy}`, contentWidth - 10);
        doc.text(strategyLines, margin + 4, y + 12);

        y += 22;
      });
    }

    // ====== 4. 제출 문서 리스트 ======
    writeSectionTitle("4. 필수 제출 문서");
    const deliverables = aggregated.deliverables ?? [];
    if (deliverables.length === 0) {
      writeParagraph("데이터 없음");
    } else {
      deliverables.forEach((v) => {
        // Checkbox style
        doc.setDrawColor(SUBTEXT_COLOR[0], SUBTEXT_COLOR[1], SUBTEXT_COLOR[2]);
        doc.rect(margin + 2, y - 2.5, 3, 3);
        writeParagraph(v, { indent: 8 });
      });
    }

    // ====== 5. 필수 준수사항 ======
    writeSectionTitle("5. 필수 준수사항");
    const mandatory = aggregated.mandatory_requirements ?? [];
    if (mandatory.length === 0) {
      writeParagraph("데이터 없음");
    } else {
      mandatory.forEach((v) => {
        doc.setTextColor(211, 84, 0); // Warning color
        writeParagraph(`! ${v}`, { indent: 4 });
      });
    }

    // Footer Page Numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`${i} / ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }

    doc.save(`공고문_분석_리포트_${today}.pdf`);
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

  return (
    <Container>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 18 }}>
          공고문 분석
        </div>

        {/* 1. 자격 요건 체크리스트 */}
        <SectionBlock title="자격 요건 체크리스트">
          <ScrollBox>
            {aggregated?.eligibility && (
              <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
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

                    {(req.reason || req.quote_from_announcement || req.additional_action) && <ArrowWrapper />}

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
          </ScrollBox>
        </SectionBlock>

        {/* 2. 과제 의도 및 목적 */}
        <SectionBlock title="과제 의도 및 목적">
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
        </SectionBlock>

        {/* 3. 평가지표 분석 */}
        <SectionBlock title="평가지표 분석">
          {aggregated?.evaluation_weight_analysis?.summary ? (
            <Text style={{ marginBottom: 12 }}>{aggregated.evaluation_weight_analysis.summary}</Text>
          ) : (
            <Text>데이터 없음</Text>
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
        </SectionBlock>

        {/* 4. 제출 문서 리스트 */}
        <SectionBlock title="필수 제출 문서 리스트">
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
        </SectionBlock>

        {/* 5. 필수 준수사항 */}
        <SectionBlock title="필수 준수사항">
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
        </SectionBlock>

        <ModalActions>
          <MiniBtn type="button" onClick={() => noticeId && handleBack(noticeId)}>
            재추출
          </MiniBtn>
          <MiniBtn
            type="button"
            onClick={() => {
              if (!noticeId) return;
              handleClose(noticeId);
            }}
          >
            닫기
          </MiniBtn>
        </ModalActions>

        <DownloadWrapper>
          <DownloadButton type="button" onClick={handleDownloadPDF}>
            분석 리포트 다운로드 (PDF)
          </DownloadButton>
        </DownloadWrapper>
      </Card>
    </Container>
  );
};

// ====== ExpandableText ======
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

/* ================= styled-components ================= */

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

const SectionWrap = styled.section`
  margin-top: 28px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: #111827;
  padding-left: 12px;
  border-left: 6px solid #00b894;
`;

const SectionCard = styled.div`
  width: 100%;
  background: #f8f9fa;
  border-radius: 14px;
  padding: 28px;
  box-sizing: border-box;
  position: relative;
  border: 1px solid #e5e7eb;
`;

const ScrollBox = styled.div`
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

const DownloadWrapper = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
`;

const DownloadButton = styled.button`
  padding: 14px 28px;
  background-color: #00b894;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  border: none;

  &:hover {
    background-color: #009c7a;
  }
`;
