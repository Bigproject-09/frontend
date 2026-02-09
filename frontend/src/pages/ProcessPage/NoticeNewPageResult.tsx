import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";
import { jsPDF } from "jspdf";
import { NotoSansKR } from "../../utils/NotoSansKR";

// 타입 정의
interface Judgment {
    id: number;
    category: string;
    requirement_text: string;
    judgment: "가능" | "불가능" | "확인 필요";
    reason: string;
    quote_from_announcement: string[]; // 토글
    additional_action: string;
}

interface AnalysisData {
    judgments: Judgment[];
    purpose?: string;
    evaluationItems?: string;

    research_intent?: {
        policy_background: string;
        target_issues: string[];
    };

    evaluation_weight_analysis?: {
        summary: string;
        high_weight_items: {
            item: string;
            points: number;
            strategy: string;
        }[];
    };

    quantitative_targets?: {
        deliverables: string[];
        mandatory_requirements: string[];
    };
}

// 더미 데이터
const DUMMY_DATA: AnalysisData = {
    judgments: [
        {
            id: 1,
            category: "신청주체 유형 (국가연구개발혁신법)",
            requirement_text: "국가연구개발혁신법(이하 혁신법) 제2조제3호 및 같은 법 시행령 제2조제1항과 해양수산과학기술 육성법(이하 육성법) 제8조제1항 및 같은 법 시행령 제6조에 해당하는 연구개발기관",
            judgment: "가능",
            reason: "주식회사 내츄럴엔도텍은 「상법」 제169조에 따른 회사이며, 사업보고서에 '중소기업 해당 여부: 해당'으로 명시되어 있어 「중소기업기본법」 제2조에 따른 중소기업에 해당합니다. 따라서 국가연구개발혁신법 제2조제3호 사목 및 같은 법 시행령 제2조제1항제1호의 자격요건을 충족합니다.",
            quote_from_announcement: [
                "<국가연구개발혁신법 제2조제3호> 3. “연구개발기관”이란 다음 각 목의 기관ㆍ단체 중 국가연구개발사업을 수행하는 기관ㆍ단체를 말한다. 사. 「상법」 제169조에 따른 회사",
                "<국가연구개발혁신법 시행령 제2조제1항> 제2조(연구개발기관) ①「국가연구개발혁신법」(이하 “법”이라 한다) 제2조제3호아목에서 “대통령령으로 정하는 기관ㆍ단체”란 다음 각 호의 기관ㆍ단체를 말한다. 1. 「중소기업기본법」제2조에 따른 중소기업",
            ],
            additional_action: ""
        },
        {
            id: 2,
            category: "신청주체 유형 (해양수산과학기술 육성법)",
            requirement_text: "해양수산과학기술 육성법(이하 육성법) 제8조제1항 및 같은 법 시행령 제6조에 해당하는 연구개발기관",
            judgment: "불가능",
            reason: "공고문은 '해양수산과학기술 분야의 연구기관 또는 단체로서 해양수산과학기술 관련 업무를 수행하는 연구기관 또는 단체'를 요구합니다. 주식회사 내츄럴엔도텍의 사업보고서에 명시된 주요 사업은 'Health&Beauty' 분야의 건강기능식품 및 화장품 연구개발 및 제조, 판매입니다. 이는 '해양·극지의 환경 및 생태계에 관한 기후예측시스템 개발' 사업과는 직접적인 관련성이 없어 보이며, 해양수산과학기술 분야의 연구기관으로 보기 어렵습니다. 사업보고서 어디에도 해양수산과학기술 관련 업무를 수행한다는 내용은 없습니다.",
            quote_from_announcement: [
                "<해양수산과학기술 육성법 시행령 제6조> 제6조(연구개발사업등의 협약체결 대상 연구기관 또는 단체) 법 제8조제1항제8호에서 “대통령령으로 정하는 해양수산과학기술 분야의 연구기관 또는 단체”란 다음 각 호의 연구기관 또는 단체로서 해양수산과학기술 관련 업무를 수행하는 연구기관 또는 단체를 말한다.",
            ],
            additional_action: "회사가 해양수산과학기술 분야와 관련된 연구 실적이나 사업 계획이 있는지 추가 확인이 필요합니다. 현재 정보로는 해당 분야의 전문성을 입증하기 어렵습니다."
        },
    ],
    research_intent: {
        "policy_background": "정부는 기후변화로 인한 해양환경 급변에 대응하고, 신뢰도 높은 해양 기후변화 감시·예측 역량을 확보하며 국가 해양과학 경쟁력을 강화하고자 합니다. 특히 우리나라 해역 특성을 반영한 국내 기술 기반의 해양기후모델 확보가 시급하며, 이를 통해 과학적 데이터에 기반한 실효성 있는 맞춤형 정책 수립을 목표로 합니다.",
        "target_issues": [
            "가속화되는 해양 기후변화에 대한 신뢰도 높은 감시·예측 정보 생산 및 제공",
            "한반도 주변 해역에 최적화된 국내 기술 기반의 해양·극지 환경 및 생태계 기후예측시스템 부재",
            "해양 환경 생태계에 관한 기후변화 영향 예측 및 맞춤형 정책 수립을 위한 시스템 미비"
        ]
    },
    evaluation_weight_analysis: {
        "summary": "총 100점 만점 중 연구개발 계획(40%)과 연구역량(30%)이 전체 평가 배점의 70%를 차지하는 고배점 항목으로, 제안 기술의 우수성과 수행 주체의 역량을 핵심적으로 평가합니다. 추진체계(20%)와 성과활용 계획(10%)도 중요하게 다루어집니다.",
        "high_weight_items": [
            {
                "item": "연구개발 계획 (40%)",
                "points": 40,
                "strategy": "RFP의 최종목표 및 세부 요구사항을 명확히 반영하고, 국내외 선행연구 및 시장 동향 분석을 기반으로 제안 기술의 차별성과 창의성을 구체적으로 제시해야 합니다. 특히, 최종 및 연차별 연구 목표의 정량적 성과지표와 목표치 설정의 적절성을 상세하고 현실적으로 증명해야 합니다. (세부 항목 중 '연구개발계획의 구체성 및 창의성' 15점, '정량적 성과지표 및 목표치 설정 적절성' 10점, 'RFP 요구사항 반영' 10점)"
            },
            {
                "item": "연구역량 (30%)",
                "points": 30,
                "strategy": "주관연구책임자의 총괄 역량과 소속기관의 연구 인프라 및 관리 역량을 강조하고, 참여연구진 각 구성원의 전문성과 연구수행능력이 최종 목표 달성에 충분함을 입증해야 합니다. 유사 과제 수행 경험 및 관련 성과를 구체적인 데이터와 함께 제시하여 신뢰도를 높여야 합니다. (세부 항목 중 '연구책임자/소속기관 연구역량 및 관리방안' 20점)"
            }
        ]
    },
    quantitative_targets: {
        deliverables: [
            "전지구 해양기후 모델 사용자 매뉴얼 1식 (국내 독자적 모델링 기술 3건 이상 적용)",
            "CMIP7 제출을 위한 해양기후변화전망 보고서 1식 (기후변화 시나리오 자료집 5종 이상 포함)",
            "50년 해양기후자료 재분석·재예측 결과 보고서 1식 (기상자료 동화 포함)",
            "지역 상세 해양기후변화 보고서 1식 (기후변화 시나리오 자료집 4종 이상 포함)",
            "해양 상위 생태계 보고서 1식 (기후변화 시나리오 자료집 4종 이상 포함)",
            "SCIE 논문 195건 이상",
            "특허 등록 50건 이상",
            "사업화 5건 이상"
        ],
        mandatory_requirements: [
            "총 연구개발기간: 5년 이내 ('26. 4. ~ '30. 12. 이내)",
            "당해 연구개발기간: 9개월 이내 ('26. 4. ~ '26. 12.)",
            "총 정부지원연구개발비: 350억원 이내 (당해연도 45억원 이내)",
            "영리기관 참여 시 총 연구기간 동안 정부지원연구개발비 5억원당 1명의 만 18세 이상 34세 이하 청년인력 신규채용 및 1년 이상 고용 유지 (1차년도 회계연도 종료 전 1명 이상 채용)",
            "연구시설·장비 구입 시 3천만원 이상 1억원 미만 장비는 '연구시설·장비 구축계획서' 제출 (1억원 이상은 선정 후 NFEC 심사)",
            "연구개발 성과물의 소유는 국가로 함 (특별한 사유 시 변경 가능)"
        ]
    },
};


const NoticeNewPageResult: React.FC = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const noticeId = location.state?.noticeId as number | undefined;

    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);

    // 체크박스 상태 추가
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
    // 드롭다운 상태 추가
    const [openQuoteId, setOpenQuoteId] = useState<number | null>(null);
    // 체크리스트 아이템 확장 상태 관리
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const toggleExpand = (id: number) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleQuote = (id: number) => {
        setOpenQuoteId(prev => (prev === id ? null : id));
    };

    useEffect(() => {
        // 더미 데이터만 사용
        setTimeout(() => {
            setAnalysisData(DUMMY_DATA);
            setLoading(false);
        }, 500);
    }, []);

    const handleBack = (id: number) => {
        navigate("/process/analysis", {
            state: { noticeId: id },
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
        if (!analysisData?.judgments || analysisData.judgments.length === 0) {
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
        analysisData.judgments.forEach((req, index) => {
            // 페이지 넘김 체크
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // 체크박스 상태 표시
            // const checkStatus = checkedItems.has(req.id) ? "[✓]" : "[ ]";

            // 제목
            doc.setFont("NotoSansKR", "bold");
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${req.category}`, margin, yPosition);
            yPosition += 8;

            // 요구사항
            doc.setFont("NotoSansKR", "normal");
            doc.setFontSize(10);
            doc.text("요구사항:", margin + 5, yPosition);
            yPosition += 6;

            const reqLines = doc.splitTextToSize(req.requirement_text, contentWidth - 10);
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
            doc.text("가능 여부:", margin + 5, yPosition);
            yPosition += 6;

            const confirmLines = doc.splitTextToSize(req.judgment, contentWidth - 10);
            confirmLines.forEach((line: string) => {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin + 10, yPosition);
                yPosition += 5;
            });
            yPosition += 8;

            // 근거
            doc.setFont("NotoSansKR", "normal");
            doc.setFontSize(10);
            doc.text("근거:", margin + 5, yPosition);
            yPosition += 6;

            const reasonLines = doc.splitTextToSize(req.reason, contentWidth - 10);
            reasonLines.forEach((line: string) => {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin + 10, yPosition);
                yPosition += 5;
            });
            yPosition += 3;

            // 관련 법령
            doc.setFont("NotoSansKR", "normal");
            doc.setFontSize(10);
            doc.text("관련 법령:", margin + 5, yPosition);
            yPosition += 6;

            req.quote_from_announcement.forEach((quote: string) => {
                const announcementLines = doc.splitTextToSize(
                    quote,
                    contentWidth - 10
                );

                announcementLines.forEach((line: string) => {
                    if (yPosition > 280) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, margin + 10, yPosition);
                    yPosition += 5;
                });

                // 문단 간 여백
                yPosition += 4;
            });

            if (req.additional_action.length > 0) {
                // 추가 조치
                doc.setFont("NotoSansKR", "normal");
                doc.setFontSize(10);
                doc.text("추가 조치:", margin + 5, yPosition);
                yPosition += 6;

                const actionLines = doc.splitTextToSize(req.additional_action, contentWidth - 10);
                actionLines.forEach((line: string) => {
                    if (yPosition > 280) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, margin + 10, yPosition);
                    yPosition += 5;
                });
                yPosition += 3;
            }


            // 구분선
            if (index < analysisData.judgments.length - 1) {
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
                    <div className="title" style={{ fontSize: 15 }}>
                        자격 요건 체크리스트
                    </div>
                    <PDFDownloadButton onClick={handleDownloadPDF}>
                        {/* <DownloadIcon>📄</DownloadIcon>
                        PDF 다운로드 */}
                        PDF로 다운로드
                    </PDFDownloadButton>
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
                                        <StatusBadge status={req.judgment}>
                                            {req.judgment}
                                        </StatusBadge>
                                    </RequirementHeader>

                                    {/* <Label>요구사항:</Label> */}
                                    <ExpandableText text={req.requirement_text} />

                                    {req.reason.length > 0 && req.quote_from_announcement.length <= 0 && req.additional_action.length <= 0 && (
                                        <ArrowWrapper onClick={() => toggleExpand(req.id)}>
                                            {expandedItems.has(req.id) ? "▼ 근거" : "▶ 근거"}
                                        </ArrowWrapper>
                                    )}
                                    {req.reason.length > 0 && req.quote_from_announcement.length > 0 && req.additional_action.length <= 0 && (
                                        <ArrowWrapper onClick={() => toggleExpand(req.id)}>
                                            {expandedItems.has(req.id) ? "▼ 근거, 관련 법령" : "▶ 근거, 관련 법령"}
                                        </ArrowWrapper>
                                    )}
                                    {req.reason.length > 0 && req.quote_from_announcement.length > 0 && req.additional_action.length > 0 && (
                                        <ArrowWrapper onClick={() => toggleExpand(req.id)}>
                                            {expandedItems.has(req.id) ? "▼ 근거, 관련 법령, 추가 조치" : "▶ 근거, 관련 법령, 추가 조치"}
                                        </ArrowWrapper>
                                    )}

                                    {expandedItems.has(req.id) && (
                                        <>
                                            {/* <Label style={{ marginTop: 12 }}>이유:</Label> */}
                                            <ExpandableText text={req.reason} />

                                            {req.quote_from_announcement.length > 0 && (
                                                <Label
                                                    // type="button"
                                                    // onClick={() => toggleQuote(req.id)}
                                                    style={{
                                                        marginTop: 12,
                                                        background: "none",
                                                        border: "none",
                                                        color: "#0984e3",
                                                        cursor: "pointer",
                                                        fontSize: 13,
                                                        padding: 0,
                                                    }}
                                                >
                                                    {/* {openQuoteId === req.id
                                                        ? "관련 법령 ▲"
                                                        : "관련 법령 ▼"} */}
                                                    관련 법령
                                                </Label>
                                            )}

                                            {/* {openQuoteId === req.id && ( */}
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
                                                {req.quote_from_announcement.map((quote, idx) => (
                                                    <div key={idx} style={{ marginBottom: 8 }}>
                                                        {quote}
                                                    </div>
                                                ))}
                                            </div>


                                            {req.additional_action !== "" && (
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
                    과제 의도 및 목적
                </div>
                <Section>
                    <RequirementList>
                        <RequirementItem>
                            <RequirementHeader>
                                <RequirementTitle>정책 배경</RequirementTitle>
                            </RequirementHeader>
                            <ExpandableText text={analysisData?.research_intent?.policy_background || ""} />
                        </RequirementItem>
                        <RequirementItem>
                            <RequirementHeader>
                                <RequirementTitle>해결 목표 이슈</RequirementTitle>
                            </RequirementHeader>
                            <ul style={{ paddingLeft: '20px' }}>
                                {analysisData?.research_intent?.target_issues.map((issue, i) => (
                                    <li key={i} style={{ fontSize: '14px', marginBottom: '4px', lineHeight: '1.6' }}>{issue}</li>
                                ))}
                            </ul>
                        </RequirementItem>
                    </RequirementList>
                </Section>
                <br />

                <div className="title" style={{ fontSize: 15 }}>
                    평가 지표 분석
                </div>
                <Section>
                    <RequirementList>
                        <RequirementItem>
                            <RequirementHeader>
                                <RequirementTitle>요약</RequirementTitle>
                            </RequirementHeader>
                            <ExpandableText text={analysisData?.evaluation_weight_analysis?.summary || ""} />
                        </RequirementItem>

                        {analysisData?.evaluation_weight_analysis?.high_weight_items.map((item, i) => (
                            <RequirementItem key={i}>
                                <RequirementHeader>
                                    <RequirementTitle>{item.item} ({item.points}점)</RequirementTitle>
                                </RequirementHeader>
                                <ExpandableText text={item.strategy} />
                            </RequirementItem>
                        ))}
                    </RequirementList>
                </Section>
                <br />

                <div className="title" style={{ fontSize: 15 }}>
                    제출해야하는 문서
                </div>
                <Section>
                    <RequirementList>
                        <RequirementItem>
                            <ul style={{ paddingLeft: '20px' }}>
                                {analysisData?.quantitative_targets?.deliverables.map((doc, i) => (
                                    <li key={i} style={{ fontSize: '14px', marginBottom: '4px', lineHeight: '1.6' }}>{doc}</li>
                                ))}
                            </ul>
                        </RequirementItem>
                    </RequirementList>
                </Section>
                <br />

                <div className="title" style={{ fontSize: 15 }}>
                    필수 준수 사항
                </div>
                <Section>
                    <RequirementList>
                        <RequirementItem>
                            <ul style={{ paddingLeft: '20px' }}>
                                {analysisData?.quantitative_targets?.mandatory_requirements.map((req, i) => (
                                    <li key={i} style={{ fontSize: '14px', marginBottom: '4px', lineHeight: '1.6' }}>{req}</li>
                                ))}
                            </ul>
                        </RequirementItem>
                    </RequirementList>
                </Section>

                <RightActionRow>
                    <button
                        type="button"
                        className="button_center"
                        style={{ width: 120 }}
                        onClick={() => {
                            if (!noticeId)
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

// Text Expandable Component
const ExpandableText: React.FC<{ text: string }> = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textRef.current) {
            // Check if scrollWidth is greater than clientWidth
            const element = textRef.current;
            if (element.scrollWidth > element.clientWidth) {
                setIsOverflowing(true);
            }
        }
    }, [text]);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Text
                ref={textRef}
                style={
                    isExpanded
                        ? {}
                        : {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1, // Take available space
                            minWidth: 0, // Enable truncation
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
    justify-content: flex-start; /* 왼쪽 정렬 */
    margin-top: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #636e72;
    
    &:hover {
        color: #2d3436;
    }
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
                return "#00b894"; // Green
            case "불가능":
                return "#d63031"; // Red
            case "확인 필요":
                return "#fdcb6e"; // Yellow
            default:
                return "#b2bec3"; // Gray
        }
    }};
    /* 글자색 조정 (노란색 배경일 때 가독성 위해) */
    ${(props) => props.status === "확인 필요" && `
        color: #2d3436;
    `}
`;