import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

const SignupPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Wrapper>
        <LoginBox>
            <div className="title">
                회원가입
            </div>

            <div className="inputGroup">
                <div className="label">
                    이메일 입력
                </div>
                <input
                type="email"
                className="input"
                placeholder="이메일"
                />
            </div>

            <div className="inputGroup">
                <div className="label">
                    비밀번호 입력
                </div>
                <input
                type="password"
                className="input"
                placeholder="비밀번호"
                />
            </div>

            <div className="inputGroup">
                <div className="label">
                    비밀번호 확인
                </div>
                <input
                type="password"
                className="input"
                placeholder="비밀번호"
                />
            </div>

            <button
                type="button"
                className="button_right"
                onClick={() => navigate("/registration")}
                >
                회사 등록
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


export default SignupPage;
