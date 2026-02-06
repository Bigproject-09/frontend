import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";
import http from "../api/http";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [codeError, setCodeError] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showTimer) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [showTimer, timeLeft]);

  useEffect(() => {
    if (showTimer && timeLeft <= 0) {
      setShowTimer(false);
      setIsEmailVerified(false);
      setMessage("인증 시간이 만료되었습니다. 다시 인증 요청을 해주세요.");
      setMessageType("error");
    }
  }, [showTimer, timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /** 인증번호 요청 (백: POST /api/auth/email/send, req: {email}) */
  const handleSendCode = async () => {
    if (!email.trim()) {
      setMessage("이메일을 입력해주세요.");
      setMessageType("error");
      return;
    }

    try {
      const emailValue = email.trim();

      // 1) 중복 확인
      const checkRes = await http.post("/api/auth/email/check", { email: emailValue });
      const available = Boolean(checkRes.data?.available);

      if (!available) {
        setMessage(checkRes.data?.message || "이미 사용 중인 이메일입니다.");
        setMessageType("error");
        return; // 여기서 종료 (send 안 함)
      }
      
      // 2) 사용 가능하면 인증 코드 발송
      await http.post("/api/auth/email/send", { email: email.trim() });

      setMessage("인증코드를 발송했습니다.");
      setMessageType("success");

      setTimeLeft(300);
      setShowTimer(true);

      setCode("");
      setCodeError(false);
      setIsEmailVerified(false);
    } catch (error: any) {
      console.error(error);
      // 백에서 message 내려주면 그걸 우선
      const msg = error?.response?.data?.message || "인증 코드 발송 실패";
      setMessage(msg);
      setMessageType("error");
    }
  };

  /** 인증 확인 (백: POST /api/auth/email/verify, res: {verified:boolean, message:string}) */
  const handleVerifyCode = async () => {
    if (!email.trim()) {
      setMessage("이메일을 먼저 입력해주세요.");
      setMessageType("error");
      return;
    }
    if (!code || code.length !== 6) {
      setMessage("인증번호 6자리를 입력해주세요.");
      setMessageType("error");
      return;
    }
    if (!showTimer || timeLeft <= 0) {
      setMessage("인증 시간이 만료되었습니다. 다시 인증 요청을 해주세요.");
      setMessageType("error");
      return;
    }

    try {
      const res = await http.post("/api/auth/email/verify", {
        email: email.trim(),
        code: code.trim(),
      });

      const verified = Boolean(res.data?.verified);

      if (verified) {
        setCodeError(false);
        setShowTimer(false);
        setIsEmailVerified(true);

        setMessage(res.data?.message || "인증 완료");
        setMessageType("success");
      } else {
        setCodeError(true);
        setIsEmailVerified(false);
        setMessage("인증번호가 틀립니다.");
        setMessageType("error");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "인증 확인 중 오류가 발생했습니다.";
      setMessage(msg);
      setMessageType("error");
    }
  };

  const validatePassword = (pw: string) => {
    const forbidden = /[()<>\"';]/;
    if (forbidden.test(pw)) return "사용할 수 없는 특수문자가 포함되어 있습니다.";

    const hasEng = /[A-Za-z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSpec = /[~!@#$%^&*_+\-=\[\]{}|:\\,.?/]/.test(pw);

    const typeCount = [hasEng, hasNum, hasSpec].filter(Boolean).length;

    if (typeCount >= 3) {
      if (pw.length < 8 || pw.length > 16) return "영문/숫자/특수문자 3종 조합은 8~16자리여야 합니다.";
    } else if (typeCount >= 2) {
      if (pw.length < 10 || pw.length > 16) return "2종 조합은 10~16자리여야 합니다.";
    } else {
      return "영문, 숫자, 특수문자 중 2종류 이상 조합해야 합니다.";
    }
    return "";
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    setPasswordError(validatePassword(value));

    if (passwordConfirm && value !== passwordConfirm) setConfirmError("비밀번호가 일치하지 않습니다.");
    else setConfirmError("");
  };

  const handleConfirm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordConfirm(value);

    if (password !== value) setConfirmError("비밀번호가 일치하지 않습니다.");
    else setConfirmError("");
  };

  const isValid =
    isEmailVerified &&
    !passwordError &&
    !confirmError &&
    password.length > 0 &&
    passwordConfirm.length > 0;

  const goRegistration = () => {
    // ✅ 다음 페이지(RegistrationPage)에서 AuthDtos.CompanySignupRequest로 합쳐서 보낼 값
    localStorage.setItem("signup_email", email.trim());
    localStorage.setItem("signup_password", password);
    localStorage.setItem("signup_passwordConfirm", passwordConfirm);

    navigate("/registration");
  };

  const handleSignup = async () => {
    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      // 백 DTO(기존에 우리가 맞춘 payload) 그대로 유지
      // 회원가입에는 이메일과 비밀번호만 필요
      const payload = {
        email: email.trim(),
        password,
        passwordConfirm,
      };

      await http.post("/api/auth/company-signup", payload);

      setMessage("회원가입이 완료되었습니다. 로그인 해주세요.");
      setMessageType("success");

      localStorage.removeItem("signup_email");
      localStorage.removeItem("signup_password");
      localStorage.removeItem("signup_passwordConfirm");

      navigate("/login");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string" ? error.response.data : null) ||
        "회원가입에 실패했습니다.";
      setMessage(msg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <LoginBox>
        <Title>회원가입</Title>

        <ContentArea>
          <div className="inputGroup">
            <div className="label">이메일 입력</div>
            <Row>
              <input
                value={email}
                className="input"
                placeholder="이메일"
                onChange={(e) => {
                  setEmail(e.target.value);
                  // 이메일 바뀌면 인증상태 초기화
                  setIsEmailVerified(false);
                  setShowTimer(false);
                  setTimeLeft(600);
                  setCode("");
                  setCodeError(false);
                  setMessage("");
                  setMessageType("");
                }}
                disabled={isEmailVerified}
              />
              <button onClick={handleSendCode} disabled={isEmailVerified}>
                인증 요청
              </button>
            </Row>
            {message && <MessageText type={messageType}>{message}</MessageText>}
          </div>

          <div className="inputGroup">
            <div className="label">인증번호 입력</div>
            <Row>
              <input
                value={code}
                className="input"
                placeholder="인증번호 6자리를 입력하세요"
                onChange={(e) => setCode(e.target.value)}
                disabled={!email || !showTimer || isEmailVerified}
              />
              {showTimer && <Timer>{formatTime(timeLeft)}</Timer>}
              <button onClick={handleVerifyCode} disabled={!showTimer || isEmailVerified}>
                확인
              </button>
            </Row>
            {codeError && <ErrorText>인증번호가 틀립니다</ErrorText>}
          </div>

          <div className="inputGroup">
            <div className="label">비밀번호 입력</div>
            <input
              type="password"
              className="input"
              value={password}
              onChange={handlePassword}
              placeholder="비밀번호"
              disabled={!isEmailVerified}
            />
            {passwordError && <ErrorText>{passwordError}</ErrorText>}
          </div>

          <div className="inputGroup">
            <div className="label">비밀번호 확인</div>
            <input
              type="password"
              className="input"
              value={passwordConfirm}
              onChange={handleConfirm}
              placeholder="비밀번호 확인"
              disabled={!password || !isEmailVerified}
            />
            {confirmError && <ErrorText>{confirmError}</ErrorText>}
          </div>
        </ContentArea>

        <BottomRow>
          <FloatingButton type="button" className="button_center" disabled={loading} onClick={handleSignup}>
            회원가입
          </FloatingButton>
        </BottomRow>
      </LoginBox>
    </Wrapper>
  );
};

export default SignupPage;

/* styles (그대로) */
const Title = styled.div`
  position: absolute;
  top: 48px;
  left: 48px;
  font-size: 44px;
  font-weight: 700;
  color: var(--color-primary);
`;

const Wrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1f3a5f 0%, #162c48 100%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginBox = styled.div`
  width: 800px;
  height: 800px;
  background-color: #ffffff;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

const Timer = styled.div`
  font-size: 14px;
  color: purple;
  min-width: 48px;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const MessageText = styled.p<{ type: "error" | "success" | "" }>`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ type }) => (type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#000")};
`;
