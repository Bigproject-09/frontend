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
  width: 130px;

  padding: 10px 10px;
`;

export default ResetPasswordPage;
