import React, {useEffect, useState} from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";
import jsPDF from "jspdf";
import { NotoSansKR } from "../../utils/NotoSansKR";

// 타입 정의
interface Requirement {
id: number;
title: string;
requirement: string;
confirmation_needed: string;
}

interface AnalysisData {
requirements: Requirement[];
purpose?: string;
evaluationItems?: string;
}

// 더미 데이터
const DUMMY_DATA: AnalysisData = {
    requirements: [
        {
            id: 1,
            title: "연구개발기관 자격",
            requirement: "국가연구개발혁신법(이하 혁신법) 제2조제3호 및 같은 법 시행령 제2조제1항과 해양수산과학기술 육성법(이하 육성법) 제8조제1항 및 같은 법 시행령 제6조에 해당하는 연구개발기관",
            confirmation_needed: "해당 법령에 명시된 세부 유형(예: 상법상 회사, 중소기업, 기업부설연구소 등) 중 귀하의 기관이 어느 유형에 해당하는지 확인하시기 바랍니다."
        },
        {
            id: 2,
            title: "컨소시엄 참여 필수",
            requirement: "(해양수산부) 극한지 스마트 광역탐사를 위한 로봇-ICT 융합기술 개발 ... 컨소시엄 단위로만 참여 가능 및 각 부처별 과제(2개)는 과제간 연계·협력의 중요성을 고려하여 컨소시엄 형태로 선정·관리",
            confirmation_needed: "본 과제는 컨소시엄 단위로만 참여 가능하므로, 반드시 컨소시엄을 구성하여 신청해야 합니다."
        }
    ],
};

const NoticeNewPageResult: React.FC = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const noticeId = location.state?.noticeId as number | undefined;

    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);

    // 체크박스 상태 추가
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    useEffect(() => {
        // 더미 데이터만 사용
        setTimeout(() => {
            setAnalysisData(DUMMY_DATA);
            setLoading(false);
        }, 500);
    }, []);

    const handleBack = (id:number) => {
        navigate("/process/analysis",{
            state: {noticeId: id},
        });
    };

        // 체크박스 핸들러
    const handleCheckboxChange = (id: number) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // PDF 다운로드 함수
    const handleDownloadPDF = () => {
        if (!analysisData?.requirements || analysisData.requirements.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // 한글 폰트 설정을 위한 기본 설정
        //doc.setFont("helvetica");
        doc.addFileToVFS("NotoSansKR-Regular.ttf", NotoSansKR);
        doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
        doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "bold");
        
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // 제목
        doc.setFont("NotoSansKR", "bold");
        doc.setFontSize(18);
        doc.text("자격 요건 체크리스트", margin, yPosition);
        yPosition += 15;

        // 날짜
        doc.setFont("NotoSansKR", "normal");
        doc.setFontSize(10);
        const today = new Date().toLocaleDateString('ko-KR');
        doc.text(`작성일: ${today}`, margin, yPosition);
        yPosition += 10;

        // 구분선
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // 각 요건 항목
        analysisData.requirements.forEach((req, index) => {
            // 페이지 넘김 체크
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // 체크박스 상태 표시
            const checkStatus = checkedItems.has(req.id) ? "[✓]" : "[ ]";
            
            // 제목
            doc.setFont("NotoSansKR", "bold");
            doc.setFontSize(12);
            doc.text(`${checkStatus} ${index + 1}. ${req.title}`, margin, yPosition);
            yPosition += 8;

            // 요구사항
            doc.setFont("NotoSansKR", "normal");
            doc.setFontSize(10);
            doc.text("요구사항:", margin + 5, yPosition);
            yPosition += 6;
            
            const reqLines = doc.splitTextToSize(req.requirement, contentWidth - 10);
            reqLines.forEach((line: string) => {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin + 10, yPosition);
                yPosition += 5;
            });
            yPosition += 3;

            // 확인 필요
            doc.text("확인 필요:", margin + 5, yPosition);
            yPosition += 6;
            
            const confirmLines = doc.splitTextToSize(req.confirmation_needed, contentWidth - 10);
            confirmLines.forEach((line: string) => {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin + 10, yPosition);
                yPosition += 5;
            });
            yPosition += 8;

            // 구분선
            if (index < analysisData.requirements.length - 1) {
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 8;
            }
        });

        // PDF 저장
        doc.save(`자격요건_체크리스트_${today}.pdf`);
    };

    return (
        <Container>
            <Card>
                <div className="title" style={{ marginLeft: 0, marginBottom: 50 }}>
                    공고문 분석
                </div>

                {/* <Row> */}

                <ChecklistHeader>
                    <div className="title" style = {{fontSize: 15}}>
                        자격 요건 체크리스트
                    </div>
                    <PDFDownloadButton onClick={handleDownloadPDF}>
                        {/* <DownloadIcon>📄</DownloadIcon>
                        PDF 다운로드 */}
                    </PDFDownloadButton>
                </ChecklistHeader>

                    <Section>
                        {analysisData?.requirements && analysisData.requirements.length > 0 ? (
                        <RequirementList>
                            {analysisData.requirements.map((req) => (
                                <RequirementItem key={req.id}>
                                    <RequirementHeader>
                                        <HeaderLeft>
                                            <Checkbox
                                                type="checkbox"
                                                checked={checkedItems.has(req.id)}
                                                onChange={() => handleCheckboxChange(req.id)}
                                            />
                                            <RequirementTitle>{req.title}</RequirementTitle>
                                        </HeaderLeft>
                                        {/* <RequirementTitle>{req.title}</RequirementTitle> */}
                                    </RequirementHeader>
                                    
                                    <RequirementContent>
                                        <ConfirmationBox>
                                            <Label>요구사항:</Label>
                                            <Text>{req.requirement}</Text>
                                        </ConfirmationBox>
                                    </RequirementContent>

                                    {/* {req.confirmation_needed && ( */}
                                         {/* <ConfirmationBox> */}
                                            <Label>확인 필요:</Label>
                                            <Text>{req.confirmation_needed}</Text>
                                        {/* </ConfirmationBox> */}
                                    {/* )} */}
                                </RequirementItem>
                            ))}
                        </RequirementList>
                    ) : (
                        <EmptyMessage>자격 요건 데이터가 없습니다.</EmptyMessage>
                    )}
                    </Section>
                    <br />

                    <div className="title" style = {{fontSize: 15}}>
                        사업 목적 요약
                    </div>
                    <Section>
                        사업 목적
                    </Section>
                    <br />

                    <div className="title" style = {{fontSize: 15}}>
                        평가항목 요약
                    </div>
                    <Section>
                        평가항목
                    </Section>

                    <RightActionRow>
                            <button
                                type="button"
                                className="button_center"
                                style={{ width: 120 }}
                                onClick={() => {
                                    if(!noticeId)
                                        return;
                                    handleBack(noticeId);
                                }}>
                                재추출
                            </button>
                    </RightActionRow>

                    
                <DownloadWrapper>
                    <DownloadButton>
                        PPT 초안 다운로드
                    </DownloadButton>
                </DownloadWrapper>
            </Card>
        </Container>
    );
};

export default NoticeNewPageResult;

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

const CardActions = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightActionRow = styled.div`
    margin-top: 32px;
    display: flex;
    justify-content: flex-end;
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
    height: 300px;  /* min-height 대신 height 사용 */
    background: #f8f9fa;
    border-radius: 12px;
    padding: 28px;
    box-sizing: border-box;
    position: relative;
    overflow-y: auto;  /* 세로 스크롤 활성화 */

    /* 스크롤바 스타일링 (선택사항) */
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

const RequirementContent = styled.div`
  margin-bottom: 12px;
`;

const ConfirmationBox = styled.div`
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px;
  margin-top: 12px;
  border-radius: 4px;
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

  &:hover {
    background-color: #009c7a;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #00b894;  /* 체크박스 색상 */
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
    background-color: #4CAF50;
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