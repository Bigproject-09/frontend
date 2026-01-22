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
                <Title>
                    로그인
                </Title>

                <ContentArea>

                    {/* 입력 영역 */}
                    <FormBox>
                        <div className="inputGroup">
                        <div className="label">이메일</div>
                        <input
                            type="email"
                            className="input"
                            placeholder="이메일"
                        />
                        </div>

                        <div className="inputGroup">
                        <div className="label">비밀번호</div>
                        <input
                            type="password"
                            className="input"
                            placeholder="비밀번호"
                        />
                        </div>

                        {/* 버튼 영역 */}
                        <ButtonRow>
                        <button
                            type="button"
                            className="button_center"
                            onClick={() => navigate("/term")}
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
                        </ButtonRow>

                        {/* 텍스트 버튼 */}
                        <TextBtn
                        onClick={() => navigate("/resetPassword")}
                        >
                        비밀번호 재설정
                        </TextBtn>

                    </FormBox>

                </ContentArea>
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
  height: 550px;
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

  gap: 40px;
`;

// 입력 + 버튼 전체 묶는 박스
const FormBox = styled.div`
  width: 360px;          /* 🔥 이 너비가 기준선 */
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

// 버튼 2개 줄
const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;   /* 👉 오른쪽 정렬 */
  gap: 10px;
  margin-top: 6px;             /* 비번 입력과 간격 */
`;

// 비밀번호 분실 텍스트 버튼
const TextBtn = styled.button`
  background: none;
  border: none;
  padding: 0;

  text-align: right;           /* 👉 텍스트도 우측 */
  color: #555;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;


export default LoginPage;
