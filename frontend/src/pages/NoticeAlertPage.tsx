import React, { useMemo, useState } from "react";
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
const PAGE_SIZE = 6;

type ReadFilter = "ALL" | "READ" | "UNREAD";
type DdayFilter = "ALL" | "D0_1" | "D2_3" | "D4_7" | "D8PLUS";
type ScoreFilter = "ALL" | "S80" | "S70" | "S60" | "S0";

const DUMMY_ITEMS: NoticeItem[] = [
  {
    id: 1,
    title: "공고 제목",
    dday: "D-7",
    score: 86,
    url: "https://example.com/notice/1",
    isRead: true,
    org: "중소벤처기업부",
    budget: "1억",
    period: "2026-01-01 ~ 2026-02-01",
    summary: "소상공인 디지털 전환 관련 지원사업 공고(예시).",
  },
  {
    id: 2,
    title: "공고 제목",
    dday: "D-7",
    score: 75,
    url: "https://example.com/notice/2",
    isRead: false,
    org: "정보통신산업진흥원",
    budget: "5천만",
    period: "2026-01-10 ~ 2026-01-25",
    summary: "AI 도입/활용 바우처 관련 공고(예시).",
  },
  { id: 3, title: "공고 제목", dday: "D-1", score: 70, isRead: true },
  { id: 4, title: "공고 제목", dday: "D-3", score: 64, isRead: true },
  { id: 5, title: "공고 제목", dday: "D-7", score: 63, isRead: true },
  { id: 6, title: "공고 제목", dday: "D-6", score: 63, isRead: false },
  { id: 7, title: "공고 제목", dday: "D-10", score: 61, isRead: false },
  { id: 8, title: "요시", dday: "D-2", score: 90, isRead: true },
];

const loadStored = (): NoticeItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NoticeItem[]) : [];
  } catch {
    return [];
  }
};

const saveStored = (list: NoticeItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
  }
};

const mergeUniqueById = (base: NoticeItem[], stored: NoticeItem[]) => {
  const map = new Map<number, NoticeItem>();
  [...stored, ...base].forEach((it) => map.set(it.id, it));
  return Array.from(map.values());
};

const NoticeAlertPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<NoticeItem[]>(() => {
    const stored = loadStored();
    return mergeUniqueById(DUMMY_ITEMS, stored);
  });

  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");
  const [ddayFilter, setDdayFilter] = useState<DdayFilter>("ALL");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("ALL");
  const [filterText, setFilterText] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<NoticeItem | null>(null);

  const parseDday = (dday: string) => {
    const n = Number(dday.replace("D-", ""));
    return Number.isNaN(n) ? 9999 : n;
  };

  const passRead = (it: NoticeItem) => {
    if (readFilter === "ALL") return true;
    if (readFilter === "READ") return it.isRead;
    return !it.isRead;
  };

  const passDday = (it: NoticeItem) => {
    const d = parseDday(it.dday);
    if (ddayFilter === "ALL") return true;
    if (ddayFilter === "D0_1") return d <= 1;
    if (ddayFilter === "D2_3") return d >= 2 && d <= 3;
    if (ddayFilter === "D4_7") return d >= 4 && d <= 7;
    return d >= 8;
  };

  const passScore = (it: NoticeItem) => {
    const s = it.score;
    if (scoreFilter === "ALL") return true;
    if (scoreFilter === "S80") return s >= 80;
    if (scoreFilter === "S70") return s >= 70 && s < 80;
    if (scoreFilter === "S60") return s >= 60 && s < 70;
    return s < 60;
  };

  const filtered = useMemo(() => {
    const t = filterText.trim().toLowerCase();
    return items
      .filter((it) => (t ? it.title.toLowerCase().includes(t) : true))
      .filter(passRead)
      .filter(passDday)
      .filter(passScore);
  }, [items, filterText, readFilter, ddayFilter, scoreFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const resetToFirstPage = () => setPage(1);

  const syncStorage = (next: NoticeItem[]) => {
    setItems(next);
    saveStored(next);
  };

  const removeItem = (id: number) => {
    const next = items.filter((it) => it.id !== id);
    syncStorage(next);

    if (selected?.id === id) setSelected(null);
  };

  const openNotice = (notice: NoticeItem) => {
    setSelected(notice);

    if (!notice.isRead) {
      const next = items.map((it) => (it.id === notice.id ? { ...it, isRead: true } : it));
      syncStorage(next);
      setSelected((prev) => (prev && prev.id === notice.id ? { ...prev, isRead: true } : prev));
    }
  };

  const handleApply = (id: number) => {
    console.log("신청:", id);
  };

  return (
    <Page>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 18 }}>
          공고 알림 페이지
        </div>

        {/* 필터 */}
        <Section>
          <div className="label">필터</div>
          <FilterRow>
            <input
              className="input"
              style={{ width: 320 }}
              placeholder="공고 제목 검색"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                resetToFirstPage();
              }}
            />

            <Select
              value={readFilter}
              onChange={(e) => {
                setReadFilter(e.target.value as ReadFilter);
                resetToFirstPage();
              }}
            >
              <option value="ALL">전체</option>
              <option value="UNREAD">미확인</option>
              <option value="READ">확인</option>
            </Select>

            <Select
              value={ddayFilter}
              onChange={(e) => {
                setDdayFilter(e.target.value as DdayFilter);
                resetToFirstPage();
              }}
            >
              <option value="ALL">마감일 전체</option>
              <option value="D0_1">D-1 이하</option>
              <option value="D2_3">D-2 ~ D-3</option>
              <option value="D4_7">D-4 ~ D-7</option>
              <option value="D8PLUS">D-8 이상</option>
            </Select>

            <Select
              value={scoreFilter}
              onChange={(e) => {
                setScoreFilter(e.target.value as ScoreFilter);
                resetToFirstPage();
              }}
            >
              <option value="ALL">점수 전체</option>
              <option value="S80">80점 이상</option>
              <option value="S70">70~79점</option>
              <option value="S60">60~69점</option>
              <option value="S0">60점 미만</option>
            </Select>

            <ClearBtn
              type="button"
              onClick={() => {
                setFilterText("");
                setReadFilter("ALL");
                setDdayFilter("ALL");
                setScoreFilter("ALL");
                setPage(1);
              }}
            >
              초기화
            </ClearBtn>
          </FilterRow>
        </Section>

        {/* 리스트 */}
        <Section>
          <HeaderRow>
            <div style={{ paddingLeft: 28 }}>공고 제목</div>
            <Center>기한</Center>
            <Center>추천점수</Center>
            <div />
          </HeaderRow>

          {pagedItems.length === 0 ? (
            <Empty>조건에 맞는 공고가 없습니다.</Empty>
          ) : (
            pagedItems.map((it) => (
              <Row key={it.id}>
                <DeleteBtn type="button" onClick={() => removeItem(it.id)}>
                  X
                </DeleteBtn>

                <TitleButton type="button" onClick={() => openNotice(it)} title="공고 상세 보기">
                  {it.title}
                </TitleButton>

                <Center>{it.dday}</Center>
                <Center>{it.score}</Center>

                <Actions>
                  {!it.isRead && <UnreadBadge>미확인</UnreadBadge>}
                  <MiniBtn type="button" onClick={() => handleApply(it.id)}>
                    신청
                  </MiniBtn>
                </Actions>
              </Row>
            ))
          )}

          <Pagination>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PageBtn
                key={p}
                type="button"
                data-active={p === page}
                onClick={() => setPage(p)}
              >
                {p}
              </PageBtn>
            ))}
          </Pagination>
        </Section>

        {/* 우하단 버튼 */}
        <BottomRight>
          <MiniOutlineBtn type="button" onClick={() => navigate("/notice/new")}>
            신규 공고 등록
          </MiniOutlineBtn>
        </BottomRight>

        {/* 모달 */}
        {selected && (
          <ModalOverlay onClick={() => setSelected(null)}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
              <ModalTitle>
                {selected.title}
                {!selected.isRead && <ModalBadge>미확인</ModalBadge>}
              </ModalTitle>

              <ModalGrid>
                <div className="label">기관</div>
                <div>{selected.org ?? "-"}</div>

                <div className="label">예산</div>
                <div>{selected.budget ?? "-"}</div>

                <div className="label">기간</div>
                <div>{selected.period ?? "-"}</div>

                <div className="label">URL</div>
                <div>
                  {selected.url ? (
                    <a href={selected.url} target="_blank" rel="noreferrer">
                      {selected.url}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </ModalGrid>

              <ModalSummary>
                <div className="label">요약</div>
                <div style={{ marginTop: 6 }}>
                  {selected.summary ?? "상세 정보가 없습니다."}
                </div>
              </ModalSummary>

              <ModalActions>
                <MiniBtn type="button" onClick={() => handleApply(selected.id)}>
                  신청
                </MiniBtn>
                <MiniBtn type="button" onClick={() => setSelected(null)}>
                  닫기
                </MiniBtn>
              </ModalActions>
            </ModalCard>
          </ModalOverlay>
        )}
      </Card>
    </Page>
  );
};

export default NoticeAlertPage;

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

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  height: 36px;
  background-color: #e0e0e0;
  border: none;
  outline: none;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 14px;
`;

const ClearBtn = styled.button`
  height: 36px;
  padding: 0 12px;
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #f7f7f7;
  }
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 220px;
  align-items: center;
  padding: 6px 0 10px;
  font-size: 13px;
  color: #333;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr 120px 120px 220px;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.85;
`;

const TitleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const UnreadBadge = styled.span`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  align-self: center;
`;

const Center = styled.div`
  text-align: center;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  padding-top: 12px;
`;

const PageBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 6px;
  opacity: 0.75;
  font-weight: 400;
  text-decoration: none;

  &[data-active="true"] {
    opacity: 1;
    font-weight: 700;
    text-decoration: underline;
  }
`;

const Empty = styled.div`
  padding: 22px 0;
  text-align: center;
  font-size: 14px;
  color: #666;
`;

const BottomRight = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
`;

const MiniOutlineBtn = styled.button`
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f7f7f7;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
`;

const ModalCard = styled.div`
  width: 760px;
  max-width: 95vw;
  background: #ffffff;
  border-radius: 12px;
  padding: 22px;
  box-sizing: border-box;
`;

const ModalTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalBadge = styled.span`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  font-weight: 500;
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  row-gap: 10px;
  column-gap: 12px;
  align-items: center;
`;

const ModalSummary = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 14px;
  line-height: 1.45;
`;

const ModalActions = styled.div`
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
