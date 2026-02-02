import React, {useState} from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

declare global {
  interface Window {
    daum: any;
  }
}

const RegistrationPage: React.FC = () => {
    const navigate = useNavigate();

    const [zipCode, setZipCode] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");

    const [companyName, setCompanyName] = useState("");
    const [ceoName, setCeoName] = useState("");
    const [businessNumber, setBusinessNumber] = useState("");
    const [openDate, setOpenDate] = useState("");

    const [industry, setIndustry] = useState("");
    const [employeeCount, setEmployeeCount] = useState<number | null>(null);

    const [assetAmount, setAssetAmount] = useState<number | null>(null);
    const [historyText, setHistoryText] = useState("");
    const [coreTechText, setCoreTechText] = useState("");

    const handleAddressSearch = () => {
        new (window as any).daum.Postcode({
            oncomplete: (data: any) => {
            setZipCode(data.zonecode);
            setAddress1(data.roadAddress);
            },
        }).open();
    };

    const handleRegistration = () => {
        const payload = {
        companyName,
        ceoName,
        businessNumber,

        openDate, // DATE (YYYY-MM-DD)

        address: {
        zipCode,
        address1,
        address2,
        },

        industry,
        employeeCount,

        asset: {
        amount: assetAmount,
        currency: "KRW",
        },

        history: historyText
        ? [{ content: historyText }]
        : [],

        coreTechnology: coreTechText
        ? coreTechText.split(",").map(v => v.trim())
        : [],
    };

    console.log("회사 등록 payload 👉", payload);
    };

    return (
        <Wrapper>
            <LoginBox>
                <Title>
                    회사 정보 입력
                </Title>

                <ContentArea>
                    {/* <div className="inputGroup">
                        <div className="label">기업명</div>
                        <input
                            type="text"
                            className="input"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        </div> */}

                    <div className="inputGroup">
                        <div className="label">
                            사업자 등록 번호
                        </div>
                        <input
                        type="text"
                        className="input"
                        value={businessNumber}
                        onChange={(e) => setBusinessNumber(e.target.value)}
                        placeholder="예: 000-00-00000"
                        maxLength={12}
                        />
                    </div>

                    <div className="inputGroup">
                        <div className="label">
                            대표자 명
                        </div>
                        <input
                        type="text"
                        className="input"
                        value={ceoName}
                        placeholder="예: 김철수"
                        onChange={(e) => setCeoName(e.target.value)}
                        />
                    </div>

                    <div className="inputGroup">
                        <div className="label">
                            개업 일자
                        </div>
                        <input
                        type="date"
                        className="input"
                        value={openDate}
                        onChange={(e) => setOpenDate(e.target.value)}
                        placeholder="예: 2000-01-01"
                        />
                    </div>

                    <div className="inputGroup">
                    <div className="label">사업장 주소</div>

                    <div className="addressRow">
                        <input
                        type="text"
                        className="input zip"
                        placeholder="우편번호"
                        value={zipCode}
                        readOnly
                        />
                        <button type="button" 
                            className="addressBtn"
                            onClick={handleAddressSearch}
                            >
                            주소 검색
                        </button>
                    </div>

                    <input
                        type="text"
                        className="input"
                        placeholder="기본 주소"
                        value={address1}
                        readOnly
                    />

                    <input
                        type="text"
                        className="input"
                        placeholder="상세 주소"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                    />
                    </div>
           
                    <div className="inputGroup">
                        <div className="label">
                            업종
                        </div>
                        <input
                        type="text"
                        className="input"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="예: 제조업"
                        />
                    </div>
                   
                   <div className="inputGroup">
                    <div className="label">
                        사원 수
                    </div>
                    <input
                    type="number"
                    className="input"
                    value={employeeCount ?? ""}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    placeholder="예: 25"
                    />
                    </div>
                    
                    <div className="inputGroup">
                    <div className="label">
                        자산 규모
                    </div>
                    <input
                    type="number"
                    className="input"
                    value={assetAmount ?? ""}
                    onChange={(e) => setAssetAmount(Number(e.target.value))}
                    placeholder="예: 100000000 (원)"
                    />
                    </div>
                  
                    <div className="inputGroup">
                    <div className="label">연혁</div>
                    <Textarea
                        //className="input textarea"
                        value={historyText}
                        onChange={(e) => setHistoryText(e.target.value)}
                        placeholder="회사 주요 연혁을 입력해주세요"
                    />
                    </div>

                    <div className="inputGroup">
                    <div className="label">핵심 기술</div>
                    <Textarea
                        //className="input textarea"
                        value={coreTechText}
                        onChange={(e) => setCoreTechText(e.target.value)}
                        placeholder="보유한 핵심 기술을 입력해주세요"
                    />
                    </div>
            
                    {/* <div className="inputGroup">
                        <div className="label">
                            강점
                        </div>
                        <input
                        type="text"
                        className="input"
                        placeholder="개업 일자"
                        />
                    </div> */}
                </ContentArea>

                <FloatingButton
                    type="button"
                    className="button_right"
                    onClick={handleRegistration}
                    >
                    회사 등록
                </FloatingButton>
            </LoginBox>
        </Wrapper>
    );
};

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
  height: 190vh;
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
  height: 1700px;
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
`;

const Textarea = styled.textarea`
    height: 120px;
    resize: vertical;
    padding: 12px;
`;

export default RegistrationPage;
