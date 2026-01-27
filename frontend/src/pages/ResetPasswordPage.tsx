import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();

    const handleResetPassword = () => {
        console.log("로그인 시도");
    };

    return (
        <Wrapper>
            <LoginBox>
                <Title>
                    비밀번호 재설정
                </Title>
                <ContentArea>
                    <div className="inputGroup">
                        <div className="label">
                            이름
                        </div>
                        <input
                        type="text"
                        className="input"
                        placeholder="이름"
                        />
                    </div>

                    <div className="inputGroup">
                        <div className="label">
                            이메일
                        </div>
                        <input
                        type="email"
                        className="input"
                        placeholder="이메일"
                        />
                    </div>
                </ContentArea>

                <FloatingButton
                    type = "button"
                    className="button_center"
                    onClick={handleResetPassword}
                    >
                    비밀번호 재설정
                </FloatingButton>
            </LoginBox>
        </Wrapper>
    );
};

const Title = styled.div`
  position: absolute;
  top: 48px;
  left: 48px;

  font-size: 44px;
  font-weight: 700;
  color: var(--color-primary);
`;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
    135deg,
    #1f3a5f 0%,
    #162c48 100%
  );

  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginBox = styled.div`
  width: 800px;
  height: 550px;
  background-color: #ffffff;
  border-radius: 14px;

  display: flex;
  flex-direction: column;
  position: relative;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
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
  width: 130px;

  padding: 10px 10px;
`;

export default ResetPasswordPage;
