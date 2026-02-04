import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";
import axios from "axios";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [emailError, setEmailError] = useState(false); // 이메일 중복 확인
  const [codeError, setCodeError] = useState(false); // 인증번호 확인
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10분 = 600초

    /** 타이머 감소 */
  useEffect(() => {
    if (!showTimer) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer, timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /** 이메일 중복 확인 */
  const handleCheckEmail = async () : Promise<boolean> => {
    try{
      const res = await axios.post("/api/check-email",{ email,});

      if(res.data.isDuplicate) {
        setMessage("이미 사용 중인 이메일입니다.");
        setMessageType("error")
        return true;
      }

      return false;
    }catch(error){
      console.error(error);
      setMessage("이메일 확인 중 오류가 발생했습니다.");
      setMessageType("error");
      return true; // 혹시 모를 에러 방지
    }
  };

  /** 인증번호 요청 */
  const handleSendCode = async () => {
    try{
      await axios.post("/api/send-code", {email});
      setMessage("인증 코드가 발송되었습니다.");
      setMessageType("success");
    } catch (error){
      console.error(error);
      setMessage("인증 코드 발송 실패");
      setMessageType("error");
    }
  };

  // 이메일 입력하고 중복 확인 후 인증번호 보내는 통합 핸들러
  const handleEmailButtonClick = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    setMessage(""); // 이전 메세지 초기화

    const isDuplicate = await handleCheckEmail();

    if (isDuplicate) {
      return; // ❌ 중복이면 여기서 끝
    }

    // ✅ 중복 아니면 인증 코드 발송
    await handleSendCode();
  };


  /** 인증 확인 */
  const handleVerifyCode = () => {
    if( code === "123456"){
      setCodeError(false);
      setShowTimer(false);
      setIsEmailVerified(true); // 이메일 인증 완료
    }
    else
    {
      setCodeError(true);
      setIsEmailVerified(false);
    }
  };


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
    isEmailVerified &&
    !passwordError &&
    !confirmError &&
    password.length > 0 &&
    passwordConfirm.length > 0;

  return (
    <Wrapper>
      <LoginBox>
        <Title>회원가입</Title>

        {/* 이메일 */}
        <ContentArea>
          <div className="inputGroup">
            <div className="label">이메일 입력</div>
              <Row>
                <input
                  value={email}
                  className="input"
                  placeholder="이메일"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleEmailButtonClick}>인증 요청</button>
              </Row>
              {message && <MessageText type = {messageType}>
                {message}
              </MessageText>}
          </div>

          {/* 인증번호 */}
          <div className="inputGroup">
          <div className="label">인증번호 입력</div>
          <Row>
              <input
                value={code}
                className="input"
                placeholder="인증번호 6자리를 입력하세요"
                onChange={(e) => setCode(e.target.value)}
                disabled={!email}
              />
              {showTimer && <Timer>{formatTime(timeLeft)}</Timer>}
              <button onClick={handleVerifyCode}>확인</button>
          </Row>
          {codeError && <ErrorText>인증번호가 틀립니다</ErrorText>}
          </div>

          {/* 비밀번호 */}
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
              disabled={!password}
            />
            {confirmError && (
              <ErrorText>{confirmError}</ErrorText>
            )}
          </div>
        </ContentArea>

        <BottomRow>
          <FloatingButton
            type = "button"
            className="button_center"
            disabled={!isValid}
            onClick={() => navigate("/registration")}
          >
            회사 등록
          </FloatingButton>   
        </BottomRow>
      </LoginBox>
    </Wrapper>
  );
};

export default SignupPage;

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
  color: ${({ type }) =>
    type === "error"
      ? "#dc2626"   // red
      : type === "success"
      ? "#16a34a"   // green
      : "#000"};
`;
