//NoticeAlertpage.tsx
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";
import { STORAGE_KEY } from "../common/constants";
import React, { useEffect, useMemo, useState } from "react";
import HashtagTab from "./HashtagTab";


type NoticeItem = {
  id: number;
  title: string;
  dday: string;
  score: number;
  isRead: boolean;

  url?: string;
  attachFiles?: Array<{
    fileId: number;
    fileName: string;
    filePath: string;
  }>;
  org?: string;
  period?: string;
  summary?: string;
  hashtags?: string[];
};

const FAV_KEY = "bb_notice_favs_v1";
const PAGE_SIZE = 6;

type ReadFilter = "ALL" | "READ" | "UNREAD";
type DdayFilter = "ALL" | "D0_1" | "D2_3" | "D4_7" | "D8PLUS";
type ScoreFilter = "ALL" | "S80" | "S70" | "S60" | "S0";
type TabKey = "ALL" | "HASHTAG" | "FAV";

/* =========================
   유틸
========================= */
const loadFavIds = (): number[] => {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveFavIds = (ids: number[]) => {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch {}
};

const calcDday = (endDate?: string) => {
  if (!endDate) return "-";

  if (!/\d{4}/.test(endDate)) {
    return endDate;
  }

  let dateStr = endDate;
  if (endDate.includes("~")) {
    const parts = endDate.split("~");
    dateStr = parts[parts.length - 1].trim();
  }

  if (/^\d{8}$/.test(dateStr)) {
    dateStr = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(dateStr);
    end.setHours(0, 0, 0, 0);

    if (isNaN(end.getTime())) {
      return endDate;
    }

    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff < 0) return "마감";
    return `D-${diff}`;
  } catch (e) {
    console.error("D-day 계산 오류:", e, dateStr);
    return endDate;
  }
};

const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  pages.push(1);

  if (currentPage <= 5) {
    for (let i = 2; i <= 10; i++) {
      pages.push(i);
    }
    pages.push("...");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 4) {
    pages.push("...");
    for (let i = totalPages - 9; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push("...");
    for (let i = currentPage - 3; i <= currentPage + 3; i++) {
      pages.push(i);
    }
    pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};

/* =========================
   컴포넌트
========================= */
const NoticeAlertPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<NoticeItem[]>([]);
  const [favIds, setFavIds] = useState<number[]>(loadFavIds);
  const [tab, setTab] = useState<TabKey>("ALL");

  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");
  const [ddayFilter, setDdayFilter] = useState<DdayFilter>("ALL");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("ALL");
  const [filterText, setFilterText] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<NoticeItem | null>(null);

  /* =========================
     목록 조회
  ========================= */
  useEffect(() => {
    fetch("/api/notices?size=1000&sort=noticeId,asc")
      .then((res) => res.json())
      .then((data) => {
        const list = data.content ?? data;

        const normalized: NoticeItem[] = list.map((n: any) => ({
          id: n.noticeId,
          title: n.title,
          score: n.score ?? 0,
          isRead: false,
          dday: calcDday(n.reqstDt),
          hashtags: n.hashtags ?? [],
          org: n.excInsttNm ?? "-",
          period: n.reqstDt ?? "-",
        }));

        setItems(normalized);
      })
      .catch(console.error);
  }, []);

  /* =========================
     필터
  ========================= */
  const parseDday = (dday: string) => {
    const n = Number(dday.replace("D-", ""));
    return Number.isNaN(n) ? 9999 : n;
  };

  const passRead = (it: NoticeItem) =>
    readFilter === "ALL"
      ? true
      : readFilter === "READ"
      ? it.isRead
      : !it.isRead;

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

  /* =========================
     상세 열기
  ========================= */
  const openNotice = async (notice: NoticeItem) => {
    try {
      const res = await fetch(`/api/notices/${notice.id}`);
      const d = await res.json();

      const stripHtml = (html: string) => {
        if (!html) return "-";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "-";
      };

      const attachFiles = (d.files || []).map((file: any) => ({
        fileId: file.fileId,
        fileName: file.fileName,
        filePath: file.filePath,
      }));

      setSelected({
        ...notice,
        isRead: true,
        org: d.author || d.excInsttNm || "-",
        period: d.reqstDt || "-",
        url: d.link || "-",
        summary: stripHtml(d.description),
        attachFiles: attachFiles,
        hashtags: d.hashtags || [],
      });

      setItems((prev) =>
        prev.map((it) =>
          it.id === notice.id ? { ...it, isRead: true } : it
        )
      );
    } catch (e) {
      console.error("공고 상세 조회 오류:", e);
    }
  };

  const toggleFav = (id: number) => {
    setFavIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveFavIds(next);
      return next;
    });
  };

  const handleApply = (id: number) => {
    navigate("/process", { state: { noticeId: id } });
  };

  const handleClearFilters = () => {
    setReadFilter("ALL");
    setDdayFilter("ALL");
    setScoreFilter("ALL");
    setFilterText("");
  };

  const handleFileDownload = (noticeId: number, fileId: number, fileName: string) => {
    const downloadUrl = `/api/notices/${noticeId}/files/${fileId}/download`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* =========================
     렌더링 데이터
  ========================= */
  const baseByTab = useMemo(() => {
    if (tab === "ALL") return items;
    if (tab === "FAV") return items.filter((it) => favIds.includes(it.id));
    return [];
  }, [items, favIds, tab]);

  const filtered = useMemo(() => {
    const t = filterText.trim().toLowerCase();
    return baseByTab
      .filter((it) => (t ? it.title.toLowerCase().includes(t) : true))
      .filter(passRead)
      .filter(passDday)
      .filter(passScore);
  }, [baseByTab, filterText, readFilter, ddayFilter, scoreFilter]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageNumbers = getPageNumbers(page, totalPages);

  // ✅ 제목 텍스트 동적 변경
  const getTitleText = () => {
    if (tab === "HASHTAG") return "해시태그";
    if (tab === "FAV") return "찜";
    return "공고 목록";
  };

  /* =========================
     JSX
  ========================= */
  return (
    <Shell>
      <Layout>
        <Side>
          <SideTab data-active={tab === "ALL"} onClick={() => setTab("ALL")}>
            전체 공고
          </SideTab>
          <SideTab data-active={tab === "HASHTAG"} onClick={() => setTab("HASHTAG")}>
            해시태그
          </SideTab>
          <SideTab data-active={tab === "FAV"} onClick={() => setTab("FAV")}>
            찜
          </SideTab>
        </Side>

        <Main>
          {/* ✅ 동적 제목 */}
          <Title>{getTitleText()}</Title>

          {tab !== "HASHTAG" && (
            <Section>
              <FilterRow>
                <SearchInput
                  type="text"
                  placeholder="공고 제목 검색"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
                <Select
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
                >
                  <option value="ALL">전체</option>
                  <option value="READ">읽음</option>
                  <option value="UNREAD">읽지 않음</option>
                </Select>
                <Select
                  value={ddayFilter}
                  onChange={(e) => setDdayFilter(e.target.value as DdayFilter)}
                >
                  <option value="ALL">마감일 전체</option>
                  <option value="D0_1">D-0 ~ D-1</option>
                  <option value="D2_3">D-2 ~ D-3</option>
                  <option value="D4_7">D-4 ~ D-7</option>
                  <option value="D8PLUS">D-8 이상</option>
                </Select>
                <Select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
                >
                  <option value="ALL">점수 전체</option>
                  <option value="S80">80점 이상</option>
                  <option value="S70">70점대</option>
                  <option value="S60">60점대</option>
                  <option value="S0">60점 미만</option>
                </Select>
                <ClearBtn onClick={handleClearFilters}>초기화</ClearBtn>
              </FilterRow>
            </Section>
          )}

          {tab === "HASHTAG" ? (
            <HashtagTab
              items={items}
              onApply={handleApply}
              onViewNotice={openNotice}  // ✅ 추가
            />
          ) : (
            <Section>
              <HeaderRow>
                <div>공고 제목</div>
                <Center>기한</Center>
                <Center>추천점수</Center>
                <ActionHeader>
                  <ActionHeaderItem>찜</ActionHeaderItem>
                </ActionHeader>
              </HeaderRow>

              {pagedItems.length > 0 ? (
                pagedItems.map((it) => {
                  const isFav = favIds.includes(it.id);
                  return (
                    <Row key={it.id}>
                      <TitleButton onClick={() => openNotice(it)}>
                        {it.title}
                      </TitleButton>
                      <Center>{it.dday}</Center>
                      <Center>{it.score}</Center>
                      <Actions>
                        {!it.isRead && <UnreadBadge>미확인</UnreadBadge>}
                        <FavBtn
                          data-active={isFav}
                          onClick={() => toggleFav(it.id)}
                        >
                          <FavIcon>{isFav ? "★" : "☆"}</FavIcon>
                        </FavBtn>
                        <MiniBtn onClick={() => handleApply(it.id)}>
                          신청
                        </MiniBtn>
                      </Actions>
                    </Row>
                  );
                })
              ) : (
                <Empty>조건에 맞는 공고가 없습니다.</Empty>
              )}

              {totalPages > 1 && (
                <Pagination>
                  <PageBtn
                    disabled={page === 1}
                    onClick={() => page > 1 && setPage(page - 1)}
                  >
                    ‹
                  </PageBtn>

                  {pageNumbers.map((p, idx) => {
                    if (p === "...") {
                      return <Ellipsis key={`ellipsis-${idx}`}>...</Ellipsis>;
                    }
                    return (
                      <PageBtn
                        key={p}
                        data-active={p === page}
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </PageBtn>
                    );
                  })}

                  <PageBtn
                    disabled={page === totalPages}
                    onClick={() => page < totalPages && setPage(page + 1)}
                  >
                    ›
                  </PageBtn>
                </Pagination>
              )}
            </Section>
          )}

        </Main>
      </Layout>

      {selected && (
        <ModalOverlay onClick={() => setSelected(null)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{selected.title}</ModalTitle>

            <ModalGrid>
              <React.Fragment key="org">
                <div className="label">기관</div>
                <div>{selected.org ?? "-"}</div>
              </React.Fragment>

              <React.Fragment key="period">
                <div className="label">기간</div>
                <div>
                  {selected.period ?? "-"}
                  {selected.dday && selected.dday !== "-" && (
                    <span style={{ marginLeft: "12px", fontWeight: "600", color: "var(--color-accent)" }}>
                      ({selected.dday})
                    </span>
                  )}
                </div>
              </React.Fragment>

              <React.Fragment key="url">
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
              </React.Fragment>

              {selected.hashtags && selected.hashtags.length > 0 && (
                <React.Fragment key="hashtags">
                  <div className="label">해시태그</div>
                  <HashtagContainer>
                    {selected.hashtags.map((tag, i) => (
                      <HashtagBadge key={i}>#{tag}</HashtagBadge>
                    ))}
                  </HashtagContainer>
                </React.Fragment>
              )}

              <React.Fragment key="attachments">
                <div className="label">첨부파일 다운로드</div>
                <div>
                  {selected.attachFiles && selected.attachFiles.length > 0 ? (
                    <AttachFileList>
                      {selected.attachFiles.map((file) => (
                        <AttachFileButton
                          key={file.fileId}
                          onClick={() => handleFileDownload(selected.id, file.fileId, file.fileName)}
                        >
                          📄 {file.fileName}
                        </AttachFileButton>
                      ))}
                    </AttachFileList>
                  ) : (
                    "-"
                  )}
                </div>
              </React.Fragment>
            </ModalGrid>

            <ModalSummary>
              <div className="label">요약</div>
              <div>{selected.summary ?? "-"}</div>
            </ModalSummary>

            <ModalActions>
              <MiniBtn onClick={() => handleApply(selected.id)}>신청</MiniBtn>
              <MiniBtn onClick={() => setSelected(null)}>닫기</MiniBtn>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Shell>
  );
};

export default NoticeAlertPage;

/* styled-components는 동일 */
const Shell = styled.div`
  width: 100%;
  height: 100vh;
  background-color: var(--color-bg-main);
`;

const Layout = styled.div`
  display: flex;
  height: 100%;
`;

const Side = styled.aside`
  width: 240px;
  background: var(--color-primary);
  color: rgba(255, 255, 255, 0.85);
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  padding: 60px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const Title = styled.div`
  font-size: 35px;
  font-weight: 800;
  margin-bottom: 24px;
  color: var(--color-primary);
`;

const Section = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  box-sizing: border-box;
  margin-bottom: 20px;
  border: 1px solid rgba(0,0,0,0.08);
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 6px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(46,111,219,0.15);
  }

  &::placeholder {
    color: rgba(0,0,0,0.4);
  }
`;

const Select = styled.select`
  height: 40px;
  background-color: #ffffff;
  border: 1px solid rgba(0,0,0,0.15);
  outline: none;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(46,111,219,0.15);
  }
`;

const ClearBtn = styled.button`
  height: 40px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f5f7fa;
  }
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 260px;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid rgba(0,0,0,0.1);
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 260px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const ActionHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 2px;
`;

const ActionHeaderItem = styled.div`
  font-size: 14px;
  color: #333;
  text-align: center;
  font-weight: 600;
`;

const TitleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  padding: 0;
  color: #333;

  &:hover {
    text-decoration: underline;
    color: var(--color-accent);
  }
`;

const UnreadBadge = styled.span`
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(46,111,219,0.12);
  color: var(--color-accent);
  font-weight: 600;
`;

const Center = styled.div`
  text-align: center;
  font-size: 14px;
  color: #333;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
`;

const FavBtn = styled.button`
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 6px;
  cursor: pointer;
  position: relative;

  &[data-active="true"] {
    border-color: var(--color-accent);
    background: rgba(46,111,219,0.05);
  }

  &:hover {
    background: #f5f7fa;
  }

  &[data-active="true"]:hover {
    background: rgba(46,111,219,0.1);
  }
`;

const FavIcon = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  line-height: 1;
  display: block;
  color: var(--color-accent);
`;

const MiniBtn = styled.button`
  width: 72px;
  height: 36px;
  background: var(--color-accent);
  color: var(--color-text-white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: var(--color-accent-hover);
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding-top: 20px;
  margin-top: 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
`;

const PageBtn = styled.button<{ disabled?: boolean }>`
  min-width: 32px;
  height: 32px;
  background: none;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  padding: 0 8px;
  color: #666;

  &:hover:not(:disabled) {
    background: #f5f7fa;
  }

  &[data-active="true"] {
    background: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
    font-weight: 600;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Ellipsis = styled.span`
  padding: 0 4px;
  color: #999;
  font-size: 14px;
`;

const Empty = styled.div`
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
  color: #999;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
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
  max-height: 90vh;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const ModalTitle = styled.div`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  row-gap: 14px;
  column-gap: 16px;
  align-items: start;

  .label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
  }

  div:not(.label) {
    color: #333;
    font-size: 14px;
    word-break: break-word;
  }

  a {
    color: var(--color-accent);
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const ModalSummary = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);

  .label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
    margin-bottom: 8px;
  }

  div:not(.label) {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }
`;

const ModalActions = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const AttachFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AttachFileButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: var(--color-accent);
  text-decoration: underline;
  word-break: break-all;
  text-align: left;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const HashtagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const HashtagBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background: rgba(46, 111, 219, 0.1);
  color: var(--color-accent);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
`;