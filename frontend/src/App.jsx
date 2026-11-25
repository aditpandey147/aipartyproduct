// App.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AIProfitProvider } from "./context/AIProfitContext";
import PrivateRoute from "./components/features/PrivateRoute";
import FeatureRoute from "./components/features/FeatureRoute"; // 👈 NEW
import HomeNavbar from "./components/HomeNavbar";
import Footer from "./components/Footer";

import ImpersonationBanner from "./components/ImpersonationBanner";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Subscription from "./pages/auth/Subscription";

// Pages
import Dashboard from "./pages/Dashboard";
import ProductGenerator from "./pages/ProductGenerator";
import ProductIdeas from "./pages/ProductIdeas";
import PartyKitBuilder from "./pages/PartyKitBuilder";
import AISalesKit from "./pages/AISalesKit";
import MyCreations from "./pages/MyCreations";
import Unlimited from "./pages/otos/Unlimited";
import PremiumDesignStudio from "./pages/otos/PremiumDesignStudio";
import AIPartyBusinessStudio from "./pages/otos/AIPartyBusinessStudio";
import TrafficMachine from "./pages/otos/TrafficMachine";
import DfyPack from "./pages/otos/DfyPack";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

// Agency
import Agency from "./pages/agency/Agency";

import VisualLibraryPage from "./components/dfy/VisualLibraryPage";
import VideoLibraryPage from "./components/dfy/VideoLibraryPage";

// OTOs
import Reseller from "./pages/otos/Reseller";
import AIRanker from "./pages/ranker/AIRanker";
import AIRankerChat from "./pages/ranker/AIRankerChat";

// Support
import Training from "./pages/support/Training";
import Support from "./pages/support/Support";
import Settings from "./pages/Settings";

// 👇 NEW
import UpgradeRequired from "./pages/features/UpgradeRequired";

// ================================================================
// Layout — unchanged
// ================================================================
const Layout = ({ children }) => {
  const location = useLocation();

  const dashboardPages = [
    "/dashboard",
    "/product-generator",
    "/product-ideas",
    "/party-kit-builder",
    "/ai-sales-kit",
    "/my-creations",
    "/unlimited",
    "/premium-design-studio",
    "/business-studio",
    "/traffic-machine",
    "/dfy-pack",
    "/admin/dashboard",
    "/training",
    "/support",
    "/ai-ranker",
    "/settings",
    "/subscription",
    "/reseller",
    "/agency",
    "/upgrade-required", // 👈 NEW — dashboard-style (has Sidebar)
  ];

  const isDashboardPage =
    dashboardPages.includes(location.pathname) ||
    location.pathname.startsWith("/ai-profit-machine/chat/") ||
    location.pathname.startsWith("/ai-ranker/chat/") ||
    location.pathname.startsWith("/products/") ||
    location.pathname.startsWith("/templates/") ||
    location.pathname.startsWith("/mystery/") ||
    location.pathname.startsWith("/create-mystery");

  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage =
    authPages.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  return (
    <>
      {!isDashboardPage && !isAuthPage && <HomeNavbar />}
      <div className={!isDashboardPage && !isAuthPage ? "pt-14" : ""}>
        {children}
      </div>
      {!isDashboardPage && !isAuthPage && <Footer />}
    </>
  );
};

// ================================================================
// App
// ================================================================
function App() {
  return (
    <AuthProvider>
      <AIProfitProvider>
        <Toaster position="top-right" />
        <ImpersonationBanner />
        <Layout>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ==================== Auth Routes ==================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/support" element={<Support />} />

            {/* ==================== Admin ==================== */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* ==================== Free Routes (auth only) ==================== */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/product-generator"
              element={
                <PrivateRoute>
                  <ProductGenerator />
                </PrivateRoute>
              }
            />

            <Route
              path="/product-ideas"
              element={
                <PrivateRoute>
                  <ProductIdeas />
                </PrivateRoute>
              }
            />

            <Route
              path="/party-kit-builder"
              element={
                <PrivateRoute>
                  <PartyKitBuilder />
                </PrivateRoute>
              }
            />

            <Route
              path="/ai-sales-kit"
              element={
                <PrivateRoute>
                  <AISalesKit />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-creations"
              element={
                <PrivateRoute>
                  <MyCreations />
                </PrivateRoute>
              }
            />

            <Route
              path="/unlimited"
              element={
                <PrivateRoute>
                  <Unlimited />
                </PrivateRoute>
              }
            />

            <Route
              path="/premium-design-studio"
              element={
                <PrivateRoute>
                  <PremiumDesignStudio />
                </PrivateRoute>
              }
            />

            <Route
              path="/business-studio"
              element={
                <PrivateRoute>
                  <AIPartyBusinessStudio />
                </PrivateRoute>
              }
            />
            <Route
              path="/traffic-machine"
              element={
                <PrivateRoute>
                  <TrafficMachine />
                </PrivateRoute>
              }
            />

            <Route
              path="/dfy-pack"
              element={
                <PrivateRoute>
                  <DfyPack />
                </PrivateRoute>
              }
            />

            <Route
              path="/agency"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="agency">
                    <Agency />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/reseller"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="reseller">
                    <Reseller />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ==================== Other Protected ==================== */}
            <Route
              path="/subscription"
              element={
                <PrivateRoute>
                  <Subscription />
                </PrivateRoute>
              }
            />

            <Route
              path="/training"
              element={
                <PrivateRoute>
                  <Training />
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />

            {/* ==================== Upgrade Required Fallback ==================== */}
            <Route
              path="/upgrade-required"
              element={
                <PrivateRoute>
                  <UpgradeRequired />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AIProfitProvider>
    </AuthProvider>
  );
}

export default App;
