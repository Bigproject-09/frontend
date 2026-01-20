import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // 🔐 비밀번호 규칙 검증 함수
  const validatePassword = (pw: string) => {
    // 금지 특수문자: ( ) < > " ' ;
    const forbidden = /[()<>\"';]/;

    if (forbidden.test(pw)) {
      return "사용할 수 없는 특수문자가 포함되어 있습니다.";
    }

    const hasEng = /[A-Za-z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSpec = /[~!@#$%^&*_+\-=\[\]{}|:\\,.?/]/.test(pw);

    const typeCount = [hasEng, hasNum, hasSpec].filter(Boolean).length;

    if (typeCount >= 3) {
      if (pw.length < 8 || pw.length > 16) {
        return "영문/숫자/특수문자 3종 조합은 8~16자리여야 합니다.";
      }
    } else if (typeCount >= 2) {
      if (pw.length < 10 || pw.length > 16) {
        return "2종 조합은 10~16자리여야 합니다.";
      }
    } else {
      return "영문, 숫자, 특수문자 중 2종류 이상 조합해야 합니다.";
    }

    return "";
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    setPasswordError(validatePassword(value));

    // 확인칸 이미 입력된 경우 바로 비교
    if (passwordConfirm && value !== passwordConfirm) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmError("");
    }
  };

  const handleConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordConfirm(value);

    if (password !== value) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmError("");
    }
  };

  const isValid =
    !passwordError &&
    !confirmError &&
    password.length > 0 &&
    passwordConfirm.length > 0;

  return (
    <Wrapper>
      <LoginBox>
        <Title>회원가입</Title>

        <ContentArea>
          <div className="inputGroup">
            <div className="label">이메일 입력</div>
            <input
              type="email"
              className="input"
              placeholder="이메일"
            />
          </div>

          <div className="inputGroup">
            <div className="label">비밀번호 입력</div>
            <input
              type="password"
              className="input"
              value={password}
              onChange={handlePassword}
              placeholder="비밀번호"
            />
            {passwordError && (
              <ErrorText>{passwordError}</ErrorText>
            )}
          </div>

          <div className="inputGroup">
            <div className="label">비밀번호 확인</div>
            <input
              type="password"
              className="input"
              value={passwordConfirm}
              onChange={handleConfirm}
              placeholder="비밀번호 확인"
            />
            {confirmError && (
              <ErrorText>{confirmError}</ErrorText>
            )}
          </div>
        </ContentArea>

        <FloatingButton
            type = "button"
            className="button_center"
            disabled={!isValid}
            onClick={() => navigate("/registration")}
        >
          회사 등록
        </FloatingButton>
      </LoginBox>
    </Wrapper>
  );
};

export default SignupPage;

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
  width: 900px;
  height: 700px;
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

const FloatingButton = styled.button`
  position: absolute;
  right: 40px;
  bottom: 30px;
  width: 120px;
  padding: 10px 22px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: red;
  font-size: 13px;
  margin-top: 4px;
`;
