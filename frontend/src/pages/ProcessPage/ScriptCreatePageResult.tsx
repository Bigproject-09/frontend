import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";

import { jsPDF } from "jspdf";
import { NotoSansKR } from "../../utils/NotoSansKR";

const ScriptCreatePageResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const noticeId = location.state?.noticeId as number | undefined;
  const scriptData = location.state?.scriptData as any; // API에서 받은 데이터

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scriptData) {
      alert("스크립트 데이터가 없습니다.");
      navigate("/process");
    }
  }, [scriptData, navigate]);

  const handleBack = (id: number) => {
    navigate("/process/script", {
      state: { noticeId: id },
    });
  };

  const handleClose = (id: number) => {
    navigate("/process", {
      state: { noticeId: id },
    });
  };

  const handleDownloadPDF = () => {
    if (!scriptData) {
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
    doc.text("발표 스크립트 생성 결과", margin, y);

    y += 8;
    doc.setFont("NotoSansKR", "normal");
    doc.setFontSize(10);
    doc.setTextColor(SUBTEXT_COLOR[0], SUBTEXT_COLOR[1], SUBTEXT_COLOR[2]);
    doc.text(`작성일: ${today}  |  Notice ID: ${noticeId ?? "-"}`, margin, y);

    y = 50; // Reset Y after header

    // ====== 1. 발표 스크립트 ======
    writeSectionTitle("1. 발표 스크립트");

    const slides = Array.isArray(scriptData.slides) ? scriptData.slides : [];
    if (slides.length === 0) {
      writeParagraph("스크립트 데이터가 없습니다.");
    } else {
      slides.forEach((slide: any, idx: number) => {
        addPageIfNeeded(30);

        // Slide Box
        const pageNo = slide?.page ?? idx + 1;
        const title = slide?.title ?? "";

        // Slide Header
        doc.setFont("NotoSansKR", "bold");
        doc.setFontSize(12);
        doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.text(`Slide ${pageNo}`, margin, y);

        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        if (title) {
          doc.text(` : ${title}`, margin + 20, y);
        }
        y += 8;

        // Content
        const scriptText = slide?.script ?? "(스크립트 없음)";
        doc.setFont("NotoSansKR", "normal");

        // Indented text
        writeParagraph(scriptText, { indent: 4, fontSize: 10 });

        y += 6;

        // Dotted Separator
        if (idx < slides.length - 1) {
          doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(margin + 4, y, pageWidth - margin - 4, y);
          doc.setLineDashPattern([], 0); // Reset
          y += 8;
        }
      });
    }

    // ====== 2. 예상 질문 및 답변 ======
    writeSectionTitle("2. 예상 질문 및 답변");

    const qna = Array.isArray(scriptData.qna) ? scriptData.qna : [];
    if (qna.length === 0) {
      writeParagraph("예상 질문 데이터가 없습니다.");
    } else {
      qna.forEach((item: any, idx: number) => {
        addPageIfNeeded(30);

        const q = item?.question ?? "";
        const a = item?.answer ?? "";
        const tips = item?.tips ?? "";

        // Question
        doc.setFont("NotoSansKR", "bold");
        doc.setFontSize(11);
        doc.setTextColor(46, 111, 219); // Blue for Question

        const qLines = doc.splitTextToSize(`Q${idx + 1}. ${q}`, contentWidth);
        qLines.forEach((line: string) => {
          addPageIfNeeded(6);
          doc.text(line, margin, y);
          y += 6;
        });

        // Answer
        doc.setFont("NotoSansKR", "normal");
        doc.setFontSize(10);
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);

        // A. prefix
        const aPrefix = "A. ";
        const aLines = doc.splitTextToSize(a, contentWidth - 10); // indent for answer body

        if (aLines.length > 0) {
          addPageIfNeeded(6);
          doc.text(aPrefix + aLines[0], margin + 2, y);
          y += 5;
          for (let i = 1; i < aLines.length; i++) {
            addPageIfNeeded(6);
            doc.text(aLines[i], margin + 7, y); // align with text after "A. "
            y += 5;
          }
        }

        // Tip
        if (tips) {
          y += 2;
          // Estimate height? roughly
          const tipLines = doc.splitTextToSize(`Tip: ${tips}`, contentWidth - 14);
          const tipH = tipLines.length * 5 + 6;

          addPageIfNeeded(tipH);
          doc.setFillColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
          doc.rect(margin + 2, y, contentWidth - 4, tipH, "F");

          doc.setTextColor(SUBTEXT_COLOR[0], SUBTEXT_COLOR[1], SUBTEXT_COLOR[2]);
          doc.setFontSize(9);

          let tipY = y + 5;
          tipLines.forEach((l: string) => {
            doc.text(l, margin + 5, tipY);
            tipY += 5;
          });
          y += tipH + 4;
        } else {
          y += 6;
        }

        // Separator
        if (idx < qna.length - 1) {
          doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(margin, y, pageWidth - margin, y);
          doc.setLineDashPattern([], 0);
          y += 8;
        }
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

    const filename = `스크립트_결과_${today}.pdf`;
    doc.save(filename);
  };

  if (!scriptData) {
    return <Container>로딩 중...</Container>;
  }

  return (
    <Container>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 50 }}>
          스크립트 생성 결과
        </div>

        {/* 스크립트 섹션 */}
        <div className="title" style={{ fontSize: 15, marginBottom: 10 }}>
          발표 스크립트
        </div>
        <Section>
          {scriptData.slides && scriptData.slides.length > 0 ? (
            <ScriptList>
              {scriptData.slides.map((slide: any, index: number) => (
                <ScriptItem key={index}>
                  <ScriptHeader>
                    <SlideNumber>슬라이드 {slide.page}</SlideNumber>
                    <SlideTitle>{slide.title}</SlideTitle>
                  </ScriptHeader>
                  <ScriptContent>{slide.script}</ScriptContent>
                </ScriptItem>
              ))}
            </ScriptList>
          ) : (
            <EmptyMessage>스크립트 데이터가 없습니다.</EmptyMessage>
          )}
        </Section>
        <br />

        {/* 예상 질문 섹션 */}
        <div className="title" style={{ fontSize: 15, marginBottom: 10 }}>
          예상 질문 및 답변
        </div>
        <Section>
          {scriptData.qna && scriptData.qna.length > 0 ? (
            <QnaList>
              {scriptData.qna.map((item: any, index: number) => (
                <QnaItem key={index}>
                  <Question>Q{index + 1}. {item.question}</Question>
                  <Answer>A. {item.answer}</Answer>
                  {item.tips && <Tips>💡 Tip: {item.tips}</Tips>}
                </QnaItem>
              ))}
            </QnaList>
          ) : (
            <EmptyMessage>예상 질문 데이터가 없습니다.</EmptyMessage>
          )}
        </Section>

        <ModalActions>
          <MiniBtn
            type="button"
            onClick={() => {
              if (!noticeId) return;
              handleBack(noticeId);
            }}
          >
            재생성
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
          <DownloadButton type="button" onClick={handleDownloadPDF} disabled={loading}>
            스크립트 다운로드 (PDF)
          </DownloadButton>
        </DownloadWrapper>
      </Card>
    </Container>
  );
};

export default ScriptCreatePageResult;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #d9d9d9;
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
`;

const Section = styled.div`
  width: 100%;
  max-height: 400px;
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

const DownloadWrapper = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
`;

const DownloadButton = styled.button<{ disabled?: boolean }>`
  padding: 14px 28px;
  background-color: ${(p) => (p.disabled ? "#9aa0a6" : "#00b894")};
  color: white;
  border-radius: 8px;
  font-size: 16px;
  text-decoration: none;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  border: none;

  &:hover {
    background-color: ${(p) => (p.disabled ? "#9aa0a6" : "#009c7a")};
  }
`;

const ScriptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ScriptItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
`;

const ScriptHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const SlideNumber = styled.span`
  background: #2e6fdb;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
`;

const SlideTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #2d3436;
`;

const ScriptContent = styled.p`
  font-size: 14px;
  color: #2d3436;
  line-height: 1.8;
  margin: 0;
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

const QnaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const QnaItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
`;

const Question = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #2e6fdb;
  margin-bottom: 10px;
`;

const Answer = styled.div`
  font-size: 14px;
  color: #2d3436;
  line-height: 1.7;
  margin-bottom: 8px;
`;

const Tips = styled.div`
  font-size: 13px;
  color: #636e72;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #ffc107;
`;
