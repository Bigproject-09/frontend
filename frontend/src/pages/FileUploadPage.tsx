import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import "../styles/Global.css";

type Slot = {
  id: string;
  file: File | null;
};

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const FileUploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // slots가 비어있으면 "초기 화면(왼쪽 이미지)"로 간주
  const [slots, setSlots] = useState<Slot[]>([]);

  // 드래그 하이라이트(행 단위)
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [dragOverEmpty, setDragOverEmpty] = useState(false);

  const hasAnyFile = useMemo(() => slots.some((s) => s.file), [slots]);

  const ensureTrailingEmpty = (arr: Slot[]) => {
    // 마지막이 file=null인 슬롯이 없으면 하나 추가
    if (arr.length === 0) return arr;
    const last = arr[arr.length - 1];
    if (last.file !== null) arr.push({ id: uid(), file: null });
    return arr;
  };

  const normalizeEmptyState = (arr: Slot[]) => {
    // 파일이 하나도 없으면 slots를 []로 만들어 초기 화면으로 돌림
    const any = arr.some((s) => s.file);
    if (!any) return [];
    return ensureTrailingEmpty(arr);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const addFilesToSlots = (files: File[], startIndex?: number) => {
    if (!files.length) return;

    setSlots((prev) => {
      let next = [...prev];

      // 초기 화면(아무 슬롯 없음)에서 파일 들어오면 슬롯 생성
      if (next.length === 0) {
        next = files.map((f) => ({ id: uid(), file: f }));
        next.push({ id: uid(), file: null }); // 다음 입력을 위한 빈 줄
        return next;
      }

      // startIndex가 없으면 "첫 빈 슬롯"부터 채우기
      let idx =
        typeof startIndex === "number"
          ? startIndex
          : next.findIndex((s) => s.file === null);

      if (idx < 0) idx = next.length; // 빈 슬롯이 없으면 맨 끝부터

      // 필요한 만큼 슬롯 확장
      const need = idx + files.length;
      while (next.length < need) next.push({ id: uid(), file: null });

      // 채우기(연속)
      files.forEach((f, i) => {
        next[idx + i] = { ...next[idx + i], file: f };
      });

      // 마지막 빈 줄 보장 + 파일 0개면 초기 화면 처리
      return normalizeEmptyState(next);
    });
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    addFilesToSlots(list);
    // 같은 파일 다시 선택 가능하도록 초기화
    e.target.value = "";
  };

  const removeAt = (slotId: string) => {
    setSlots((prev) => {
      const next = prev.map((s) => (s.id === slotId ? { ...s, file: null } : s));

      // 뒤쪽 연속 빈 슬롯 정리: 맨 끝에 빈 슬롯 1개만 남기기
      // (단, 파일이 하나도 없으면 []로)
      // 1) 파일이 있는 슬롯만 남기고
      const withFiles = next.filter((s) => s.file !== null);
      if (withFiles.length === 0) return [];

      // 2) 파일 슬롯 뒤에 빈 슬롯 1개 붙이기
      return [...withFiles, { id: uid(), file: null }];
    });
  };

  const submitFiles = () => {
    const files = slots.filter((s) => s.file).map((s) => s.file!) as File[];
    if (files.length === 0) {
      alert("첨부할 파일이 없습니다.");
      return;
    }

    // TODO: API 연동 시 여기서 FormData로 업로드하면 됨
    // const fd = new FormData();
    // files.forEach(f => fd.append("files", f));
    console.log("제출 파일:", files);

    alert(`총 ${files.length}개 파일 제출(콘솔 확인)`);
  };

  // ---------------------------
  // 드래그&드롭 (초기 화면)
  // ---------------------------
  const onEmptyDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverEmpty(true);
  };
  const onEmptyDragLeave = () => setDragOverEmpty(false);
  const onEmptyDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverEmpty(false);
    const files = Array.from(e.dataTransfer.files || []);
    addFilesToSlots(files);
  };

  // ---------------------------
  // 드래그&드롭 (행 단위)
  // ---------------------------
  const onRowDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlotId(slotId);
  };
  const onRowDragLeave = () => setDragOverSlotId(null);
  const onRowDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setDragOverSlotId(null);
    const files = Array.from(e.dataTransfer.files || []);
    addFilesToSlots(files, slotIndex);
  };

  return (
    <Page>
      <Card>
        <div className="title" style={{ marginLeft: 0, marginBottom: 18 }}>
          문서 파싱 페이지
        </div>

        {!hasAnyFile ? (
          // 초기 화면
          <EmptyStage
            data-dragover={dragOverEmpty}
            onDragOver={onEmptyDragOver}
            onDragLeave={onEmptyDragLeave}
            onDrop={onEmptyDrop}
          >
            <BigBtn type="button" onClick={openFilePicker}>
              파일 등록
            </BigBtn>
            <Hint>또는 파일을 여기에 두기</Hint>

            <Guide>
              텍스트 추출이 어려운 이미지 위주의 파일은
              <br />
              성능이 떨어질 수 있습니다
              <br />
              느낌의 안내말
            </Guide>
          </EmptyStage>
        ) : (
          // 파일 1개 이상일 때 리스트 화면
          <ListStage>
            <ListPanel>
              <ListHeader>파일명</ListHeader>

              <Rows>
                {slots.map((slot, idx) => (
                  <Row
                    key={slot.id}
                    data-dragover={dragOverSlotId === slot.id}
                    onDragOver={(e) => onRowDragOver(e, slot.id)}
                    onDragLeave={onRowDragLeave}
                    onDrop={(e) => onRowDrop(e, idx)}
                    onClick={() => {
                      // 빈 행 클릭 시 파일 선택해서 해당 행부터 채우고 싶으면:
                      // -> "한번에 여러개 선택"하면 해당 행부터 순서대로 들어감
                      if (slot.file === null) {
                        // 파일 피커 열고, 선택 후 "현재 idx부터" 채우려면
                        // 기본 input은 startIndex를 못 받으니,
                        // 간단하게: 한번 클릭으로는 전체 add(첫 빈칸부터)로 두고,
                        // 드롭으로 행지정 기능을 쓰는 방식도 OK.
                        // 여기서는 UX 편의로: 빈 행 클릭해도 그냥 파일 피커 열기
                        openFilePicker();
                      }
                    }}
                    title="이 행에 파일 드롭 가능"
                  >
                    <FileName>
                      {slot.file ? slot.file.name : <Placeholder>여기에 파일을 드래그해서 추가</Placeholder>}
                    </FileName>

                    <RowActions>
                      {slot.file ? (
                        <SmallGhostBtn type="button" onClick={() => removeAt(slot.id)}>
                          삭제
                        </SmallGhostBtn>
                      ) : (
                        <SmallGhostBtn type="button" onClick={openFilePicker}>
                          선택
                        </SmallGhostBtn>
                      )}
                    </RowActions>
                  </Row>
                ))}
              </Rows>

              <SubmitArea>
                <SmallBtn type="button" onClick={submitFiles}>
                  첨부파일 제출
                </SmallBtn>
              </SubmitArea>
            </ListPanel>
          </ListStage>
        )}

        {/* 숨김 파일 input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          // 필요하면 확장자 제한
          // accept=".hwp,.hwpx,.pdf,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={onPickFiles}
        />
      </Card>
    </Page>
  );
};

export default FileUploadPage;

/* =========================
   styled-components
========================= */

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

/* 초기 화면 */
const EmptyStage = styled.div`
  height: 520px;
  border-radius: 12px;
  background: #ffffff;
  border: 2px dashed rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;

  &[data-dragover="true"] {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.22);
  }
`;

const BigBtn = styled.button`
  width: 260px;
  height: 62px;
  background: #f5f5f7;
  border: 1px solid rgba(0, 0, 0, 0.28);
  border-radius: 2px;
  cursor: pointer;
  font-size: 22px;
  font-weight: 600;

  &:hover {
    background: #eeeeef;
  }
`;

const Hint = styled.div`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
`;

const Guide = styled.div`
  margin-top: 52px;
  text-align: center;
  font-size: 14px;
  line-height: 1.45;
  color: rgba(0, 0, 0, 0.7);
`;

/* 리스트 화면 */
const ListStage = styled.div`
  margin-top: 8px;
`;

const ListPanel = styled.div`
  position: relative;     
  margin-top: 14px;
  background: #d9d9d9;
  border-radius: 0px;
  padding: 26px 28px;
  padding-bottom: 90px; 
  min-height: 520px;
  box-sizing: border-box;
`;


const ListHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: default;

  &[data-dragover="true"] {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.18);
  }
`;

const FileName = styled.div`
  font-size: 14px;
`;

const Placeholder = styled.span`
  color: rgba(0, 0, 0, 0.55);
`;

const RowActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SubmitArea = styled.div`
  position: absolute;
  display: flex;
  justify-content: flex-end;
  right: 28px;
  bottom: 28px;
`;

/* 버튼 */
const SmallBtn = styled.button`
  width: 130px;
  height: 40px;
  background: #f5f5f7;
  border: 1px solid rgba(0, 0, 0, 0.28);
  border-radius: 2px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    background: #eeeeef;
  }
`;

const SmallGhostBtn = styled.button`
  width: 64px;
  height: 34px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 2px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #f7f7f7;
  }
`;
