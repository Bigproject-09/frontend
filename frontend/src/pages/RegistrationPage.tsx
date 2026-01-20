import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const handleREgistration = () => {
        console.log("로그인 시도");
    };

    return (
        <Wrapper>
            <LoginBox>
                <Title>
                    회사 정보 입력
                </Title>

                <ContentArea>
                    <div className="inputGroup">
                        <div className="label">
                            사업자 등록 번호
                        </div>
                        <input
                        type="text"
                        className="input"
                        placeholder="사업자 등록 번호"
                        />
                    </div>

                    <div className="inputGroup">
                        <div className="label">
                            대표자 명
                        </div>
                        <input
                        type="text"
                        className="input"
                        placeholder="대표자 명"
                        />
                    </div>

                    <div className="inputGroup">
                        <div className="label">
                            개업 일자
                        </div>
                        <input
                        type="text"
                        className="input"
                        placeholder="개업 일자"
                        />
                    </div>
                </ContentArea>

                <FloatingButton
                    type="button"
                    className="button_right"
                    onClick={handleREgistration}
                    >
                    회사 등록
                </FloatingButton>
            </LoginBox>
        </Wrapper>
    );
};

const Title = styled.div`
    position: absolute;
    top: 50px;
    left: 50px;
    font-size: 48px;
    font-weight: 600;
    margin-bottom: 20px;
    align-self: flex-start;
    margin-left: 20px;
`;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #d9d9d9;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginBox = styled.div`
  width: 800px;
  height: 650px;
  background-color: #ffffff;
  border-radius: 12px;

  display: flex;
  flex-direction: column;
  position: relative;
`;

const ContentArea = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 20px;
`;

const FloatingButton = styled.button`
  position: absolute;
  right: 40px;
  bottom: 30px;

  padding: 10px 10px;
`;

export default LoginPage;
