import React, {useState, useRef, useEffect} from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

const TermPage: React.FC = () => {
    const [agree, setAgree] = useState({
    service: false,
    privacy: false,
    });

    const [open, setOpen] = useState({
    service: false,
    privacy: false,
    });

    const [scrolledEnd, setScrolledEnd] = useState({
    service: false,
    privacy: false,
    });

    const serviceRef = useRef<HTMLDivElement>(null);
    const privacyRef = useRef<HTMLDivElement>(null);

      // 펼칠 때 스크롤 맨 위
    useEffect(() => {
        if (open.service && serviceRef.current) {
        serviceRef.current.scrollTop = 0;
        }
    }, [open.service]);

    useEffect(() => {
        if (open.privacy && privacyRef.current) {
        privacyRef.current.scrollTop = 0;
        }
    }, [open.privacy]);

      // 스크롤 끝 감지
    const handleScroll = (
        key: "service" | "privacy",
        ref: React.RefObject<HTMLDivElement | null>
        ) => {
        if (!ref.current) return;

        const { scrollTop, scrollHeight, clientHeight } = ref.current;

        if (scrollTop + clientHeight >= scrollHeight - 5) {
            setScrolledEnd(prev => ({ ...prev, [key]: true }));
        }
    };


    const toggleOpen = (key: "service" | "privacy") => {
        setOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAgree = (key: "service" | "privacy") => {
        if (!scrolledEnd[key]) return; // 🔒 핵심 차단
        setAgree(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const navigate = useNavigate();

    return (
        <Wrapper>
            <LoginBox>
                {/* <ContentArea> */}
                    <LogoArea>
                        <div className="logo">
                            RanDi
                        </div>
                    </LogoArea>
                {/* </ContentArea> */}
                    <TermBox>
                        <TermHeader>
                            <label className={!scrolledEnd.service ? "disabled" : ""}>
                                <input
                                type="checkbox"
                                checked={agree.service}
                                disabled={!scrolledEnd.service}
                                onChange={() => toggleAgree("service")}
                                />
                                (필수) 서비스 이용약관
                            </label>

                            <ToggleBtn onClick={() => toggleOpen("service")}>
                                {open.service ? "접기 ▲" : "펼치기 ▼"}
                            </ToggleBtn>
                        </TermHeader>

                        {open.service && (
                        <TermContent
                            ref={serviceRef}
                            onScroll={() => handleScroll("service", serviceRef)}
                        >
                        {/* <TermsScrollBox> */}
                        <TermsBlock>
                            <TermsBlockTitle>제1조 (목적)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>본 약관은 회사가 제공하는 인공지능 기반 제안서 지원 서비스(이하 “서비스”)의 이용과 
                                    관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제2조 (용어의 정의)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>1. “회사”란 본 약관에 따라 서비스를 제공하는 주체를 말합니다.</p>
                                <p>2. “회원”이란 본 약관에 동의하고 회사와 이용계약을 체결하여 서비스를 이용하는 법인 또는 사업자를 말합니다.</p>
                                <p>3. “서비스”란 회원이 업로드하거나 입력한 정보를 기반으로 인공지능(AI)이 자동으로 분석·생성·요약한 결과물을 제공하는 온라인 플랫폼을 말합니다.</p>
                                <p>4. “결과물”이란 제안서 초안, 체크리스트, 요약 정보, PPT 초안, 프롬프트, 예상 질문 등 인공지능에 의해 자동 생성되어 제공되는 모든 산출물을 말합니다.</p>
                                <p>5. “업로드 자료”란 회원이 서비스 이용을 위해 업로드하거나 입력한 공고 파일, 제안서, PPT 파일 및 기타 자료 일체를 말합니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제3조 (약관의 효력 및 변경)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>1. 본 약관은 회원이 회원가입 시 동의함으로써 효력이 발생합니다.</p>
                                <p>2. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 사전에 공지합니다.</p>
                                <p>3. 회원이 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제4조 (회원가입 및 이용계약)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>1. 회원가입은 사업자를 대상으로 하며, 회원은 다음 정보를 제공하여야 합니다.</p>
                                <p>{"\u2003\u2003"}- 사업자등록번호</p>
                                <p>{"\u2003\u2003"}- 대표자 성명</p>
                                <p>{"\u2003\u2003"}- 개업일자</p>
                                <p>{"\u2003\u2003"}- 담당자 이메일(로그인 및 서비스 이용 목적)</p>
                                <p>2. 회사는 제공된 정보가 허위이거나 부정확한 경우 서비스 이용을 제한할 수 있습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제5조 (서비스의 제공)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>회사가 제공하는 서비스는 다음과 같습니다.</p>
                                <p>1. 공고 파일 업로드 시</p>
                                <p>{"\u2003\u2003"}- 인공지능을 통한 제안서 체크리스트 자동 생성</p>
                                <p>{"\u2003\u2003"}- 제안서 초안 자동 생성</p>
                                <p>{"\u2003\u2003"}- 공개적으로 접근 가능한 자료를 기반으로 한 유사 사례 및 참고 정보 요약 제공</p>
                                <p>2. 제안서 파일 업로드 시</p>
                                <p>{"\u2003\u2003"}- 제안서 내용을 기반으로 한 체크리스트 자동 생성</p>
                                <p>{"\u2003\u2003"}- 제안서 내용을 바탕으로 한 PPT 초안 자동 생성</p>
                                <p>2. PPT 파일 업로드 시</p>
                                <p>{"\u2003\u2003"}- 발표용 프롬프트 자동 생성</p>
                                <p>{"\u2003\u2003"}- 예상 질문 자동 생성</p>
                                <p>본 서비스의 모든 기능은 인공지능 시스템에 의해 자동으로 수행되며, 사람에 의한 개별 컨설팅이나 검수는 제공되지 않습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제6조 (AI 생성 결과물의 성격)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>본 서비스에서 제공되는 모든 결과물은 인공지능에 의해 자동 생성된 참고 자료입니다.</p>
                                <p>회사는 결과물의 정확성, 완전성, 최신성, 특정 목적에의 적합성 및 채택 가능성을 보장하지 않습니다.</p>
                                <p>동일한 입력값이라 하더라도 결과물은 실행 시점에 따라 달라질 수 있습니다.</p>
                                <p>결과물은 공식적인 평가 기준, 심사 결과 또는 제출 서류를 대체하지 않습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제7조 (업로드 자료의 이용)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>1. 회원은 업로드 자료에 대해 적법한 이용 권한을 보유하고 있어야 합니다.</p>
                                <p>2. 회사는 업로드 자료를 서비스 제공 목적 범위 내에서만 처리합니다.</p>
                                <p>3. 회사는 업로드 자료를 별도의 인공지능 학습 데이터로 사용하지 않습니다.</p>
                                <p>4. 회원은 업로드 자료로 인해 발생하는 제3자의 권리 침해에 대해 책임을 부담합니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제8조 (지식재산권)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>1. 회원이 업로드한 자료에 대한 권리는 회원에게 귀속됩니다.</p>
                                <p>2. 인공지능이 생성한 결과물에 대한 이용 책임은 회원에게 있으며, 회사는 결과물의 법적 권리 귀속이나 침해 여부에 대해 보증하지 않습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제9조 (유료 서비스 및 결제)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>1. 서비스는 유료로 제공되며, 이용 요금 및 결제 조건은 별도로 안내됩니다.</p>
                                <p>2. 회원이 결제를 완료한 경우라도 서비스의 특성상 결과물의 품질이나 채택 여부를 이유로 환불을 요구할 수 없습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제10조 (서비스 이용 제한)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</p>
                                <p>1. 허위 정보로 회원가입을 한 경우</p>
                                <p>2. 서비스의 정상적인 운영을 방해한 경우</p>
                                <p>3. 법령 또는 본 약관을 위반한 경우</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제11조 (면책조항)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>1. 회사는 인공지능 결과물로 인해 발생한 직접적·간접적 손해에 대해 책임을 지지 않습니다.</p>
                                <p>2. 회사는 제안서 채택 실패, 평가 결과, 사업 선정 여부에 대해 어떠한 책임도 부담하지 않습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>제12조 (준거법 및 관할)</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>본 약관은 대한민국 법령을 준거법으로 하며, 
                                    서비스 이용과 관련한 분쟁은 회사의 본점 소재지를 관할하는 법원을 전속 관할로 합니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>
                            {/* </TermsScrollBox> */}

                        </TermContent>
                        )}
                    </TermBox>

                    {/* 개인정보 수집·이용 */}
                    <TermBox>
                        <TermHeader>
                        <label className={!scrolledEnd.privacy ? "disabled" : ""}>
                            <input
                            type="checkbox"
                            checked={agree.privacy}
                            disabled={!scrolledEnd.privacy}
                            onChange={() => toggleAgree("privacy")}
                            />
                            (필수) 개인정보 수집·이용 동의
                        </label>

                        <ToggleBtn onClick={() => toggleOpen("privacy")}>
                            {open.privacy ? "접기 ▲" : "펼치기 ▼"}
                        </ToggleBtn>
                        </TermHeader>

                        {open.privacy && (
                        <TermContent
                            ref={privacyRef}
                            onScroll={() => handleScroll("privacy", privacyRef)}
                        >
                        <TermsBlock>
                            <TermsBlockTitle>1. 수집하는 개인정보 항목</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>회사는 회원가입 및 서비스 제공을 위해 다음 개인정보를 수집합니다.</p>
                                <p>{"\u2003\u2003"}- 사업자등록번호</p>
                                <p>{"\u2003\u2003"}- 대표자 성명</p>
                                <p>{"\u2003\u2003"}- 개업일자</p>
                                <p>{"\u2003\u2003"}- 담당자 이메일</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>2. 개인정보 수집·이용 목적</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>회사는 회원가입 및 서비스 제공을 위해 다음 개인정보를 수집합니다.</p>
                                <p>{"\u2003\u2003"}- 회원 식별 및 회원관리</p>
                                <p>{"\u2003\u2003"}- 서비스 제공 및 이용 이력 관리</p>
                                <p>{"\u2003\u2003"}- 유료 서비스 결제 및 고객 문의 대응</p>
                                <p>{"\u2003\u2003"}- 서비스 관련 공지사항 전달</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>3. 개인정보 보유 및 이용 기간</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>회사는 개인정보를 회원 탈퇴 시까지 보유·이용하며, 
                                    관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>4. 동의 거부 권리 및 불이익</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>회원은 개인정보 수집·이용에 대한 동의를 거부할 수 있으나, 
                                    동의하지 않을 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        <TermsBlock>
                            <TermsBlockTitle>5. 업로드 자료에 대한 안내</TermsBlockTitle>
                            <TermsBlockContent>
                                <p>회원이 업로드하는 공고 파일, 제안서, PPT 파일 등은 개인정보가 아닌 기업 자료로 간주되며, 
                                    회사는 해당 자료를 서비스 제공 목적 범위 내에서만 처리합니다.</p>
                            </TermsBlockContent>
                        </TermsBlock>

                        </TermContent>
                        )}
                    </TermBox>
                    
                    {/* <ContentArea> */}
                    <ButtonArea>
                        <button
                            type="button"
                            className="button_center"
                            onClick={() => navigate("/signup")}
                            disabled={!(agree.service && agree.privacy)}>
                            다음
                        </button>
                    </ButtonArea>
                {/* </ContentArea> */}
            </LoginBox>
        </Wrapper>
    );
};

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
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
  height: 700px;
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

const TermHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  label.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TermBox = styled.div`
  flex: 1;
  overflow-y: auto;          /* ⭐ 여기만 스크롤 */
  padding: 0 24px;
`;

const ToggleBtn = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  color: #666;
`;

const TermContent = styled.div`
  margin-top: 10px;
  padding: 10px;
  height: 120px;

  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;

  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
`;

export const TermsBlock = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);

  &:last-child {
    border-bottom: none;
  }
`;

export const TermsBlockTitle = styled.div`
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 15px;
`;

export const TermsBlockContent = styled.div`
    font-size: 14px;
    line-height: 1.6;
    color: #333;

    p {
    margin: 0 0 6px 0;
    }
`;

export const TermsScrollBox = styled.div`
  max-height: 240px;
  overflow-y: auto;
  padding: 0 16px;

  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const LogoArea = styled.div`
  height: 100px;            /* ⭐ 고정 */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonArea = styled.div`
  height: 100px;            /* ⭐ 고정 */
  display: flex;
  align-items: center;
  justify-content: center;
`;


export default TermPage;
