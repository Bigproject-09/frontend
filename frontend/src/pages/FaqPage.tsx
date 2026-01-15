import React, { useMemo, useState } from "react";
import styled from "styled-components";
import "../styles/Global.css";

type FaqCategory = "전체" | "계정" | "공고" | "서류" | "결제" | "기술" | "기타";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: Exclude<FaqCategory, "전체">;
  createdAt: string; // YYYY-MM-DD
  views: number;
  isPinned?: boolean;
};

const FAQ_KEY = "bb_faq_v1";
const PAGE_SIZE = 8;

const DUMMY_FAQ: FaqItem[] = [
  {
    id: 1,
    question: "해시태그 매칭은 어떤 기준으로 되나요?",
    answer:
      "공고 해시태그와 조직(회사) 해시태그를 기준으로 키워드 포함/동의어 사전을 적용해 매칭합니다. (데모) 실제 운영에서는 유사도 점수(임베딩) + 룰 기반(필수키워드) 혼합을 권장합니다.",
    category: "공고",
    createdAt: "2026-01-14",
    views: 18,
    isPinned: true,
  },
  {
    id: 2,
    question: "찜한 공고가 갑자기 사라져요",
    answer:
      "로컬스토리지 키가 변경되었거나 초기화 로직에서 덮어쓰는 경우가 많습니다. 1) 저장 키 이름 확인 2) merge 순서 확인 3) 저장 함수 호출 위치 점검이 필요합니다.",
    category: "기술",
    createdAt: "2026-01-13",
    views: 42,
  },
  {
    id: 3,
    question: "신규 공고 등록 시 URL은 필수인가요?",
    answer:
      "필수는 아닙니다. 폼 검증(validation)에서 url 필수 체크를 제거하면 URL 없이도 등록되도록 처리할 수 있습니다.",
    category: "공고",
    createdAt: "2026-01-12",
    views: 11,
  },
  {
    id: 4,
    question: "서류 자동 요약 길이를 조절할 수 있나요?",
    answer:
      "가능합니다. 요약 프롬프트에 '목표 길이(문장 수/토큰 수)'를 명시하거나, '핵심 bullet 5개' 같은 형식 제약을 주면 길이가 안정화됩니다.",
    category: "서류",
    createdAt: "2026-01-10",
    views: 7,
  },
  {
    id: 5,
    question: "결제 영수증/세금계산서는 어디서 확인하나요?",
    answer:
      "결제 내역 페이지에서 영수증 다운로드 버튼을 제공하는 형태가 일반적입니다. (데모) 실제 연동 시에는 PG사 대시보드/웹훅 기반으로 발행 상태를 동기화합니다.",
    category: "결제",
    createdAt: "2026-01-09",
    views: 4,
  },
];

const loadFaq = (): FaqItem[] => {
  try {
    const raw = localStorage.getItem(FAQ_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FaqItem[]) : [];
  } catch {
    return [];
  }
};

const saveFaq = (list: FaqItem[]) => {
  try {
    localStorage.setItem(FAQ_KEY, JSON.stringify(list));
  } catch {}
};

const mergeById = (base: FaqItem[], stored: FaqItem[]) => {
  const map = new Map<number, FaqItem>();
  // stored가 있으면 stored 우선 유지
  [...base, ...stored].forEach((it) => map.set(it.id, it));
  return Array.from(map.values());
};

const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function truncate(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "..." : s;
}

const FaqPage: React.FC = () => {
  const [items, setItems] = useState<FaqItem[]>(() => {
    const stored = loadFaq();
    return mergeById(DUMMY_FAQ, stored);
  });

  // 필터/검색
  const [category, setCategory] = useState<FaqCategory>("전체");
  const [keyword, setKeyword] = useState("");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [page, setPage] = useState(1);

  // 펼침(아코디언)
  const [openId, setOpenId] = useState<number | null>(null);

  // 등록/수정 모달
  const [editorOpen, setEditorOpen] = useState(false);
  const [editMode, setEditMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formCategory, setFormCategory] = useState<Exclude<FaqCategory, "전체">>("기타");
  const [formQ, setFormQ] = useState("");
  const [formA, setFormA] = useState("");

  const sync = (next: FaqItem[]) => {
    setItems(next);
    saveFaq(next);
  };

  const resetToFirstPage = () => setPage(1);

  const filtered = useMemo(() => {
    const t = keyword.trim().toLowerCase();
    return items
      .filter((it) => (onlyPinned ? !!it.isPinned : true))
      .filter((it) => (category === "전체" ? true : it.category === category))
      .filter((it) => {
        if (!t) return true;
        const hay = `${it.question} ${it.answer} ${it.category}`.toLowerCase();
        return hay.includes(t);
      })
      .sort((a, b) => {
        const ap = a.isPinned ? 1 : 0;
        const bp = b.isPinned ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [items, keyword, category, onlyPinned]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleOpen = (it: FaqItem) => {
    // 조회수 +1
    const next = items.map((x) => (x.id === it.id ? { ...x, views: x.views + 1 } : x));
    sync(next);

    setOpenId((prev) => (prev === it.id ? null : it.id));
  };

  const togglePin = (id: number) => {
    const next = items.map((it) => (it.id === id ? { ...it, isPinned: !it.isPinned } : it));
    sync(next);
  };

  const removeItem = (id: number) => {
    const next = items.filter((it) => it.id !== id);
    sync(next);
    if (openId === id) setOpenId(null);
  };

  const openCreate = () => {
    setEditMode("CREATE");
    setEditingId(null);
    setFormCategory("기타");
    setFormQ("");
    setFormA("");
    setEditorOpen(true);
  };

  const openEdit = (it: FaqItem) => {
    setEditMode("EDIT");
    setEditingId(it.id);
    setFormCategory(it.category);
    setFormQ(it.question);
    setFormA(it.answer);
    setEditorOpen(true);
  };

  const submitEditor = () => {
    const q = formQ.trim();
    const a = formA.trim();
    if (!q || !a) return;

    if (editMode === "CREATE") {
      const maxId = items.reduce((m, it) => Math.max(m, it.id), 0);
      const nextItem: FaqItem = {
        id: maxId + 1,
        question: q,
        answer: a,
        category: formCategory,
        createdAt: todayISO(),
        views: 0,
        isPinned: false,
      };
      // 새 항목은 위로 (FAQ 운영 편의)
      const next = [nextItem, ...items];
      sync(next);
    } else {
      if (editingId == null) return;
      const next = items.map((it) =>
        it.id === editingId
          ? {
              ...it,
              question: q,
              answer: a,
              category: formCategory,
              // createdAt을 "수정일"로 쓰고 싶으면 아래 유지 / 원하면 제거
              createdAt: todayISO(),
            }
          : it
      );
      sync(next);
    }

    setEditorOpen(false);
    setEditingId(null);
    setFormQ("");
    setFormA("");
    setFormCategory("기타");
  };

  return (
    <Shell>
      <Main>
        <TopBar>
          <Title>FAQ</Title>
        </TopBar>

        {/* 필터 */}
        <Section>
          <FilterRow>
            <input
              className="input"
              style={{ width: 360 }}
              placeholder="검색 (질문/답변/카테고리)"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                resetToFirstPage();
              }}
            />

            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as FaqCategory);
                resetToFirstPage();
              }}
            >
              {(["전체", "계정", "공고", "서류", "결제", "기술", "기타"] as FaqCategory[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <CheckWrap>
              <input
                type="checkbox"
                checked={onlyPinned}
                onChange={(e) => {
                  setOnlyPinned(e.target.checked);
                  resetToFirstPage();
                }}
              />
              <span>고정만</span>
            </CheckWrap>

            <ClearBtn
              type="button"
              onClick={() => {
                setKeyword("");
                setCategory("전체");
                setOnlyPinned(false);
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
            <div style={{ paddingLeft: 54 }}>질문</div>
            <Center>카테고리</Center>
            <Center>조회</Center>
            <Center>등록일</Center>
            <ActionHeader>
              <ActionHeaderItem>고정</ActionHeaderItem>
              <ActionHeaderItem>수정</ActionHeaderItem>
              <ActionHeaderItem>삭제</ActionHeaderItem>
            </ActionHeader>
          </HeaderRow>

          {paged.length === 0 ? (
            <Empty>조건에 맞는 FAQ가 없습니다.</Empty>
          ) : (
            paged.map((it) => {
              const isOpen = openId === it.id;
              return (
                <FaqRow key={it.id} data-open={isOpen}>
                  <DeleteBtn type="button" onClick={() => removeItem(it.id)} title="삭제">
                    X
                  </DeleteBtn>

                  <QBlock type="button" onClick={() => toggleOpen(it)} title="펼치기/접기">
                    <QTitleLine>
                      {it.isPinned && <PinBadge>고정</PinBadge>}
                      {it.question}
                    </QTitleLine>
                    <QSubLine>{truncate(it.answer, 70)}</QSubLine>

                    {isOpen && (
                      <AnswerArea>
                        <div className="label">답변</div>
                        <div className="content">{it.answer}</div>
                      </AnswerArea>
                    )}
                  </QBlock>

                  <Center>{it.category}</Center>
                  <Center>{it.views}</Center>
                  <Center>{it.createdAt}</Center>

                  <Actions>
                    <MiniBtn type="button" onClick={() => togglePin(it.id)}>
                      {it.isPinned ? "📌" : "—"}
                    </MiniBtn>
                    <MiniBtn type="button" onClick={() => openEdit(it)}>
                      수정
                    </MiniBtn>
                    <MiniDangerBtn type="button" onClick={() => removeItem(it.id)}>
                      삭제
                    </MiniDangerBtn>
                  </Actions>
                </FaqRow>
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

        <BottomBar>
          <MiniOutlineBtn type="button" onClick={openCreate}>
            FAQ 등록
          </MiniOutlineBtn>
        </BottomBar>
      </Main>

      {/* 등록/수정 모달 */}
      {editorOpen && (
        <ModalOverlay onClick={() => setEditorOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editMode === "CREATE" ? "FAQ 등록" : "FAQ 수정"}</ModalTitle>

            <ModalForm>
              <div className="label">카테고리</div>
              <div>
                <Select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Exclude<FaqCategory, "전체">)}
                >
                  {(["계정", "공고", "서류", "결제", "기술", "기타"] as Exclude<FaqCategory, "전체">[]).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </Select>
              </div>

              <div className="label">질문</div>
              <div>
                <input
                  className="input"
                  placeholder="FAQ 질문"
                  value={formQ}
                  onChange={(e) => setFormQ(e.target.value)}
                />
              </div>

              <div className="label">답변</div>
              <div>
                <TextArea
                  placeholder="FAQ 답변을 입력하세요"
                  value={formA}
                  onChange={(e) => setFormA(e.target.value)}
                />
              </div>
            </ModalForm>

            <ModalActions>
              <MiniBtn type="button" onClick={submitEditor}>
                저장
              </MiniBtn>
              <MiniBtn type="button" onClick={() => setEditorOpen(false)}>
                닫기
              </MiniBtn>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Shell>
  );
};

export default FaqPage;

/* =========================
   styled-components
========================= */

const Shell = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #d9d9d9;
  box-sizing: border-box;
`;

const Main = styled.main`
  padding: 24px;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 900;
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

const CheckWrap = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.75);

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
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
  grid-template-columns: 1fr 120px 90px 120px 270px;
  align-items: center;
  padding: 6px 0 10px;
  font-size: 13px;
  color: #333;
`;

const FaqRow = styled.div`
  display: grid;
  grid-template-columns: 54px 1fr 120px 90px 120px 270px;
  align-items: start;
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
`;

const Center = styled.div`
  text-align: center;
  font-size: 14px;
  padding-top: 8px;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.85;
  padding-top: 8px;
`;

const QBlock = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
  width: 100%;
`;

const QTitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
`;

const QSubLine = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
`;

const AnswerArea = styled.div`
  margin-top: 12px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;

  .label {
    font-size: 12px;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 8px;
  }

  .content {
    font-size: 14px;
    line-height: 1.55;
    white-space: pre-wrap;
  }
`;

const PinBadge = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  font-weight: 700;
`;

const ActionHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 80px 80px;
  gap: 10px;
  justify-content: end;
  align-items: center;
`;

const ActionHeaderItem = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
  padding-top: 6px;
`;

const MiniBtn = styled.button`
  width: 80px;
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

const MiniDangerBtn = styled(MiniBtn)`
  border-color: rgba(0, 0, 0, 0.2);
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

  &[data-active="true"] {
    opacity: 1;
    font-weight: 800;
    text-decoration: underline;
  }
`;

const Empty = styled.div`
  padding: 22px 0;
  text-align: center;
  font-size: 14px;
  color: #666;
`;

const BottomBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
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
  width: 840px;
  max-width: 95vw;
  background: #ffffff;
  border-radius: 12px;
  padding: 22px;
  box-sizing: border-box;
`;

const ModalTitle = styled.div`
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalForm = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px 12px;
  align-items: center;

  .label {
    font-size: 12px;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.65);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.55;
  outline: none;

  &:focus {
    border-color: rgba(0, 0, 0, 0.25);
  }
`;

const ModalActions = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
