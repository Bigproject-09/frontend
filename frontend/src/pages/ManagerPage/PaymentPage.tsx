import React, { useState } from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
      const menus = [
    {
      name: "토큰 확인",
      path: "/manager/tokentab",
      onClick:() => navigate("/manager/tokentab")
    },
    {
      name: "역할 관리",
      path: "/manager/rolemanagetab",
      onClick:() => navigate("/manager/rolemanagetab"),
      gap : true
    },
    {
      name: "사용자 관리",
      path: "/manager/usermanagetab",
      onClick:() => navigate("/manager/usermanagetab")
    },
    {
      name: "회사 정보 수정",
      path: "/registration",
      onClick:() => navigate("/registration"),
      gap : true
    }
  ]

    return (
    <Sidebar
        sidebarMenus={menus}
    >
        <Container>
        <div className="title">
            결제 관리
        </div>

        <ButtonGroup>
            <PaymentBtn
                //onClick={() => }
                >
                1단계 결제 <br /><br />
                가격 : 100원<br /><br />
                결제 내용을 입력하세요
            </PaymentBtn>
            <PaymentBtn 
                //onClick={() => }
                >
                2단계 결제 <br /><br />
                가격 : 천만원<br /><br />
                결제 내용을 입력하세요
            </PaymentBtn>
            <PaymentBtn 
                //onClick={() => }
                >
                3단계 결제 <br /><br />
                가격 : 1억<br /><br />
                결제 내용을 입력하세요
            </PaymentBtn>
        </ButtonGroup>

        </Container>
    </Sidebar>
    );
};

export default PaymentPage;

/* ================= styled-components ================= */

const Container = styled.div`
  padding: 60px;
`;

const ButtonGroup = styled.div`
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 12px;
`;

const PaymentBtn = styled.button`
padding: 12px;
border-radius: 16px;
border: 1px solid #ddd;
background: #fff;
cursor: pointer;
width: 80%;
height: 500px;

&:hover {
background: #f5f5f5;
}
`;