import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import TermPage from "./pages/TermPage";
import SignupPage from "./pages/SignupPage";
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

import ProcessPage from "./pages/ProcessPage/ProcessPage";
import NoticeNewPage from "./pages/ProcessPage/NoticeNewPage";
import NoticeNewPageResult from "./pages/ProcessPage/NoticeNewPageResult";
import RFPSearchPage from "./pages/ProcessPage/RFPSearchPage";
import AnnounceCreatePage from "./pages/ProcessPage/AnnounceCreatePage";
import ScriptCreatePage from "./pages/ProcessPage/ScriptCreatePage";
import PptDraftPage from "./pages/PptDraftPage";

import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 로그인 없이 접근 가능한 단독 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/resetPassword" element={<ResetPasswordPage />} />
          <Route path="/term" element={<TermPage />} />

          {/* Layout은 공개로 두고, 안에서 필요한 것만 보호 */}
          <Route element={<Layout />}>
            {/* 메인은 공개 */}
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

              {/* 파일 업로드 */}
              <Route path="/upload" element={<FileUploadPage />} />

              {/* 초안 작성 */}
              <Route path="/draft" element={<DraftPage />} />

              {/* 프로세스 */}
              <Route path="/process" element={<ProcessPage />} />
              <Route path="/process/analysis" element={<NoticeNewPage />} />
              <Route path="/process/analysis/result" element={<NoticeNewPageResult />} />
              <Route path="/process/rfp" element={<RFPSearchPage />} />
              <Route path="/process/announce" element={<AnnounceCreatePage />} />
              <Route path="/process/script" element={<ScriptCreatePage />} />

              {/* ppt 초안 */}
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
