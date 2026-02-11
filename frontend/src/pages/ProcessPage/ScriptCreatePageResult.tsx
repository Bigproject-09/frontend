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

    // 한글 폰트 등록
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

    const writeParagraph = (text: string, opts?: { indent?: number; fontSize?: number; bold?: boolean }) => {
      const indent = opts?.indent ?? 0;
      const fontSize = opts?.fontSize ?? 10;
      const bold = opts?.bold ?? false;

      doc.setFont("NotoSansKR", bold ? "bold" : "normal");
      doc.setFontSize(fontSize);

      const safeText = (text ?? "").toString();
      const lines = doc.splitTextToSize(safeText, contentWidth - indent);

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

    // ===== Header =====
    doc.setFont("NotoSansKR", "bold");
    doc.setFontSize(18);
    doc.text("발표 스크립트 생성 결과", margin, y);
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

    // ===== 1. 발표 스크립트 =====
    writeSectionTitle("1. 발표 스크립트");

    const slides = Array.isArray(scriptData.slides) ? scriptData.slides : [];
    if (slides.length === 0) {
      writeParagraph("스크립트 데이터가 없습니다.");
    } else {
      slides.forEach((slide: any, idx: number) => {
        addPageIfNeeded(18);

        const pageNo = slide?.page ?? idx + 1;
        const title = slide?.title ?? "";

        writeParagraph(`슬라이드 ${pageNo} ${title ? `- ${title}` : ""}`, { fontSize: 12, bold: true });
        y += 1;

        const scriptText = slide?.script ?? "";
        if (scriptText) {
          writeParagraph(scriptText, { indent: 2, fontSize: 10 });
        } else {
          writeParagraph("(스크립트 없음)", { indent: 2, fontSize: 10 });
        }

        y += 4;

        if (idx < slides.length - 1) {
          addPageIfNeeded(10);
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;
        }
      });
    }

    // ===== 2. 예상 질문 및 답변 =====
    y += 4;
    writeSectionTitle("2. 예상 질문 및 답변");

    const qna = Array.isArray(scriptData.qna) ? scriptData.qna : [];
    if (qna.length === 0) {
      writeParagraph("예상 질문 데이터가 없습니다.");
    } else {
      qna.forEach((item: any, idx: number) => {
        addPageIfNeeded(18);

        const q = item?.question ?? "";
        const a = item?.answer ?? "";
        const tips = item?.tips ?? "";

        writeParagraph(`Q${idx + 1}. ${q}`, { fontSize: 11, bold: true });
        writeParagraph(`A. ${a}`, { indent: 2, fontSize: 10 });

        if (tips) {
          writeParagraph(`Tip: ${tips}`, { indent: 2, fontSize: 10 });
        }

        y += 6;
      });
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
