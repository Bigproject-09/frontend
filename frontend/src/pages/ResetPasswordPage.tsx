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
                <div className="title">
                    비밀번호 재설정
                </div>

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

                <button
                    type = "button"
                    className="button_right"
                    onClick={handleResetPassword}
                    >
                    비밀번호 재설정
                </button>
            </LoginBox>
        </Wrapper>
    );
};

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
  height: 450px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default ResetPasswordPage;
