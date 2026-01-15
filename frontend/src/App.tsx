import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RegistrationPage from "./pages/RegistrationPage";

import NoticeAlertPage from "./pages/NoticeAlertPage";
import NoticeNewPage from "./pages/NoticeNewPage";
import FileUploadPage from "./pages/FileUploadPage";
import DraftPage from "./pages/DraftPage";
import FaqPage from "./pages/FaqPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 레이아웃 없이 단독 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/registration" element={<RegistrationPage />} />

        {/* 레이아웃 적용 페이지 */}
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />

          {/* 공고 */}
          <Route path="/notice" element={<NoticeAlertPage />} />
          <Route path="/notice/new" element={<NoticeNewPage />} />

          {/* 파일 업로드 */}
          <Route path="/upload" element={<FileUploadPage />} />

          {/* 초안 작성 */}
          <Route path="/draft" element={<DraftPage />} />

          {/* FAQ */}
          <Route path="/faq" element={<FaqPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
