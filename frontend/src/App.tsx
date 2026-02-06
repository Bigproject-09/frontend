import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import MainPage from "./pages/MainPage";
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
import DraftPage from "./pages/DraftPage";
import FaqPage from "./pages/FaqPage";
import ProposalPage from "./pages/ProposalPage";

import ProcessPage from "./pages/ProcessPage/ProcessPage";
import NoticeNewPage from "./pages/ProcessPage/NoticeNewPage";
import NoticeNewPageResult from "./pages/ProcessPage/NoticeNewPageResult";
import RFPSearchPage from "./pages/ProcessPage/RFPSearchPage";
import RFPSearchPageResult from "./pages/ProcessPage/RFPSearchPageResult";
import AnnounceCreatePage from "./pages/ProcessPage/AnnounceCreatePage";
import AnnounceCreatePageResult from "./pages/ProcessPage/AnnounceCreatePageResult";
import ScriptCreatePage from "./pages/ProcessPage/ScriptCreatePage";
import ScriptCreatePageResult from "./pages/ProcessPage/ScriptCreatePageResult";
import PptDraftPage from "./pages/PptDraftPage";

import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 레이아웃 없이 단독 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/term" element={<TermPage />} />
          <Route path="/withdrawal" element={<WithdrawPage />} />

          {/* 레이아웃 적용 페이지 */}
          <Route element={<Layout />}>
            {/* 공개 */}
            <Route path="/" element={<MainPage />} />

            {/* 여기부터 로그인 필요 */}
            <Route element={<ProtectedRoute />}>
              {/* 공고 */}
              <Route path="/notice" element={<NoticeAlertPage />} />

              {/* 매니저 */}
              <Route path="/manager/tokentab" element={<TokenTab />} />
              <Route path="/manager/payment" element={<PaymentPage />} />
              <Route path="/manager/rolemanagetab" element={<RoleManageTab />} />
              <Route path="/manager/roleregist" element={<NewRoleRegistPage />} />
              <Route path="/manager/usermanagetab" element={<UserManageTab />} />
              <Route path="/manager/userregist" element={<NewUserRegistPage />} />
              <Route path="/manager/companyinfo" element={<CompanyInformationPage />} />

              {/* 프로세스 */}
              <Route path="/process" element={<ProcessPage />} />
              <Route path="/process/analysis" element={<NoticeNewPage />} />
              <Route path="/process/analysis/result" element={<NoticeNewPageResult />} />

              <Route path="/process/rfp" element={<RFPSearchPage />} />
              <Route path="/process/rfp/result" element={<RFPSearchPageResult />} />

              <Route path="/process/announce" element={<AnnounceCreatePage />} />
              <Route path="/process/announce/result" element={<AnnounceCreatePageResult />} />

              <Route path="/process/script" element={<ScriptCreatePage />} />
              <Route path="/process/script/result" element={<ScriptCreatePageResult />} />

              {/* 초안 */}
              <Route path="/draft" element={<DraftPage />} />
              <Route path="/pptdraft" element={<PptDraftPage />} />

              {/* FAQ / 제안서 */}
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/proposal" element={<ProposalPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
