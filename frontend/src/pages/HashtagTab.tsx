import React, { useMemo, useState } from "react";
import styled from "styled-components";

type NoticeItem = {
  id: number;
  title: string;
  dday: string;
  // score: number;
  isRead: boolean;
  org?: string;
  period?: string;
  hashtags?: string[];
};

type Props = {
  items: NoticeItem[];
  onApply: (id: number) => void;
  onViewNotice: (item: NoticeItem) => void; // ✅ 유지
};

const POPULAR_LIMIT = 12;

/* =========================
   초성 추출 & 그룹화 (위 코드 기능 살림)
========================= */

// 한글 초성 추출 함수
const getKoreanConsonant = (text: string): string => {
  const consonants = [
    "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
    "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
  ];

  const firstChar = text.charAt(0);
  const code = firstChar.charCodeAt(0);

  // 한글 유니코드 범위: 0xAC00(가) ~ 0xD7A3(힣)
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const index = Math.floor((code - 0xAC00) / 588);
    return consonants[index];
  }

  // 영어는 대문자로
  if (/[a-zA-Z]/.test(firstChar)) return firstChar.toUpperCase();

  // 숫자
  if (/[0-9]/.test(firstChar)) return "0-9";

  return "기타";
};

// 초성별로 그룹화
const groupByConsonant = (tagEntries: [string, number][]) => {
  const grouped = new Map<string, [string, number][]>();

  tagEntries.forEach((entry) => {
    const consonant = getKoreanConsonant(entry[0]);
    if (!grouped.has(consonant)) grouped.set(consonant, []);
    grouped.get(consonant)!.push(entry);
  });

  // 각 그룹 내에서 태그명으로 정렬
  grouped.forEach((entries, key) => {
    grouped.set(key, entries.sort((a, b) => a[0].localeCompare(b[0])));
  });

  // 초성 순서대로 정렬
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const order = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    const aIndex = order.indexOf(a[0]);
    const bIndex = order.indexOf(b[0]);

    // 둘 다 한글 초성인 경우
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    // a만 한글 초성인 경우
    if (aIndex !== -1) return -1;
    // b만 한글 초성인 경우
    if (bIndex !== -1) return 1;
    // 둘 다 아닌 경우 (영어, 숫자, 기타)
    return a[0].localeCompare(b[0]);
  });

  return sortedGroups;
};

const HashtagTab: React.FC<Props> = ({ items, onApply, onViewNotice }) => {
  /* =========================
     해시태그 빈도 계산
  ========================= */
  const tagStats = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      it.hashtags?.forEach((tag) => {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]); // 빈도 내림차순
  }, [items]);

  const popularTagEntries = tagStats.slice(0, POPULAR_LIMIT); // [tag, count]
  const allTagEntries = tagStats; // [tag, count]

  // ✅ 전체 해시태그를 초성별로 그룹화 (위 코드 기능)
  const groupedTags = useMemo(() => {
    return groupByConsonant(allTagEntries);
  }, [allTagEntries]);

  /* =========================
     선택 상태
  ========================= */
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelectedTags([]);

  /* =========================
     AND 조건 필터
  ========================= */
  const filteredNotices = useMemo(() => {
    if (selectedTags.length === 0) return [];
    return items.filter((it) =>
      selectedTags.every((tag) => it.hashtags?.includes(tag))
    );
  }, [items, selectedTags]);

  return (
    <>
      {/* 해시태그 선택 */}
      <Section>
        <SectionTitle>해시태그 선택</SectionTitle>

        {tagStats.length === 0 ? (
          <Empty>등록된 해시태그가 없습니다.</Empty>
        ) : (
          <>
            <SubTitle>인기 해시태그</SubTitle>
            <HashtagList>
              {popularTagEntries.map(([tag, count]) => (
                <HashtagBtn
                  key={`popular-${tag}`}
                  data-active={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                  title={`총 ${count}건`}
                >
                  #{tag}
                  <TagCount>{count}</TagCount>
                </HashtagBtn>
              ))}
            </HashtagList>

            {allTagEntries.length > POPULAR_LIMIT && (
              <ToggleBtn type="button" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "▲ 전체 해시태그 접기" : "＋ 전체 해시태그 보기"}
              </ToggleBtn>
            )}

            {showAll && (
              <>
                <Divider />
                <SubTitle>전체 해시태그</SubTitle>

                {/* ✅ 초성 그룹 렌더링 */}
                {groupedTags.map(([consonant, entries]) => (
                  <ConsonantGroup key={consonant}>
                    <ConsonantHeader>{consonant}</ConsonantHeader>
                    <HashtagList>
                      {entries.map(([tag, count]) => (
                        <HashtagBtn
                          key={`all-${tag}`}
                          data-active={selectedTags.includes(tag)}
                          onClick={() => toggleTag(tag)}
                          title={`총 ${count}건`}
                        >
                          #{tag}
                          <TagCount>{count}</TagCount>
                        </HashtagBtn>
                      ))}
                    </HashtagList>
                  </ConsonantGroup>
                ))}
              </>
            )}

            {selectedTags.length > 0 && (
              <SelectedRow>
                <div>
                  선택된 해시태그:
                  {selectedTags.map((t) => (
                    <SelectedTag key={t}>#{t}</SelectedTag>
                  ))}
                </div>
                <ClearBtn type="button" onClick={clearTags}>
                  초기화
                </ClearBtn>
              </SelectedRow>
            )}
          </>
        )}
      </Section>

      {/* 검색 결과 */}
      <Section>
        <SectionTitle>검색 결과</SectionTitle>

        {selectedTags.length === 0 ? (
          <Hint>해시태그를 선택하면 관련 공고가 표시됩니다.</Hint>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((it) => (
            <ResultRow key={it.id}>
              <div>
                <ResultTitle onClick={() => onViewNotice(it)}>
                  {it.title}
                </ResultTitle>
                <Meta>
                  {it.org ?? "-"} · {it.period ?? "-"} · {it.dday}
                </Meta>
                <TagRow>
                  {it.hashtags?.map((t) => (
                    <MiniTag key={`${it.id}-${t}`}>#{t}</MiniTag>
                  ))}
                </TagRow>
              </div>
              <ApplyBtn type="button" onClick={() => onApply(it.id)}>
                신청
              </ApplyBtn>
            </ResultRow>
          ))
        ) : (
          <Empty>
            선택한 해시태그를 <b>모두 포함</b>한 공고가 없습니다.
          </Empty>
        )}
      </Section>
    </>
  );
};

export default HashtagTab;

/* =========================
   styled-components
========================= */

const Section = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #1f2937;
`;

const SubTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin: 10px 0 10px;
`;

const ConsonantGroup = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ConsonantHeader = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: var(--color-accent);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent);
  display: inline-block;
  min-width: 40px;
`;

const HashtagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const HashtagBtn = styled.button`
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #ffffff;
  font-size: 14px;
  cursor: pointer;
  color: #333;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &[data-active="true"] {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: #ffffff;
    font-weight: 700;
  }

  &:hover {
    background: rgba(46, 111, 219, 0.08);
  }

  &[data-active="true"]:hover {
    background: var(--color-accent-hover);
  }
`;

const TagCount = styled.span`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.6);

  ${HashtagBtn}[data-active="true"] & {
    background: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.95);
  }
`;

const ToggleBtn = styled.button`
  margin-top: 14px;
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  margin: 16px 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
`;

const SelectedRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
  flex-wrap: wrap;
`;

const SelectedTag = styled.span`
  margin-left: 8px;
  font-weight: 800;
  color: var(--color-accent);
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
  cursor: pointer;

  &:hover {
    color: var(--color-accent);
    text-decoration: underline;
  }
`;

const Meta = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const MiniTag = styled.span`
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(46, 111, 219, 0.1);
  color: var(--color-accent);
`;

const ApplyBtn = styled.button`
  min-width: 72px;
  height: 36px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    background: var(--color-accent-hover);
  }
`;

const Empty = styled.div`
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
  color: #999;
`;

const Hint = styled.div`
  padding: 32px 0;
  text-align: center;
  font-size: 14px;
  color: #666;
`;
