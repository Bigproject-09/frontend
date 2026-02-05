import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import http from "../../api/http";

type ChecklistRow = {
  checklistId: number;
  type: string;
  content: string;
};

type RefRow = {
  referenceId: number;
  type: string;
  title: string;
  url: string;
};

type StoredRaw = {
  checklist?: any;
  analysis?: any;
  overall_eligibility?: any;
};

const NoticeNewPageResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const noticeId = location.state?.noticeId as number | undefined;
  const step1Result = location.state?.result as any | undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checklists, setChecklists] = useState<ChecklistRow[]>([]);
  const [references, setReferences] = useState<RefRow[]>([]);
  const [storedRaw, setStoredRaw] = useState<StoredRaw>({});

  const analysisSummary = useMemo(() => {
    const analysis = step1Result?.fastapi?.data?.analysis ?? storedRaw.analysis;
    const overall = step1Result?.fastapi?.data?.checklist?.overall_eligibility ?? storedRaw.overall_eligibility;
    return { analysis, overall };
  }, [step1Result, storedRaw]);

  useEffect(() => {
    if (!noticeId) {
      setError("noticeId가 없습니다. /process에서 다시 들어오세요.");
      return;
    }

    setLoading(true);
    setError(null);

    http
      .get(`/api/notices/${noticeId}/analysis-results`)
      .then(({ data }) => {
        setChecklists((data.checklists ?? []) as ChecklistRow[]);
        setReferences((data.references ?? []) as RefRow[]);
        setStoredRaw((data.raw ?? {}) as StoredRaw);
      })
      .catch((e) => {
        console.error(e);
        setError("저장된 결과 조회 실패");
      })
      .finally(() => setLoading(false));
  }, [noticeId]);

  if (error) {
    return (
      <Page>
        <Card>
          <Title>공고문 분석 결과</Title>
          <ErrorText>{error}</ErrorText>
          <MiniBtn type="button" onClick={() => navigate("/process")}>
            돌아가기
          </MiniBtn>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        <Title>공고문 분석 결과</Title>

        {loading ? (
          <div style={{ padding: 20 }}>로딩 중...</div>
        ) : (
          <>
            <Section>
              <SectionTitle>자격요건 체크리스트(요약)</SectionTitle>
              {checklists.length === 0 ? (
                <Empty>저장된 체크리스트가 없습니다. 분석을 다시 실행하세요.</Empty>
              ) : (
                <ul>
                  {checklists.map((c) => (
                    <li key={c.checklistId}>
                      <Tag>{c.type}</Tag> {c.content}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section>
              <SectionTitle>FastAPI 판정 요약</SectionTitle>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {JSON.stringify(analysisSummary.overall ?? {}, null, 2)}
              </pre>
            </Section>

            <Section>
              <SectionTitle>심층 분석(JSON)</SectionTitle>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {JSON.stringify(analysisSummary.analysis ?? {}, null, 2)}
              </pre>
            </Section>

            <Section>
              <SectionTitle>저장된 참고자료(링크/파일)</SectionTitle>
              {references.length === 0 ? (
                <Empty>저장된 참고자료가 없습니다.</Empty>
              ) : (
                <ul>
                  {references.map((r) => (
                    <li key={r.referenceId}>
                      <Tag>{r.type}</Tag>{" "}
                      {r.url?.startsWith("http") ? (
                        <a href={r.url} target="_blank" rel="noreferrer">
                          {r.title}
                        </a>
                      ) : (
                        <>
                          {r.title} — <Code>{r.url}</Code>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Row>
              <MiniBtn type="button" onClick={() => navigate("/process", { state: { noticeId } })}>
                프로세스로
              </MiniBtn>
              <MiniBtn type="button" onClick={() => navigate("/process/analysis", { state: { noticeId } })}>
                다시 분석
              </MiniBtn>
            </Row>
          </>
        )}
      </Card>
    </Page>
  );
};

export default NoticeNewPageResult;

const Page = styled.div`
  padding: 60px;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 18px;
`;

const Section = styled.div`
  background: #f9fafb;
  border-radius: 10px;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  margin-bottom: 14px;

  ul {
    margin: 0;
    padding-left: 18px;
  }

  li {
    margin: 8px 0;
    line-height: 1.5;
  }
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 10px;
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

const Code = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 12px;
`;

const Empty = styled.div`
  color: #6b7280;
  font-size: 13px;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 18px;
`;

const MiniBtn = styled.button`
  background: #111827;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorText = styled.div`
  color: #b91c1c;
  margin: 16px 0;
`;
