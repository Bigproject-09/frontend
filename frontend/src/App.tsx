import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Footer from "./components/Footer";

import MainPage from "./pages/MainPage";
// 회원가입 및 로그인
import LoginPage from "./pages/LoginPage";
import TermPage from "./pages/TermPage";
import SignupPage from "./pages/SignupPage";
import WithdrawPage from "./pages/WithdrawalPage";

import RegistrationPage from "./pages/RegistrationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TokenTab from "./pages/ManagerPage/TokenTab";
import PaymentPage from "./pages/ManagerPage/PaymentPage";
import RoleManageTab from "./pages/ManagerPage/RoleManageTab";
import NewRoleRegistPage from "./pages/ManagerPage/NewRoleRegistPage";
import UserManageTab from "./pages/ManagerPage/UserManageTab";
import NewUserRegistPage from "./pages/ManagerPage/NewUserRigistPage";
import CompanyInformationPage from "./pages/ManagerPage/CompanyInformationPage";

import NoticeAlertPage from "./pages/NoticeAlertPage";
import FileUploadPage from "./pages/FileUploadPage";
import DraftPage from "./pages/DraftPage";
import FaqPage from "./pages/FaqPage";

import ProposalPage from "./pages/ProposalPage";
import MyProposalPage from "./pages/MyProposalPage";

import ProcessPage from "./pages/ProcessPage/ProcessPage";
import NoticeNewPage from "./pages/ProcessPage/NoticeNewPage";
import NoticeNewPageResult from "./pages/ProcessPage/NoticeNewPageResult";
import RFPSearchPage from "./pages/ProcessPage/RFPSearchPage";
import AnnounceCreatePage from "./pages/ProcessPage/AnnounceCreatePage";
import ScriptCreatePage from "./pages/ProcessPage/ScriptCreatePage";
import PptDraftPage from "./pages/PptDraftPage";

function App() {
  return (
<BrowserRouter>
  <Routes>
    {/* 레이아웃 없이 단독 페이지 */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/registration" element={<RegistrationPage />} />
    <Route path="/resetPassword" element={<ResetPasswordPage />} />
    <Route path="/term" element={<TermPage />} />
    <Route path="/withdrawal" element={<WithdrawPage /> }/>
    
        {/* 레이아웃 적용 페이지 */}
        <Route element={<Layout />}>

          <Route path="/" element={<MainPage />} />

          {/* 공고 */}
          <Route path="/notice" element={<NoticeAlertPage />} />

          <Route path="/manager/tokentab" element={<TokenTab />} />
          <Route path="/manager/payment" element={<PaymentPage />} />
          <Route path="/manager/rolemanagetab" element={<RoleManageTab />} />
          <Route path="/manager/roleregist" element={<NewRoleRegistPage />} />
          <Route path="/manager/usermanagetab" element={<UserManageTab />} />
          <Route path="/manager/userregist" element={<NewUserRegistPage />} />
          <Route path="/manager/companyinfo" element={<CompanyInformationPage />} />
          {/* 파일 업로드 */}
          <Route path="/upload" element={<FileUploadPage />} />

          {/* 초안 작성 */}
          <Route path="/draft" element={<DraftPage />} />

          <Route path="/process" element={<ProcessPage />} />
          {/* 공고문 분석 후, 체크리스트 제공, 사업목적과 평가항목 요약 페이지 */}
          <Route path="/process/analysis" element={<NoticeNewPage />} />
          <Route path="/process/analysis/result" element={<NoticeNewPageResult />} />
          {/* 유관 RFP 검색 후 동일 주관 및 사내 유사 RFP 추천 */}
          <Route path="/process/rfp" element={<RFPSearchPage />} />
          {/* 발표 자료 제작, 스토리라인 및 키워드, 구조 그림 추출 */}
          <Route path="/process/announce" element={<AnnounceCreatePage />} />
          {/* 스크립트 제작, 예상질문 생성 */}
          <Route path="/process/script" element={<ScriptCreatePage />} />
          {/* ppt 초안 작성 */}
          <Route path="/pptdraft" element={<PptDraftPage />} />

          {/* FAQ */}
          <Route path="/faq" element={<FaqPage />} />

          {/* 제안서 작성 */}
          <Route path="/proposal" element={<ProposalPage />} />

          {/* 내 제안서 목록
          <Route path="/myproposal" element={<MyProposalPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
