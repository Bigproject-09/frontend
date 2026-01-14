import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RegistrationPage from "./pages/RegistrationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

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
    </Route>
  </Routes>
</BrowserRouter>

  );
}

export default App;
