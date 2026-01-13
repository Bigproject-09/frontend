import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        console.log("로그인 시도");
    };

    return (
        <Wrapper>
            <LoginBox>
                <div className="title">
                    로그인
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

                <div className="inputGroup">
                    <div className="label">
                        비밀번호
                    </div>
                    <input
                    type="password"
                    className="input"
                    placeholder="비밀번호"
                    />
                </div>

                <div className="actionRow">
                    <button
                        type="button"
                        className="button_center"
                        onClick={() => navigate("/signup")}
                        >
                        회원가입
                    </button>

                    <button
                        type="button"
                        className="button_center"
                        onClick={handleLogin}
                        >
                        로그인
                    </button>
                </div>

                <button
                    type = "button"
                    className="textButton_right"
                    onClick={() => navigate("/find_password")}
                    >
                    비밀번호 분실
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

export default LoginPage;
