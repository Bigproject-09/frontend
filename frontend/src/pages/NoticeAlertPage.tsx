import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Global.css";
import { STORAGE_KEY } from "../common/constants";

type NoticeItem = {
  id: number;
  title: string;
  dday: string;
  score: number;
  isRead: boolean;
  url?: string;
  attachurl?: string[]; // 여러개일 경우

  org?: string;
  budget?: string;
  period?: string;
  summary?: string;
};

const FAV_KEY = "bb_notice_favs_v1";
const PAGE_SIZE = 6;

type ReadFilter = "ALL" | "READ" | "UNREAD";
type DdayFilter = "ALL" | "D0_1" | "D2_3" | "D4_7" | "D8PLUS";
type ScoreFilter = "ALL" | "S80" | "S70" | "S60" | "S0";

type TabKey = "ALL" | "HASHTAG" | "FAV";

const DUMMY_ITEMS: NoticeItem[] = [
  {
    id: 1,
    title: "공고 제목",
    dday: "D-7",
    score: 86,
    url: "https://example.com/notice/1",
    attachurl: [
      "첨부파일url",
      "첨부파일2",
      "첨부파일3",
    ],
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
  } catch {}
};

const mergeUniqueById = (base: NoticeItem[], stored: NoticeItem[]) => {
  const map = new Map<number, NoticeItem>();
  [...stored, ...base].forEach((it) => map.set(it.id, it));
  return Array.from(map.values());
};

const loadFavIds = (): number[] => {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as number[]) : [];
  } catch {
    return [];
  }
};

const saveFavIds = (ids: number[]) => {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch {}
};

// 파일명 추출 유틸 함수
const getFileName = (url: string) => {
  try {
    return decodeURIComponent(url.split("/").pop() ?? url);
  } catch {
    return url;
  }
};


const NoticeAlertPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const view = searchParams.get("view");

  const [items, setItems] = useState<NoticeItem[]>(() => {
    const stored = loadStored();
    return mergeUniqueById(DUMMY_ITEMS, stored);
  });

  const [favIds, setFavIds] = useState<number[]>(() => loadFavIds());

  const [tab, setTab] = useState<TabKey>("ALL");

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

  const syncStorage = (next: NoticeItem[]) => {
    setItems(next);
    saveStored(next);
  };

  const toggleFav = (id: number) => {
    setFavIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavIds(next);
      return next;
    });
  };

  const removeItem = (id: number) => {
    const next = items.filter((it) => it.id !== id);
    syncStorage(next);

    setFavIds((prev) => {
      const nextFav = prev.filter((x) => x !== id);
      saveFavIds(nextFav);
      return nextFav;
    });

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
    navigate("/process?view=notice", {
      state: {noticeId: id},
    });
  };

  // 서비스 탭을 통해 들어올 경우
  const handleApply_Service = (id: number) => {
    navigate("/process/analysis", {
      state: {noticeId: id},
    });
  };

  const baseByTab = useMemo(() => {
    if (tab === "ALL") return items;
    if (tab === "FAV") return items.filter((it) => favIds.includes(it.id));
    return []; // HASHTAG: 추후 매칭 로직
  }, [items, favIds, tab]);

  const filtered = useMemo(() => {
    const t = filterText.trim().toLowerCase();
    return baseByTab
      .filter((it) => (t ? it.title.toLowerCase().includes(t) : true))
      .filter(passRead)
      .filter(passDday)
      .filter(passScore);
  }, [baseByTab, filterText, readFilter, ddayFilter, scoreFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const resetToFirstPage = () => setPage(1);

  // ✅ 탭 변경 시: 필터 기본값으로 초기화 + 페이지 1 + 모달 닫기
  const changeTab = (next: TabKey) => {
    setTab(next);
    setSelected(null);

    setFilterText("");
    setReadFilter("ALL");
    setDdayFilter("ALL");
    setScoreFilter("ALL");

    setPage(1);
  };

  return (
    <Shell>
      <Layout>
        {/* 좌측 탭 */}
        <Side>
          {/* <BrandRow>Biz & Busy</BrandRow> */}

          <SideTab type="button" data-active={tab === "ALL"} onClick={() => changeTab("ALL")}>
            전체 공고
          </SideTab>
          <SideTab
            type="button"
            data-active={tab === "HASHTAG"}
            onClick={() => changeTab("HASHTAG")}
          >
            해시태그
          </SideTab>
          <SideTab type="button" data-active={tab === "FAV"} onClick={() => changeTab("FAV")}>
            찜
          </SideTab>
        </Side>

        {/* 우측 콘텐츠 */}
        <Main>
          {/* <Title>공고 알림 페이지</Title> */}
          <Title>공고 목록</Title>

          {/* 필터 */}
          <Section>
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

            {tab === "HASHTAG" && (
              <Hint>
                해시태그 매칭 데이터가 준비되면, 여기서 “내 회사 해시태그와 일치하는 공고만” 보여주게
                됩니다.
              </Hint>
            )}
          </Section>

          {/* 리스트 */}
          <Section>
            <HeaderRow>
              <div style={{ paddingLeft: 54 }}>공고 제목</div>
              <Center>기한</Center>
              <Center>추천점수</Center>
              <ActionHeader>
                <ActionHeaderItem>찜</ActionHeaderItem>
              </ActionHeader>
            </HeaderRow>

            {pagedItems.length === 0 ? (
              <Empty>
                {tab === "HASHTAG"
                  ? "해시태그 매칭 공고가 아직 없습니다."
                  : "조건에 맞는 공고가 없습니다."}
              </Empty>
            ) : (
              pagedItems.map((it) => {
                const isFav = favIds.includes(it.id);
                return (
                  <Row key={it.id}>
                    {/* <DeleteBtn type="button" onClick={() => removeItem(it.id)}>
                      X
                    </DeleteBtn> */}
                    <span style={{ display: "inline-block", width: 20 }} />

                    <TitleButton type="button" onClick={() => openNotice(it)} title="공고 상세 보기">
                      {it.title}
                    </TitleButton>

                    <Center>{it.dday}</Center>
                    <Center>{it.score}</Center>

                    <Actions>
                      {/* 미확인 -> 찜(별) -> 신청 */}
                      {!it.isRead && <UnreadBadge>미확인</UnreadBadge>}

                      {/* 요청: 별이 버튼 정중앙 */}
                      <FavBtn
                        type="button"
                        data-active={isFav}
                        onClick={() => toggleFav(it.id)}
                        aria-label="찜"
                        title={isFav ? "찜 해제" : "찜"}
                      >
                        <FavIcon aria-hidden>{isFav ? "★" : "☆"}</FavIcon>
                      </FavBtn>

                      {view === "notice" && (
                        <MiniBtn type="button" onClick={() => handleApply(it.id)}>
                          신청
                        </MiniBtn>
                      )}
                      {view === "service" && (
                        <MiniBtn type="button" onClick={() => handleApply_Service(it.id)}>
                          신청
                        </MiniBtn>
                      )}

                    </Actions>
                  </Row>
                );
              })
            )}

            <Pagination>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PageBtn key={p} type="button" data-active={p === page} onClick={() => setPage(p)}>
                  {p}
                </PageBtn>
              ))}
            </Pagination>
          </Section>

          {/* ✅ 요청: 신규 공고 등록 버튼은 아래로 */}
          {/* <BottomRight>
            <MiniOutlineBtn type="button" onClick={() => navigate("/notice/new")}>
              신규 공고 등록
            </MiniOutlineBtn>
          </BottomRight> */}
        </Main>
      </Layout>

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

              {/* <div className="label">예산</div>
              <div>{selected.budget ?? "-"}</div> */}

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

              <div className="label">첨부파일 다운로드</div>
              <div>
                {selected.attachurl && selected.attachurl.length > 0 ? (
                  <AttachFileList>
                    {selected.attachurl.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer">
                        {getFileName(url)}
                      </a>
                    ))}
                  </AttachFileList>
                ) : (
                  "-"
                )}
              </div>
            </ModalGrid>

            <ModalSummary>
              <div className="label">요약</div>
              <div style={{ marginTop: 6 }}>{selected.summary ?? "상세 정보가 없습니다."}</div>
            </ModalSummary>

            <ModalActions>
              {view === "notice" && (
              <MiniBtn type="button" onClick={() => handleApply(selected.id)}>
                신청
              </MiniBtn>
              )}
              {view === "service" && (
              <MiniBtn type="button" onClick={() => handleApply_Service(selected.id)}>
                신청
              </MiniBtn>
              )}

              <MiniBtn type="button" onClick={() => setSelected(null)}>
                닫기
              </MiniBtn>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Shell>
  );
};

export default NoticeAlertPage;

/* =========================
   styled-components
========================= */

/* =========================
   styled-components (수정본)
========================= */

const Shell = styled.div`
  width: 100%;
  height: 100vh;
  background-color: var(--color-bg-main);
`;

const Layout = styled.div`
  display: flex;
  height: 100%;
`;

/* 👇 Sidebar.css와 동일 비율 */
const Side = styled.aside`
  width: 240px; /* 300 → 240 추천 */
  background: var(--color-primary);
  color: rgba(255, 255, 255, 0.85);

  border-right: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  display: flex;
  flex-direction: column;
  gap: 6px;
`;


const BrandRow = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-weight: 700;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 10px;
`;

const SideTab = styled.button`
  position: relative;
  width: calc(100% + 14px);
  height: 42px;
  margin-right: -14px;

  display: flex;
  align-items: center;
  padding: 0 20px;

  background: transparent;
  border: none;
  outline: none;

  font-size: 18px;
  text-align: left;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
  }

  &[data-active="true"] {
    background: #ffffff;
    color: var(--color-primary);
    font-weight: 600;
    border-radius: 6px 0 0 6px;
  }
`;


const Main = styled.main`
  flex: 1;
  padding: 60px;      /* 👈 TokenTab Container와 동일 */
  box-sizing: border-box;
`;


const Title = styled.div`
  font-size: 35px;
  font-weight: 800;
  margin-bottom: 14px;
  color: var(--color-primary);
`;

const Section = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 18px;
  box-sizing: border-box;
  margin-bottom: 16px;
  border: 1px solid rgba(0,0,0,0.08);
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  height: 36px;
  background-color: #ffffff;
  border: 1px solid rgba(0,0,0,0.15);
  outline: none;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(46,111,219,0.15);
  }
`;

const ClearBtn = styled.button`
  height: 36px;
  padding: 0 14px;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #f5f7fa;
  }
`;

const Hint = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 260px;
  align-items: center;
  padding: 6px 0 10px;
  font-size: 13px;
  color: #555;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 54px 1fr 120px 120px 260px;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid rgba(0,0,0,0.06);
`;

const ActionHeader = styled.div`
  display: grid;
  grid-template-columns: 196px;
  gap: 10px;
  justify-content: end;
  align-items: center;
  padding-right: 2px;
`;

const ActionHeaderItem = styled.div`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
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
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(46,111,219,0.12);
  color: var(--color-accent);
  font-weight: 600;
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

const FavBtn = styled.button`
  width: 34px;
  height: 34px;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 6px;
  cursor: pointer;
  position: relative;

  &[data-active="true"] {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  &:hover {
    background: #f5f7fa;
  }
`;

const FavIcon = styled.span`
  position: absolute;
  left: 50%;
  top: 45%;

  transform: translate(-50%, -50%);

  font-size: 18px;
  line-height: 1;
  display: block;
`;

const MiniBtn = styled.button`
  width: 72px;
  height: 34px;
  background: var(--color-accent);
  color: var(--color-text-white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: var(--color-accent-hover);
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
  color: #666;

  &[data-active="true"] {
    color: var(--color-accent);
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
  margin-top: 8px;
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
  z-index: 9999;
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
  align-items: start;
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

const AttachFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  a {
    font-size: 14px;
    color: var(--color-accent);
    text-decoration: underline;
    word-break: break-all;

    &:hover {
      opacity: 0.8;
    }
  }
`;

