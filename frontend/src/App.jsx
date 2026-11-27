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
            {/* ─── Baseline routes (Free / FE — always available) ─── */}
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
              path="/my-creations"
              element={
                <PrivateRoute>
                  <MyCreations />
                </PrivateRoute>
              }
            />

            {/* ─── OTO 1 & 2 — Party Creator Unlimited ─── */}
            <Route
              path="/unlimited"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="Unlimited">
                    <Unlimited />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ─── OTO 3 — Premium Party Design Studio ─── */}
            <Route
              path="/premium-design-studio"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="DesignStudio">
                    <PremiumDesignStudio />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ─── OTO 4 & 5 — AI Party Business Studio (Silver + Gold) ─── */}
            <Route
              path="/business-studio"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="BusinessStudio">
                    <AIPartyBusinessStudio />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ─── OTO 7 & 8 — AI Party Traffic Machine (Lite + Max) ─── */}
            <Route
              path="/traffic-machine"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="TrafficMax">
                    <TrafficMachine />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ─── OTO 9 & 10 — DFY Party Product (Silver + Gold) ─── */}
            <Route
              path="/dfy-pack"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="dfyPartyProduct">
                    <DfyPack />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ─── OTO 11 — Agency License ─── */}
            <Route
              path="/agency"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="agencyLicense">
                    <Agency />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ─── OTO 12 — Reseller License ─── */}
            <Route
              path="/reseller"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="resellerLicense">
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
