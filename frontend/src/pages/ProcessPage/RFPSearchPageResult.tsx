import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";

type Similarity = "상" | "중" | "하" | string;

interface TrackComparisonItem {
  year?: string;
  ministry?: string;
  title?: string;
  similarity?: Similarity;
  difference?: string;
}

interface ReportData {
  summary_opinion?: string;
  track_a_comparison?: TrackComparisonItem[];
  track_b_comparison?: TrackComparisonItem[];
  strategies?: string[];
  error?: string;
}

interface TrackHit {
  id?: string;
  score?: number;
  distance?: number;
  document?: string;
  metadata?: Record<string, any>;
}

interface Step2ResultExpanded {
  report?: ReportData;
  track_a?: TrackHit[];
  track_b?: TrackHit[];
}

interface Step2Response {
  status: string;
  data: ReportData | Step2ResultExpanded;
}

const RFPSearchPageResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const noticeId = location.state?.noticeId as number | undefined;
  const rfpResult = location.state?.rfpResult as ReportData | Step2ResultExpanded | undefined;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [report, setReport] = useState<ReportData | null>(null);
  const [trackA, setTrackA] = useState<TrackHit[]>([]);
  const [trackB, setTrackB] = useState<TrackHit[]>([]);

  // ✅ 다운로드 함수 추가
  const handleDownload = () => {
    if (!report) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    try {
      const jsonStr = JSON.stringify(report, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `RFP분석결과_${new Date().toISOString().slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("다운로드가 완료되었습니다!");
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (!noticeId) {
      setErrorMsg("noticeId가 없습니다.");
      return;
    }

    if (rfpResult) {
      console.log("✅ 검색 페이지에서 전달받은 결과 사용");

      const expanded = rfpResult as Step2ResultExpanded;

      if (expanded && expanded.report) {
        setReport(expanded.report ?? null);
        setTrackA(expanded.track_a ?? []);
        setTrackB(expanded.track_b ?? []);
      } else {
        setReport(rfpResult as ReportData);
        setTrackA([]);
        setTrackB([]);
      }

      return;
    }

    console.log("⚠️ 결과 없음 - API 직접 호출");
    setLoading(true);
    setErrorMsg(null);

    fetch("http://localhost:8000/api/analyze/step2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notice_id: noticeId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Step2 호출 실패: ${res.status} ${text}`);
        }
        return res.json() as Promise<Step2Response>;
      })
      .then((json) => {
        const data = json?.data;
        const expanded = data as Step2ResultExpanded;

        if (expanded && expanded.report) {
          setReport(expanded.report ?? null);
          setTrackA(expanded.track_a ?? []);
          setTrackB(expanded.track_b ?? []);
        } else {
          setReport(data as ReportData);
          setTrackA([]);
          setTrackB([]);
        }

        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setErrorMsg("유관 RFP 검색 결과를 불러오지 못했습니다.");
        setLoading(false);
      });
  }, [noticeId, rfpResult]);

  const handleBack = (id: number) => {
    navigate("/process/rfp", {
      state: { noticeId: id },
    });
  };

  const handleReExtract = (id: number) => {
    setReport(null);
    setTrackA([]);
    setTrackB([]);
    setLoading(true);
    setErrorMsg(null);

    fetch("http://localhost:8000/api/analyze/step2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notice_id: id }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`재추출 실패: ${res.status}`);
        return res.json() as Promise<Step2Response>;
      })
      .then((json) => {
        const data = json?.data;
        const expanded = data as Step2ResultExpanded;

        if (expanded && expanded.report) {
          setReport(expanded.report ?? null);
          setTrackA(expanded.track_a ?? []);
          setTrackB(expanded.track_b ?? []);
        } else {
          setReport(data as ReportData);
        }

        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setErrorMsg("재추출 중 오류가 발생했습니다.");
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div className="title" style={{ marginLeft: 0, marginBottom: 20 }}>
            유관 RFP 검색
          </div>
          <Section>
            <LoadingSpinner />
            <div style={{ textAlign: "center", marginTop: 20 }}>
              유사 RFP 검색 중...
            </div>
          </Section>
        </Card>
      </Container>
    );
  }

  if (errorMsg) {
    return (
      <Container>
        <Card>
          <div className="title" style={{ marginLeft: 0, marginBottom: 20 }}>
            유관 RFP 검색
          </div>
          <Section style={{ color: "red", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {errorMsg}
          </Section>
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
              돌아가기
            </button>
          </RightActionRow>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 20 }}>
          유관 RFP 검색 결과
        </div>

        <SectionTitle>분석 요약</SectionTitle>
        <Section>
          {report?.summary_opinion ? report.summary_opinion : "요약 결과가 없습니다."}
        </Section>

        <Divider />

        <SectionTitle>
          Track A: 동일 주관 기관 유사 전략
          <Badge color="#3b82f6">중복성 집중 검토</Badge>
        </SectionTitle>
        <Section>
          {report?.track_a_comparison && report.track_a_comparison.length > 0 ? (
            <List>
              {report.track_a_comparison.map((item, idx) => (
                <ListItem key={idx}>
                  <ItemTitle>
                    {item.title ?? "제목 없음"}{" "}
                    <MetaText>
                      ({item.year ?? "연도미상"}, {item.ministry ?? "부처미상"})
                    </MetaText>
                    <SimilarityBadge level={item.similarity ?? "하"}>
                      유사도: {item.similarity ?? "-"}
                    </SimilarityBadge>
                  </ItemTitle>
                  <ItemBody>{item.difference ?? "-"}</ItemBody>
                </ListItem>
              ))}
            </List>
          ) : (
            <EmptyMessage>동일 주관 기관 유사 결과가 없습니다.</EmptyMessage>
          )}
        </Section>

        <Divider />

        <SectionTitle>
          Track B: 타 부처 유사 전략
          <Badge color="#10b981">차별성 집중 검토</Badge>
        </SectionTitle>
        <Section>
          {report?.track_b_comparison && report.track_b_comparison.length > 0 ? (
            <List>
              {report.track_b_comparison.map((item, idx) => (
                <ListItem key={idx}>
                  <ItemTitle>
                    {item.title ?? "제목 없음"}{" "}
                    <MetaText>
                      ({item.year ?? "연도미상"}, {item.ministry ?? "부처미상"})
                    </MetaText>
                    <SimilarityBadge level={item.similarity ?? "하"}>
                      유사도: {item.similarity ?? "-"}
                    </SimilarityBadge>
                  </ItemTitle>
                  <ItemBody>{item.difference ?? "-"}</ItemBody>
                </ListItem>
              ))}
            </List>
          ) : (
            <EmptyMessage>타 부처 유사 전략이 없습니다.</EmptyMessage>
          )}
        </Section>

        <Divider />

        <SectionTitle>권장 차별화 전략</SectionTitle>
        <Section>
          {report?.strategies && report.strategies.length > 0 ? (
            <StrategyList>
              {report.strategies.map((s, idx) => (
                <StrategyItem key={idx}>
                  <StrategyNumber>{idx + 1}</StrategyNumber>
                  <StrategyText>{s}</StrategyText>
                </StrategyItem>
              ))}
            </StrategyList>
          ) : (
            <EmptyMessage>전략 결과가 없습니다.</EmptyMessage>
          )}
        </Section>

        <RightActionRow>
          <ActionButton
            type="button"
            variant="secondary"
            onClick={() => {
              if (!noticeId) return;
              handleReExtract(noticeId);
            }}
          >
            🔄 재추출
          </ActionButton>
          <ActionButton
            type="button"
            variant="secondary"
            onClick={() => {
              if (!noticeId) return;
              handleBack(noticeId);
            }}
          >
            ← 뒤로가기
          </ActionButton>
        </RightActionRow>

        <DownloadWrapper>
          <DownloadButton type="button" onClick={handleDownload}>
            📥 분석 리포트 다운로드 (JSON)
          </DownloadButton>
        </DownloadWrapper>
      </Card>
    </Container>
  );
};

export default RFPSearchPageResult;

/* ===== styled-components ===== */

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg-main, #f3f4f6);
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
  padding: 32px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Badge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 4px 10px;
  background: ${(props) => props.color};
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const Section = styled.div`
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px;
  box-sizing: border-box;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #adb5bd;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #868e96;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 24px 0;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.li`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const MetaText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
`;

const SimilarityBadge = styled.span<{ level: string }>`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) =>
    props.level === "상"
      ? "#fef3c7"
      : props.level === "중"
      ? "#dbeafe"
      : "#f3f4f6"};
  color: ${(props) =>
    props.level === "상"
      ? "#92400e"
      : props.level === "중"
      ? "#1e40af"
      : "#374151"};
`;

const ItemBody = styled.div`
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  white-space: pre-wrap;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #9ca3af;
  padding: 40px 0;
  font-size: 14px;
`;

const StrategyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StrategyItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const StrategyNumber = styled.div`
  min-width: 28px;
  height: 28px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StrategyText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
`;

const RightActionRow = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "secondary"
      ? `
    background: #ffffff;
    border: 1px solid #d1d5db;
    color: #374151;

    &:hover {
      background: #f9fafb;
    }
  `
      : `
    background: var(--color-accent, #3b82f6);
    border: none;
    color: white;

    &:hover {
      background: var(--color-accent-hover, #2563eb);
    }
  `}
`;

const DownloadWrapper = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
`;

const DownloadButton = styled.button`
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 60px auto 0;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;