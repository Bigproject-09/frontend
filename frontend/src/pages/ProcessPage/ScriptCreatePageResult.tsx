import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";

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
                    <DownloadButton onClick={() => alert("PPT 다운로드 기능 준비 중")}>
                        PPT 초안 다운로드
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

const RightActionRow = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
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

  /* 스크롤바 스타일링 */
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

/* 스크립트 관련 스타일 */
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

/* Q&A 관련 스타일 */
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