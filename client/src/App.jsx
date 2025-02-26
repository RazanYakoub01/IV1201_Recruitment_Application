import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './components/i18nConfig'; // ✅ Import the i18n configuration
import Layout from './components/Layout';
import LoginPresenter from './presenter/LoginPresenter';
import SignUpPresenter from './presenter/SignUpPresenter';
import RecruiterPresenter from './presenter/RecruiterPresenter';
import ApplicantPresenter from './presenter/ApplicantPresenter';
import RestorePresenter from './presenter/RestorePresenter';
import LanguageSwitcher from './components/LanguageSwitcher';

const App = () => {
  const { t } = useTranslation(); 

  const handleLoginSuccess = (role) => {
    console.log(`${role} ${t("loginsuccess")}`); 
  };

  const handleSignUpSuccess = () => {
    console.log(t("signupsuccess"));
  };

  return (
    <>
      <LanguageSwitcher /> 
      <Routes>
        <Route path="/" element={<Layout showHeader={true}> <LoginPresenter onLoginSuccess={handleLoginSuccess} /> </Layout>} />
        <Route path="/signup" element={<Layout showHeader={true}> <SignUpPresenter onSignUpSuccess={handleSignUpSuccess} /> </Layout>} />
        <Route path="/recruiter" element={<Layout showHeader={true}> <RecruiterPresenter /> </Layout>} />
        <Route path="/applicant" element={<Layout showHeader={true}> <ApplicantPresenter /> </Layout>} />
        <Route path="/restore" element={<Layout showHeader={true}> <RestorePresenter /> </Layout>} />
      </Routes>
    </>
  );
};

export default App;
