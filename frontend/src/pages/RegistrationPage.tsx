import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";
import http from "../api/http";

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  // ✅ 백 DTO에 들어가는 값(필수)
  const [companyName, setCompanyName] = useState("");
  const [businessRegNo, setBusinessRegNo] = useState("");
  const [ceoName, setCeoName] = useState("");
  const [openDate, setOpenDate] = useState(""); // YYYYMMDD
  const [planId, setPlanId] = useState<number>(1);

  // ✅ UI에만 남겨둘 값(현재 백 DTO에는 없음)
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [assetScale, setAssetScale] = useState("");
  const [history, setHistory] = useState("");
  const [coreTech, setCoreTech] = useState("");
  const [strength, setStrength] = useState("");

  // 메시지
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  // ✅ SignupPage에서 저장해둔 값
  const email = localStorage.getItem("signup_email") ?? "";
  const password = localStorage.getItem("signup_password") ?? "";
  const passwordConfirm = localStorage.getItem("signup_passwordConfirm") ?? "";

  const normalizeBizNo = (v: string) => v.replace(/[^0-9]/g, "");
  const normalizeOpenDate = (v: string) => v.replace(/[^0-9]/g, "").slice(0, 8);

  const validate = () => {
    if (!email || !password || !passwordConfirm) return "이전 단계 정보가 없습니다. 회원가입부터 다시 진행하세요.";
    if (!companyName.trim()) return "회사명을 입력하세요.";
    if (!businessRegNo.trim()) return "사업자 등록 번호를 입력하세요.";
    if (normalizeBizNo(businessRegNo).length !== 10) return "사업자등록번호는 숫자 10자리여야 합니다.";
    if (!ceoName.trim()) return "대표자 명을 입력하세요.";
    if (!openDate.trim()) return "개업 일자를 입력하세요.";
    if (normalizeOpenDate(openDate).length !== 8) return "개업 일자는 YYYYMMDD 8자리여야 합니다.";
    if (password !== passwordConfirm) return "비밀번호 확인이 일치하지 않습니다.";
    return "";
  };

  const handleRegistration = async () => {
    setMessage("");
    setMessageType("");

    const err = validate();
    if (err) {
      setMessage(err);
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        companyName: companyName.trim(),
        businessRegNo: normalizeBizNo(businessRegNo),
        openDate: normalizeOpenDate(openDate),
        ceoName: ceoName.trim(),
        email: email.trim(),
        password,
        passwordConfirm,
        planId, // 일단 1 고정
      };

      // ✅ 백: POST /api/auth/company-signup
      await http.post("/api/auth/company-signup", payload);

      setMessage("회사 등록(회원가입)이 완료되었습니다. 로그인 해주세요.");
      setMessageType("success");

      // 임시 저장 제거
      localStorage.removeItem("signup_email");
      localStorage.removeItem("signup_password");
      localStorage.removeItem("signup_passwordConfirm");

      navigate("/login");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string" ? error.response.data : null) ||
        "회사 등록에 실패했습니다.";
      setMessage(msg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <LoginBox>
        <Title>회사 정보 입력</Title>

        <ContentArea>
          {/* 회사명 (추가) */}
          <div className="inputGroup">
            <div className="label">회사명</div>
            <input
              type="text"
              className="input"
              placeholder="회사명"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">사업자 등록 번호</div>
            <input
              type="text"
              className="input"
              placeholder="사업자 등록 번호"
              value={businessRegNo}
              onChange={(e) => setBusinessRegNo(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">대표자 명</div>
            <input
              type="text"
              className="input"
              placeholder="대표자 명"
              value={ceoName}
              onChange={(e) => setCeoName(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">개업 일자</div>
            <input
              type="text"
              className="input"
              placeholder="개업 일자"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">주소</div>
            <input
              type="text"
              className="input"
              placeholder="주소"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">업종</div>
            <input
              type="text"
              className="input"
              placeholder="업종"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">사원 수</div>
            <input
              type="text"
              className="input"
              placeholder="사원 수"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">자산 규모</div>
            <input
              type="text"
              className="input"
              placeholder="자산 규모"
              value={assetScale}
              onChange={(e) => setAssetScale(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">연혁</div>
            <input
              type="text"
              className="input"
              placeholder="연혁"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">핵심기술</div>
            <input
              type="text"
              className="input"
              placeholder="핵심기술"
              value={coreTech}
              onChange={(e) => setCoreTech(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <div className="label">강점</div>
            <input
              type="text"
              className="input"
              placeholder="강점"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
            />
          </div>

          {/* 메시지 */}
          {message && <MessageText type={messageType}>{message}</MessageText>}
        </ContentArea>

        <FloatingButton type="button" className="button_right" onClick={handleRegistration} disabled={loading}>
          {loading ? "등록 중..." : "회사 등록"}
        </FloatingButton>
      </LoginBox>
    </Wrapper>
  );
};

export default RegistrationPage;

/* === styles: 네가 처음 준 UI 그대로 === */

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
  height: 170vh;
  background: linear-gradient(135deg, #1f3a5f 0%, #162c48 100%);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginBox = styled.div`
  width: 800px;
  height: 1500px;
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

  gap: 20px;
`;

const FloatingButton = styled.button`
  position: absolute;
  right: 40px;
  bottom: 30px;

  padding: 10px 10px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MessageText = styled.p<{ type: "error" | "success" | "" }>`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ type }) => (type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#000")};
`;
