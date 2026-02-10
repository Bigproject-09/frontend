import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";

// 타입 정의
interface Section {
  title: string;
}

interface Slide {
  section: string;
  slide_title: string;
  key_message: string;
  bullets: string[];
}

interface PPTResult {
  deck_title: string;
  total_slides: number;
  pptx_path: string;
  sections: string[];
  slides?: Slide[];
  db_saved?: boolean;
}

const AnnounceCreatePageResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const noticeId = location.state?.noticeId as number | undefined;
  const pptResult = location.state?.pptResult as PPTResult | undefined;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 결과가 없으면 이전 페이지로 이동
    if (!pptResult) {
      alert("PPT 생성 결과가 없습니다.");
      navigate("/process/announce", { state: { noticeId } });
    }
  }, [pptResult, navigate, noticeId]);

  const handleBack = (id: number) => {
    navigate("/process/announce", {
      state: { noticeId: id },
    });
  };

  const handleDownloadPPT = () => {
    if (!pptResult?.pptx_path) {
      alert("다운로드할 PPT 파일이 없습니다.");
      return;
    }

    // FastAPI 서버에서 파일 다운로드
    const downloadUrl = `http://localhost:8000/download/${encodeURIComponent(pptResult.pptx_path)}`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${pptResult.deck_title}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!pptResult) {
    return null;
  }

  return (
    <Container>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 30 }}>
          발표 자료 제작 결과
        </div>

        {/* PPT 정보 */}
        <InfoSection>
          <InfoRow>
            <InfoLabel>발표 제목:</InfoLabel>
            <InfoValue>{pptResult.deck_title}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>슬라이드 수:</InfoLabel>
            <InfoValue>{pptResult.total_slides}장</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>파일 경로:</InfoLabel>
            <InfoValue>{pptResult.pptx_path}</InfoValue>
          </InfoRow>
          {pptResult.db_saved !== undefined && (
            <InfoRow>
              <InfoLabel>DB 저장:</InfoLabel>
              <InfoValue>
                <StatusBadge success={pptResult.db_saved}>
                  {pptResult.db_saved ? "✓ 성공" : "✗ 실패"}
                </StatusBadge>
              </InfoValue>
            </InfoRow>
          )}
        </InfoSection>

        {/* 섹션 구성 */}
        <SectionTitle>섹션 구성</SectionTitle>
        <Section>
          {pptResult.sections && pptResult.sections.length > 0 ? (
            <SectionList>
              {pptResult.sections.map((section, idx) => (
                <SectionItem key={idx}>
                  <SectionNumber>{idx + 1}</SectionNumber>
                  <SectionName>{section}</SectionName>
                </SectionItem>
              ))}
            </SectionList>
          ) : (
            <EmptyMessage>섹션 정보가 없습니다.</EmptyMessage>
          )}
        </Section>

        {/* 슬라이드 미리보기 */}
        {pptResult.slides && pptResult.slides.length > 0 && (
          <>
            <SectionTitle>슬라이드 미리보기 (상위 10개)</SectionTitle>
            <Section>
              <SlideList>
                {pptResult.slides.slice(0, 10).map((slide, idx) => (
                  <SlideItem key={idx}>
                    <SlideHeader>
                      <SlideNumber>슬라이드 {idx + 1}</SlideNumber>
                      <SectionBadge>{slide.section}</SectionBadge>
                    </SlideHeader>
                    <SlideTitle>{slide.slide_title}</SlideTitle>
                    {slide.key_message && (
                      <KeyMessage>💡 {slide.key_message}</KeyMessage>
                    )}
                    {slide.bullets && slide.bullets.length > 0 && (
                      <BulletList>
                        {slide.bullets.map((bullet, bidx) => (
                          <BulletItem key={bidx}>• {bullet}</BulletItem>
                        ))}
                      </BulletList>
                    )}
                  </SlideItem>
                ))}
              </SlideList>
            </Section>
          </>
        )}

        {/* 액션 버튼 */}
        <RightActionRow>
          <button
            type="button"
            className="button_center"
            style={{ width: 120 }}
            onClick={() => {
              if (!noticeId) return;
              handleBack(noticeId);
            }}
          >
            다시 생성
          </button>
        </RightActionRow>

        <DownloadWrapper>
          <DownloadButton onClick={handleDownloadPPT}>
            📥 PPT 다운로드
          </DownloadButton>
        </DownloadWrapper>
      </Card>
    </Container>
  );
};

export default AnnounceCreatePageResult;

/* ===== Styled Components ===== */

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

const InfoSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  min-width: 120px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #212529;
  flex: 1;
`;

const StatusBadge = styled.span<{ success: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  background: ${(props) => (props.success ? "#d4edda" : "#f8d7da")};
  color: ${(props) => (props.success ? "#155724" : "#721c24")};
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 12px;
`;

const Section = styled.div`
  width: 100%;
  max-height: 400px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-sizing: border-box;
  margin-bottom: 30px;
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

const SectionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const SectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

const SectionNumber = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007bff;
  color: white;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
`;

const SectionName = styled.div`
  font-size: 14px;
  color: #212529;
  font-weight: 500;
`;

const SlideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SlideItem = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #dee2e6;
`;

const SlideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const SlideNumber = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
`;

const SectionBadge = styled.div`
  padding: 4px 10px;
  background: #e7f3ff;
  color: #0056b3;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const SlideTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
`;

const KeyMessage = styled.div`
  font-size: 13px;
  color: #495057;
  background: #fff3cd;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
`;

const BulletList = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const BulletItem = styled.li`
  font-size: 13px;
  color: #495057;
  line-height: 1.6;
  margin-bottom: 4px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #636e72;
  padding: 40px;
`;

const RightActionRow = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
`;

const DownloadWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;
`;

const DownloadButton = styled.button`
  padding: 14px 32px;
  background-color: #00b894;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #009c7a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;