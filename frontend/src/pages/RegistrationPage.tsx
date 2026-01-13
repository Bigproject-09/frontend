import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const handleREgistration = () => {
        console.log("로그인 시도");
    };

    return (
        <Wrapper>
            <LoginBox>
                <div className="title">
                    회사 정보 입력
                </div>

                <div className="inputGroup">
                    <div className="label">
                        사업자 등록 번호
                    </div>
                    <input
                    type="text"
                    className="input"
                    placeholder="사업자 등록 번호"
                    />
                </div>

                <div className="inputGroup">
                    <div className="label">
                        상호명
                    </div>
                    <input
                    type="text"
                    className="input"
                    placeholder="상호명"
                    />
                </div>

                <div className="inputGroup">
                    <div className="label">
                        대표자 명
                    </div>
                    <input
                    type="text"
                    className="input"
                    placeholder="대표자 명"
                    />
                </div>

                <div className="inputGroup">
                    <div className="label">
                        사업자 주소
                    </div>
                    <input
                    type="text"
                    className="input"
                    placeholder="사업자 주소"
                    />
                </div>

                <div className="inputGroup">
                    <div className="label">
                        업종 및 업태
                    </div>
                    <input
                    type="text"
                    className="input"
                    placeholder="업종 및 업태"
                    />
                </div>

                <div className="inputGroup">
                    <div className="label">
                        세금 계산서 수신 이메일
                    </div>
                    <input
                    type="email"
                    className="input"
                    placeholder="세금 계산서 수신 이메일"
                    />
                </div>

                <button
                    type="button"
                    className="button_right"
                    onClick={handleREgistration}
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
  height: 800px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default LoginPage;
