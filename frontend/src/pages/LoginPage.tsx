import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";
import http from "../api/http";
import { useAuth } from "../auth/AuthProvider";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { refreshMe } = useAuth();
  
  const handleLogin = async () => {
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("이메일/비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await http.post("/api/login", {
        email,
        password,
      });

      const accessToken: string | undefined = res.data?.accessToken;

      if (!accessToken) {
        setErrorMsg("로그인 응답에 accessToken이 없습니다.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      await refreshMe();
      navigate("/");
    } catch (err: any) {
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
      <LoginContainer>
        <LeftPanel>
          <BrandSection>
            <LogoText>RanDi</LogoText>
            <BrandDescription>
              R&D 공고 분석부터 발표자료 제작까지
              <br />
              성공적인 과제 수주를 위한 솔루션
            </BrandDescription>
          </BrandSection>
        </LeftPanel>

        <RightPanel>
          <FormSection>
            <FormHeader>
              <FormTitle>로그인</FormTitle>
              <FormSubtitle>RanDi에 오신 것을 환영합니다</FormSubtitle>
            </FormHeader>

            <FormContent>
              <InputGroup>
                <Label>이메일</Label>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </InputGroup>

              <InputGroup>
                <Label>비밀번호</Label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  disabled={loading}
                />
              </InputGroup>

              {errorMsg && <ErrorMessage role="alert">{errorMsg}</ErrorMessage>}

              <ButtonGroup>
                <LoginButton
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "로그인 중..." : "로그인"}
                </LoginButton>

                <SignupButton
                  type="button"
                  onClick={() => navigate("/term")}
                  disabled={loading}
                >
                  회원가입
                </SignupButton>
              </ButtonGroup>
            </FormContent>
          </FormSection>
        </RightPanel>
      </LoginContainer>
    </Wrapper>
  );
};

export default LoginPage;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  box-sizing: border-box;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    max-width: 480px;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 30px 30px;
    animation: float 20s linear infinite;
  }

  @keyframes float {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(30px, 30px);
    }
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xl);
    min-height: 200px;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;
`;

const LogoText = styled.h1`
  font-size: 56px;
  font-weight: var(--font-weight-bold);
  color: white;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.03em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 42px;
  }
`;

const BrandDescription = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
  font-weight: var(--font-weight-regular);

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: var(--spacing-xl);
  }
`;

const FormSection = styled.div`
  width: 100%;
  max-width: 400px;
`;

const FormHeader = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const FormTitle = styled.h2`
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
`;

const FormSubtitle = styled.p`
  font-size: 15px;
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-regular);
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 var(--spacing-md);
  border: 1.5px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  outline: none;
  transition: all var(--transition-fast);

  &::placeholder {
    color: var(--color-text-muted);
  }

  &:hover:not(:disabled) {
    border-color: var(--color-border-medium);
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &:disabled {
    background: var(--color-bg-secondary);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
`;

const LoginButton = styled.button`
  width: 100%;
  height: 52px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  letter-spacing: -0.01em;

  &:hover:not(:disabled) {
    background: var(--color-primary-dark);
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SignupButton = styled.button`
  width: 100%;
  height: 52px;
  background: white;
  color: var(--color-text-secondary);
  border: 1.5px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  letter-spacing: -0.01em;

  &:hover:not(:disabled) {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-dark);
    color: var(--color-text-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HelperLinks = styled.div`
  text-align: center;
`;

const HelperLink = styled.button`
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast);

  &:hover:not(:disabled) {
    color: var(--color-primary);
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
