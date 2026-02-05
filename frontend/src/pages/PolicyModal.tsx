import styled from "styled-components";
import { useEffect } from "react";

type Props = {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
};

const PolicyModal = ({ title, content, onClose }: Props) => {

    // ⭐ 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>{title}</h2>
          <button onClick={onClose}>✕</button>
        </Header>

        <Content>
          {content}
        </Content>
      </ModalBox>
    </Overlay>
  );
};

export default PolicyModal;

/* ===== styled-components ===== */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  width: 640px;
  max-height: 80vh;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;

  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 16px;
    font-weight: 600;
  }

  button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
  }
`;

const Content = styled.div`
  padding: 20px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
`;
