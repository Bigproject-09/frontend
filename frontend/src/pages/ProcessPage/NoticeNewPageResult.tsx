import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Global.css";

const NoticeNewPageResult: React.FC = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const noticeId = location.state?.noticeId as number | undefined;

    const handleBack = (id:number) => {
        navigate("/process/analysis",{
            state: {noticeId: id},
        });
    };

    return (
        <Container>
            <Card>
                <div className="title" style={{ marginLeft: 0, marginBottom: 50 }}>
                    공고문 분석
                </div>

                {/* <Row> */}
                    <div className="title" style = {{fontSize: 15}}>
                        자격 요건 체크리스트
                    </div>
                    <Section>
                        체크리스트 줄줄
                    </Section>
                    <br />

                    <div className="title" style = {{fontSize: 15}}>
                        사업 목적 요약
                    </div>
                    <Section>
                        사업 목적
                    </Section>
                    <br />

                    <div className="title" style = {{fontSize: 15}}>
                        평가항목 요약
                    </div>
                    <Section>
                        평가항목
                    </Section>

                    <RightActionRow>
                            <button
                                type="button"
                                className="button_center"
                                style={{ width: 120 }}
                                onClick={() => {
                                    if(!noticeId)
                                        return;
                                    handleBack(noticeId);
                                }}>
                                재추출
                            </button>
                    </RightActionRow>

                    
                <DownloadWrapper>
                    <DownloadButton>
                        PPT 초안 다운로드
                    </DownloadButton>
                </DownloadWrapper>
            </Card>
        </Container>
    );
};

export default NoticeNewPageResult;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #d9d9d9;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px 0;
  box-sizing: border-box;
`;

const Card = styled.div`
  width: 1100px;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-sizing: border-box;

`;

const CardActions = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightActionRow = styled.div`
    margin-top: 32px;
    display: flex;
    justify-content: flex-end;
`;



const Section = styled.div`
  width: 100%;
  height : 300px;
  background: #d9d9d9;
  border-radius: 12px;
  padding: 28px;
  box-sizing: border-box;

  position: relative;
`;

const DownloadWrapper = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
`;


const DownloadButton = styled.button`
  padding: 14px 28px;
  background-color: #00b894;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: #009c7a;
  }
`;