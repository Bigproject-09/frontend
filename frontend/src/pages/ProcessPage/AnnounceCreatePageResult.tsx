// import React, {useEffect, useState} from "react";
// import styled from "styled-components";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../../styles/Global.css";
// import jsPDF from "jspdf";
// import { NotoSansKR } from "../../utils/NotoSansKR";

// // 타입 정의
// interface Requirement {
// id: number;
// title: string;
// requirement: string;
// confirmation_needed: string;
// }

// interface AnalysisData {
// requirements: Requirement[];
// purpose?: string;
// evaluationItems?: string;
// }

// // 더미 데이터
// const DUMMY_DATA: AnalysisData = {
//     requirements: [
//         {
//             id: 1,
//             title: "연구개발기관 자격",
//             requirement: "국가연구개발혁신법(이하 혁신법) 제2조제3호 및 같은 법 시행령 제2조제1항과 해양수산과학기술 육성법(이하 육성법) 제8조제1항 및 같은 법 시행령 제6조에 해당하는 연구개발기관",
//             confirmation_needed: "해당 법령에 명시된 세부 유형(예: 상법상 회사, 중소기업, 기업부설연구소 등) 중 귀하의 기관이 어느 유형에 해당하는지 확인하시기 바랍니다."
//         },
//         {
//             id: 2,
//             title: "컨소시엄 참여 필수",
//             requirement: "(해양수산부) 극한지 스마트 광역탐사를 위한 로봇-ICT 융합기술 개발 ... 컨소시엄 단위로만 참여 가능 및 각 부처별 과제(2개)는 과제간 연계·협력의 중요성을 고려하여 컨소시엄 형태로 선정·관리",
//             confirmation_needed: "본 과제는 컨소시엄 단위로만 참여 가능하므로, 반드시 컨소시엄을 구성하여 신청해야 합니다."
//         }
//     ],
// };

// const AnnounceCreatePageResult: React.FC = () => {
//     const navigate = useNavigate();

//     const location = useLocation();
//     const noticeId = location.state?.noticeId as number | undefined;

//     const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
//     const [loading, setLoading] = useState(true);

//     // 체크박스 상태 추가
//     const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

//     useEffect(() => {
//         // 더미 데이터만 사용
//         setTimeout(() => {
//             setAnalysisData(DUMMY_DATA);
//             setLoading(false);
//         }, 500);
//     }, []);

//     const handleBack = (id:number) => {
//         navigate("/process/announce",{
//             state: {noticeId: id},
//         });
//     };

//     //     // 체크박스 핸들러
//     // const handleCheckboxChange = (id: number) => {
//     //     setCheckedItems(prev => {
//     //         const newSet = new Set(prev);
//     //         if (newSet.has(id)) {
//     //             newSet.delete(id);
//     //         } else {
//     //             newSet.add(id);
//     //         }
//     //         return newSet;
//     //     });
//     // };

//     // PDF 다운로드 함수
//     const handleDownloadPDF = () => {
//         if (!analysisData?.requirements || analysisData.requirements.length === 0) {
//             alert("다운로드할 데이터가 없습니다.");
//             return;
//         }

//         const doc = new jsPDF({
//             orientation: 'portrait',
//             unit: 'mm',
//             format: 'a4'
//         });

//         // 한글 폰트 설정을 위한 기본 설정
//         //doc.setFont("helvetica");
//         doc.addFileToVFS("NotoSansKR-Regular.ttf", NotoSansKR);
//         doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
//         doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "bold");
        
//         let yPosition = 20;
//         const pageWidth = doc.internal.pageSize.getWidth();
//         const margin = 20;
//         const contentWidth = pageWidth - (margin * 2);

//         // 제목
//         doc.setFont("NotoSansKR", "bold");
//         doc.setFontSize(18);
//         doc.text("자격 요건 체크리스트", margin, yPosition);
//         yPosition += 15;

//         // 날짜
//         doc.setFont("NotoSansKR", "normal");
//         doc.setFontSize(10);
//         const today = new Date().toLocaleDateString('ko-KR');
//         doc.text(`작성일: ${today}`, margin, yPosition);
//         yPosition += 10;

//         // 구분선
//         doc.setLineWidth(0.5);
//         doc.line(margin, yPosition, pageWidth - margin, yPosition);
//         yPosition += 10;

//         // 각 요건 항목
//         analysisData.requirements.forEach((req, index) => {
//             // 페이지 넘김 체크
//             if (yPosition > 250) {
//                 doc.addPage();
//                 yPosition = 20;
//             }

//             // 체크박스 상태 표시
//             const checkStatus = checkedItems.has(req.id) ? "[✓]" : "[ ]";
            
//             // 제목
//             doc.setFont("NotoSansKR", "bold");
//             doc.setFontSize(12);
//             doc.text(`${checkStatus} ${index + 1}. ${req.title}`, margin, yPosition);
//             yPosition += 8;

//             // 요구사항
//             doc.setFont("NotoSansKR", "normal");
//             doc.setFontSize(10);
//             doc.text("요구사항:", margin + 5, yPosition);
//             yPosition += 6;
            
//             const reqLines = doc.splitTextToSize(req.requirement, contentWidth - 10);
//             reqLines.forEach((line: string) => {
//                 if (yPosition > 280) {
//                     doc.addPage();
//                     yPosition = 20;
//                 }
//                 doc.text(line, margin + 10, yPosition);
//                 yPosition += 5;
//             });
//             yPosition += 3;

//             // 확인 필요
//             doc.text("확인 필요:", margin + 5, yPosition);
//             yPosition += 6;
            
//             const confirmLines = doc.splitTextToSize(req.confirmation_needed, contentWidth - 10);
//             confirmLines.forEach((line: string) => {
//                 if (yPosition > 280) {
//                     doc.addPage();
//                     yPosition = 20;
//                 }
//                 doc.text(line, margin + 10, yPosition);
//                 yPosition += 5;
//             });
//             yPosition += 8;

//             // 구분선
//             if (index < analysisData.requirements.length - 1) {
//                 doc.setDrawColor(200, 200, 200);
//                 doc.line(margin, yPosition, pageWidth - margin, yPosition);
//                 yPosition += 8;
//             }
//         });

//         // PDF 저장
//         doc.save(`자격요건_체크리스트_${today}.pdf`);
//     };

//     return (
//         <Container>
//             <Card>
//                 <div className="title" style={{ marginLeft: 0, marginBottom: 50 }}>
//                     발표 자료 제작
//                 </div>

//                 {/* <Row> */}

//                 {/* <ChecklistHeader>
//                     <div className="title" style = {{fontSize: 15}}>
//                         자격 요건 체크리스트
//                     </div>
//                     <PDFDownloadButton onClick={handleDownloadPDF}>
//                     </PDFDownloadButton>
//                 </ChecklistHeader>

//                     <Section>
//                         {analysisData?.requirements && analysisData.requirements.length > 0 ? (
//                         <RequirementList>
//                             {analysisData.requirements.map((req) => (
//                                 <RequirementItem key={req.id}>
//                                     <RequirementHeader>
//                                         <HeaderLeft>
//                                             <Checkbox
//                                                 type="checkbox"
//                                                 checked={checkedItems.has(req.id)}
//                                                 onChange={() => handleCheckboxChange(req.id)}
//                                             />
//                                             <RequirementTitle>{req.title}</RequirementTitle>
//                                         </HeaderLeft>
//                                     </RequirementHeader>
                                    
//                                     <RequirementContent>
//                                         <ConfirmationBox>
//                                             <Label>요구사항:</Label>
//                                             <Text>{req.requirement}</Text>
//                                         </ConfirmationBox>
//                                     </RequirementContent>
//                                         <Label>확인 필요:</Label>
//                                         <Text>{req.confirmation_needed}</Text>
//                                 </RequirementItem>
//                             ))}
//                         </RequirementList>
//                     ) : (
//                         <EmptyMessage>자격 요건 데이터가 없습니다.</EmptyMessage>
//                     )}
//                     </Section>
//                     <br /> */}

//                     <div className="title" style = {{fontSize: 15}}>
//                         스토리 라인 구성
//                     </div>
//                     <Section>
//                         스토리 라인
//                     </Section>
//                     <br />

//                     <div className="title" style = {{fontSize: 15}}>
//                         키워드 추출
//                     </div>
//                     <Section>
//                         좌르륵
//                     </Section>

//                     <div className="title" style = {{fontSize: 15}}>
//                         구조도/그림 생성
//                     </div>
//                     <Section>
//                         쨘~
//                     </Section>

//                     <RightActionRow>
//                             <button
//                                 type="button"
//                                 className="button_center"
//                                 style={{ width: 120 }}
//                                 onClick={() => {
//                                     if(!noticeId)
//                                         return;
//                                     handleBack(noticeId);
//                                 }}>
//                                 재추출
//                             </button>
//                     </RightActionRow>

                    
//                 <DownloadWrapper>
//                     <DownloadButton>
//                         PPT 초안 다운로드
//                     </DownloadButton>
//                 </DownloadWrapper>
//             </Card>
//         </Container>
//     );
// };

// export default AnnounceCreatePageResult;

// const Container = styled.div`
//   width: 100%;
//   min-height: 100vh;
//   background: #d9d9d9;
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

// `;

// const CardActions = styled.div`
//   margin-top: 32px;
//   display: flex;
//   flex-direction: column;
//   gap: 20px;
// `;

// const RightActionRow = styled.div`
//     margin-top: 32px;
//     display: flex;
//     justify-content: flex-end;
// `;

// const Label = styled.div`
//   font-size: 13px;
//   font-weight: 600;
//   color: #636e72;
//   margin-bottom: 6px;
// `;

// const Text = styled.div`
//   font-size: 14px;
//   color: #2d3436;
//   line-height: 1.6;
// `;

// const Section = styled.div`
//     width: 100%;
//     height: 300px;  /* min-height 대신 height 사용 */
//     background: #f8f9fa;
//     border-radius: 12px;
//     padding: 28px;
//     box-sizing: border-box;
//     position: relative;
//     overflow-y: auto;  /* 세로 스크롤 활성화 */

//     /* 스크롤바 스타일링 (선택사항) */
//     &::-webkit-scrollbar {
//     width: 8px;
//     }

//     &::-webkit-scrollbar-track {
//     background: #f1f1f1;
//     border-radius: 10px;
//     }

//     &::-webkit-scrollbar-thumb {
//     background: #888;
//     border-radius: 10px;
//     }

//     &::-webkit-scrollbar-thumb:hover {
//     background: #555;
//     }
// `;

// const EmptyMessage = styled.div`
//   text-align: center;
//   color: #636e72;
//   padding: 40px;
// `;

// const RequirementList = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 20px;
// `;

// const RequirementItem = styled.div`
//   background: white;
//   border-radius: 8px;
//   padding: 20px;
//   border: 1px solid #e0e0e0;
// `;

// const RequirementHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 16px;
// `;

// const RequirementTitle = styled.h3`
//   font-size: 16px;
//   font-weight: 600;
//   margin: 0;
//   color: #2d3436;
// `;

// const RequirementContent = styled.div`
//   margin-bottom: 12px;
// `;

// const ConfirmationBox = styled.div`
//   background: #fff3cd;
//   border-left: 4px solid #ffc107;
//   padding: 12px;
//   margin-top: 12px;
//   border-radius: 4px;
// `;

// const DownloadWrapper = styled.div`
//   margin-top: 40px;
//   display: flex;
//   justify-content: center;
// `;


// const DownloadButton = styled.button`
//   padding: 14px 28px;
//   background-color: #00b894;
//   color: white;
//   border-radius: 8px;
//   font-size: 16px;
//   text-decoration: none;
//   cursor: pointer;

//   &:hover {
//     background-color: #009c7a;
//   }
// `;

// const HeaderLeft = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 12px;
// `;

// const Checkbox = styled.input`
//   width: 20px;
//   height: 20px;
//   cursor: pointer;
//   accent-color: #00b894;  /* 체크박스 색상 */
// `;

// const ChecklistHeader = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 20px;
// `;

// const PDFDownloadButton = styled.button`
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     padding: 10px 20px;
//     background-color: #4CAF50;
//     color: white;
//     border: none;
//     border-radius: 6px;
//     font-size: 14px;
//     font-weight: 500;
//     cursor: pointer;
//     transition: all 0.3s ease;

//     &:hover {
//         background-color: #45a049;
//         transform: translateY(-2px);
//         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
//     }

//     &:active {
//         transform: translateY(0);
//     }
// `;

gonago_
gonago_
오프라인 표시
최준형 — 오후 4:12
ㅋㅋㅋㅋㅋ
김채린 — 오후 4:20
company_id 1에 해당하는 사업보고서를 찾을 수 없습니다.
db에 사업보고서가 있어야하나요??
최준형 — 오후 4:20
네
지금 db쪽에 추가된 게 몇 개 있었을텐데
일단 modeling_wo_2 에서 제가 사용하고 있는 db입니다
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: randi2
-- ------------------------------------------------------
-- Server version	8.0.43
... (870KB 남음)

Dump20260209.sql
920KB
step1에서 추가된 부분이랑
근우님 추가하셨던 부분이랑
그리고 제가 이거 넣었었는데
첨부 파일 형식: acrobat
[내츄럴엔도텍][정정]사업보고서(2025.11.25).pdf
3.15 MB
김채린 — 오후 4:29
db는 저걸로 바꾸면 되는걸까요?
그러면 혹시 엔티티 바꾸셨나요?
최준형 — 오후 4:41
아 네 엔티티도 수정했어요
최준형 — 오후 5:37
채린님은 어떤 상황인가요
일단 여기는 서현님이랑 도현님이랑 합친 db로는 안 되는데
김채린 — 오후 5:37
mysql이요?
최준형 — 오후 5:37
채린님 휴지통에서 꺼낸 db로는 일단 됐거든요
아뇨 chroma db
김채린 — 오후 5:37
저도 그것만 돼요 지금
크로마는
최준형 — 오후 5:38
mysql 쪽은 잘 되시나요?
이것저것 추가하셔야 했을 텐데
김채린 — 오후 5:38
mysql은 아직 안바꿨는데
그 혹시 근우님꺼까지 다 바꾼게
위에 올려주신거 저거인가요?
최준형 — 오후 5:38
넹
modeling_wo_2 기준으로
김채린 — 오후 5:38
그럼 일단 이쪽부터 바꿔볼게요
아 코드도 땡겨와야하나
최준형 — 오후 5:38
3번 구동은 된건가요?
김채린 — 오후 5:39
넵
지금 api키가
없어서 결과가 안나오긴하는데
최준형 — 오후 5:39
아 그 감마
김채린 — 오후 5:39
돌아가긴해요
정욱님이 아프셔서
내일 키 물어보려구요
아니면
제가 바꾼 코드들 알려드릴까요 엔티티수정하셨으면?
최준형 — 오후 5:39
네
일단 제쪽에서
김채린 — 오후 5:39
프론트 페이지 두개랑
최준형 — 오후 5:39
채린님꺼까지 넣는 게 좋을 것 같으니
김채린 — 오후 5:40
모델링 main.py만 step3 추가된거라서
잠시만요
그냥 디코로 보낼게요
최준형 — 오후 5:40
네
김채린 — 오후 5:40
이건 main.py에 추가할 step3
# ============================================
# Step 3: PPT 생성 (전체 워크플로우)
# ============================================
@app.post("/api/analyze/step3")
async def api_run_step4(
    file: UploadFile = File(...),

message.txt
4KB
이건 AnnounceCreatePage
import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";
import http from "../../api/http";

message.txt
13KB
이건 result 페이지요
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";

// 타입 정의

message.txt
10KB
합치고 push해주실 수 있을까요 저도 거기에서
크로마디비 수정 계속 해볼게요
최준형 — 오후 5:44
경로가 그냥 pages에 들어가나요?
김채린 — 오후 5:44
그
pages안에
processpage
입니당
result도 annouce 뭐시기 result그거..
ㅋㅋㅋㅋ
최준형 — 오후 5:45
아 이미 있는 파일이군요
김채린 — 오후 5:45
네넵 건모님이 더미데이터 넣어둔거 없애고 수정한거에영
﻿
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