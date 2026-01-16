import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

type NoticeItem = {
  id: number;
  title: string;
  dday: string;
  score: number;
  isRead: boolean;
  url?: string;

  org?: string;
  budget?: string;
  period?: string;
  summary?: string;
};

const STORAGE_KEY = "bb_notices_v1";

const NoticeNewPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");

  const titleRef = useRef<HTMLInputElement | null>(null);
  const orgRef = useRef<HTMLInputElement | null>(null);
  const budgetRef = useRef<HTMLInputElement | null>(null);
  const periodRef = useRef<HTMLInputElement | null>(null);
  const urlRef = useRef<HTMLInputElement | null>(null);
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);

  const requiredFields = useMemo(
    () => [
      { label: "제목", value: title, ref: titleRef },
      { label: "기관", value: org, ref: orgRef },
      { label: "예산", value: budget, ref: budgetRef },
      { label: "기간", value: period, ref: periodRef },
      { label: "URL", value: url, ref: urlRef },
      { label: "요약", value: summary, ref: summaryRef },
    ],
    [title, org, budget, period, url, summary]
  );

  const loadItems = (): NoticeItem[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as NoticeItem[]) : [];
    } catch {
      return [];
    }
  };

  const saveItems = (list: NoticeItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const focusFirstEmpty = () => {
    const firstEmpty = requiredFields.find((f) => !f.value.trim());
    if (!firstEmpty) return false;

    alert(`${firstEmpty.label} 항목을 입력해 주세요.`);

    const el = firstEmpty.ref.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.focus(), 150);
    }
    return true;
  };

  const calcDdayFromPeriod = (periodText: string) => {
    const parts = periodText.split("~").map((s) => s.trim());
    const end = parts.length >= 2 ? parts[1] : "";
    const endDate = new Date(end);
    if (Number.isNaN(endDate.getTime())) return "D-?";

    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // 00:00
    const diffMs = endDate.getTime() - base.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const n = diffDays < 0 ? 0 : diffDays;
    return `D-${n}`;
  };

  const getNextId = (list: NoticeItem[]) => {
    const maxId = list.reduce((m, it) => Math.max(m, it.id), 0);
    return maxId + 1;
  };

  const handleSubmit = () => {
    if (focusFirstEmpty()) return;

    const prev = loadItems();

    const newItem: NoticeItem = {
      id: getNextId(prev),
      title: title.trim(),
      org: org.trim(),
      budget: budget.trim(),
      period: period.trim(),
      url: url.trim(),
      summary: summary.trim(),
      dday: calcDdayFromPeriod(period.trim()),
      score: 70, // 임시
      isRead: false,
    };

    const next = [newItem, ...prev];
    saveItems(next);

    navigate("/notice");
  };

  return (
    <Page>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 18 }}>
          신규 공고 등록
        </div>

        <Section>
          <ModalGrid>
            <div className="label">제목</div>
            <input
              ref={titleRef}
              className="input"
              placeholder="공고 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="label">기관</div>
            <input
              ref={orgRef}
              className="input"
              placeholder="기관명"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
            />

            <div className="label">예산</div>
            <input
              ref={budgetRef}
              className="input"
              placeholder="예: 1억 / 5천만"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <div className="label">기간</div>
            <input
              ref={periodRef}
              className="input"
              placeholder="예: 2026-01-01 ~ 2026-02-01"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />

            <div className="label">URL</div>
            <input
              ref={urlRef}
              className="input"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </ModalGrid>

          <ModalSummary>
            <div className="label">요약</div>
            <textarea
              ref={summaryRef}
              className="input"
              style={{ height: 120, paddingTop: 10, resize: "none" }}
              placeholder="공고 요약 내용을 입력"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </ModalSummary>

          <ModalActions>
            <MiniBtn type="button" onClick={handleSubmit}>
              등록
            </MiniBtn>
            <MiniBtn type="button" onClick={() => navigate("/notice")}>
              닫기
            </MiniBtn>
          </ModalActions>
        </Section>
      </Card>
    </Page>
  );
};

export default NoticeNewPage;

/* ===== styled-components ===== */

const Page = styled.div`
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
  background: #efefef;
  border-radius: 10px;
  padding: 14px 16px;
  box-sizing: border-box;
  margin-bottom: 16px;
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  row-gap: 10px;
  column-gap: 12px;
  align-items: center;

  .input {
    width: 100%;
    box-sizing: border-box;
  }
`;

const ModalSummary = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 14px;
  line-height: 1.45;

  .input {
    width: 100%;
    box-sizing: border-box;
  }
`;

const ModalActions = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const MiniBtn = styled.button`
  width: 72px;
  height: 34px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #f7f7f7;
  }
`;
