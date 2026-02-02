import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";
import http from "../api/http"; // ✅ 추가

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("이메일/비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      // ✅ 백엔드: POST /api/login
      const res = await http.post("/api/login", {
        email,
        password,
      });

      // ✅ 백 응답: { accessToken: "..." }
      const accessToken: string | undefined = res.data?.accessToken;

      if (!accessToken) {
        setErrorMsg("로그인 응답에 accessToken이 없습니다.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);

      // 로그인 성공 후 이동(원하는 경로로 바꿔도 됨)
      navigate("/");
    } catch (err: any) {
      // GlobalExceptionHandler가 {message:"..."} 형태면 여기서 잡힘
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "로그인에 실패했습니다.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <LoginBox>
        <Title>로그인</Title>

        <ContentArea>
          <FormBox>
            <div className="inputGroup">
              <div className="label">이메일</div>
              <input
                type="email"
                className="input"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="inputGroup">
              <div className="label">비밀번호</div>
              <input
                type="password"
                className="input"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
              />
            </div>

            {errorMsg && <ErrorText role="alert">{errorMsg}</ErrorText>}

            <ButtonRow>
              <button
                type="button"
                className="button_center"
                onClick={() => navigate("/term")}
                disabled={loading}
              >
                회원가입
              </button>

              <button
                type="button"
                className="button_center"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </ButtonRow>

            <TextBtn onClick={() => navigate("/resetPassword")} disabled={loading}>
              비밀번호 재설정
            </TextBtn>
          </FormBox>
        </ContentArea>
      </LoginBox>
    </Wrapper>
  );
};

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-top: 4px;
`;

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
  background: linear-gradient(135deg, #1f3a5f 0%, #162c48 100%);

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

  gap: 40px;
`;

const FormBox = styled.div`
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-top: 4px;

  text-align: right;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: var(--color-accent);
    text-decoration: underline;
  }
`;

export default LoginPage;
