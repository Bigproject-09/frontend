import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RegistrationPage from "./pages/RegistrationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TokenTab from "./pages/ManagerPage/TokenTab";
import PaymentPage from "./pages/ManagerPage/PaymentPage";
import RoleManageTab from "./pages/ManagerPage/RoleManageTab";
import NewRoleRegistPage from "./pages/ManagerPage/NewRoleRegistPage";
import UserManageTab from "./pages/ManagerPage/UserManageTab";
import NewUserRegistPage from "./pages/ManagerPage/NewUserRigistPage";

function App() {
  return (
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/registration" element={<RegistrationPage />} />
    <Route path="/resetPassword" element={<ResetPasswordPage />} />

    <Route element={<Layout />}>
      <Route path="/" element={<MainPage />} />
      <Route path="/manager/tokentab" element={<TokenTab />} />
      <Route path="/manager/payment" element={<PaymentPage />} />
      <Route path="/manager/rolemanagetab" element={<RoleManageTab />} />
      <Route path="/manager/roleregist" element={<NewRoleRegistPage />} />
      <Route path="/manager/usermanagetab" element={<UserManageTab />} />
      <Route path="/manager/userregist" element={<NewUserRegistPage />} />
    </Route>
  </Routes>
</BrowserRouter>

  );
}

export default App;
