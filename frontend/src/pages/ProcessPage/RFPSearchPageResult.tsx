import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";

/** ===== Step2 응답 타입 (FastAPI) =====
 * FastAPI /api/analyze/step2 응답:
 * {
 *   status: "success",
 *   data: <result>
 * }
 *
 * result는 현재 구현상 report(JSON)만 올 수도 있고,
 * 추후 { report, track_a, track_b } 형태로 확장될 수도 있어서 둘 다 대응.
 */

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
  // 에러시 fallback
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

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 실제로 화면에 뿌릴 데이터
  const [report, setReport] = useState<ReportData | null>(null);
  const [trackA, setTrackA] = useState<TrackHit[]>([]);
  const [trackB, setTrackB] = useState<TrackHit[]>([]);

  useEffect(() => {
    if (!noticeId) {
      setErrorMsg("noticeId가 없습니다.");
      setLoading(false);
      return;
    }

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

        // (1) report만 오는 경우: data.summary_opinion 같은 키가 바로 있음
        // (2) 확장형: data.report / data.track_a / data.track_b
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
  }, [noticeId]);

  const handleBack = (id: number) => {
    navigate("/process/rfp", {
      state: { noticeId: id },
    });
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div className="title" style={{ marginLeft: 0, marginBottom: 20 }}>
            유관 RFP 검색
          </div>
          <Section>로딩 중...</Section>
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
          <Section style={{ color: "red" }}>{errorMsg}</Section>
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
          유관 RFP 검색
        </div>

        {/* 요약/의견 */}
        <div className="title" style={{ fontSize: 15, marginBottom: 10 }}>
          분석 요약
        </div>
        <Section>
          {report?.summary_opinion ? report.summary_opinion : "요약 결과가 없습니다."}
        </Section>

        <br />

        {/* Track A: 동일 부처/동일 주관 */}
        <div className="title" style={{ fontSize: 15, marginBottom: 10 }}>
          동일 주관 기관 (Track A)
        </div>
        <Section>
          {report?.track_a_comparison && report.track_a_comparison.length > 0 ? (
            <List>
              {report.track_a_comparison.map((item, idx) => (
                <ListItem key={idx}>
                  <ItemTitle>
                    {item.title ?? "제목 없음"}{" "}
                    <MetaText>
                      ({item.year ?? "연도미상"}, {item.ministry ?? "부처미상"} / 유사도:{" "}
                      {item.similarity ?? "-"})
                    </MetaText>
                  </ItemTitle>
                  <ItemBody>{item.difference ?? "-"}</ItemBody>
                </ListItem>
              ))}
            </List>
          ) : trackA.length > 0 ? (
            // 만약 report에 비교표가 없고, track_a 원본만 내려오는 경우 대비
            <List>
              {trackA.map((hit, idx) => (
                <ListItem key={hit.id ?? idx}>
                  <ItemTitle>
                    {hit.metadata?.title ?? hit.metadata?.name ?? "제목 없음"}{" "}
                    <MetaText>
                      (score: {typeof hit.score === "number" ? hit.score : "-"})
                    </MetaText>
                  </ItemTitle>
                  <ItemBody>{hit.document ? hit.document.slice(0, 400) : "-"}</ItemBody>
                </ListItem>
              ))}
            </List>
          ) : (
            "동일 주관 기관 유사 결과가 없습니다."
          )}
        </Section>

        <br />

        {/* Track B: 유사 RFP */}
        <div className="title" style={{ fontSize: 15, marginBottom: 10 }}>
          유사 RFP (Track B)
        </div>
        <Section>
          {report?.track_b_comparison && report.track_b_comparison.length > 0 ? (
            <List>
              {report.track_b_comparison.map((item, idx) => (
                <ListItem key={idx}>
                  <ItemTitle>
                    {item.title ?? "제목 없음"}{" "}
                    <MetaText>
                      ({item.year ?? "연도미상"}, {item.ministry ?? "부처미상"} / 유사도:{" "}
                      {item.similarity ?? "-"})
                    </MetaText>
                  </ItemTitle>
                  <ItemBody>{item.difference ?? "-"}</ItemBody>
                </ListItem>
              ))}
            </List>
          ) : trackB.length > 0 ? (
            <List>
              {trackB.map((hit, idx) => (
                <ListItem key={hit.id ?? idx}>
                  <ItemTitle>
                    {hit.metadata?.title ?? hit.metadata?.name ?? "제목 없음"}{" "}
                    <MetaText>
                      (score: {typeof hit.score === "number" ? hit.score : "-"})
                    </MetaText>
                  </ItemTitle>
                  <ItemBody>{hit.document ? hit.document.slice(0, 400) : "-"}</ItemBody>
                </ListItem>
              ))}
            </List>
          ) : (
            "유사 RFP 결과가 없습니다."
          )}
        </Section>

        <br />

        {/* 전략 */}
        <div className="title" style={{ fontSize: 15, marginBottom: 10 }}>
          제안 전략
        </div>
        <Section>
          {report?.strategies && report.strategies.length > 0 ? (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {report.strategies.map((s, idx) => (
                <li key={idx} style={{ lineHeight: 1.7 }}>
                  {s}
                </li>
              ))}
            </ol>
          ) : (
            "전략 결과가 없습니다."
          )}
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
            재추출
          </button>
        </RightActionRow>

        <DownloadWrapper>
          <DownloadButton type="button">PPT 초안 다운로드</DownloadButton>
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
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
`;

const Section = styled.div`
  width: 100%;
  height: 300px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 18px 18px;
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

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ListItem = styled.li`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 14px;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 8px;
`;

const MetaText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
`;

const ItemBody = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const DownloadWrapper = styled.div`
  margin-top: 30px;
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
