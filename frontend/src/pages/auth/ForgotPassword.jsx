// frontend/src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import loginBg from "../../assets/login-img.png";
import logo from "../../assets/nav-logo.png";
import {
  ArrowRight,
  Mail,
  LockKeyhole,
  Sparkles,
  Users,
  CheckCircle2,
  Gamepad2,
  FileText,
  Gift,
  ShoppingCart,
} from "lucide-react";

// ================================================================
// GLOBAL STYLES — AI Party Product Factory theme (matches Login.jsx)
// ================================================================
function LoginStyles() {
  return (
    <style>{`
      /* ---- Gradient UNDER, inherited image ON TOP ---- */
      .pp-page-bg {
        background-image:
          url("${loginBg}"),
          linear-gradient(125deg, #f9efff 0%, #eec8fa 56%, #d79af6 100%);
        background-size: cover, cover;
        background-position: center, center;
        background-repeat: no-repeat, no-repeat;
        position: relative;
        isolation: isolate;
      }

      /* Light veil so text stays readable over the image */
      .pp-page-bg::before {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.18);
        pointer-events: none;
        z-index: 0;
      }

      .pp-gradient-text {
        background: linear-gradient(90deg, #ed008e, #db007c);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .pp-login-card {
        background: linear-gradient(145deg, rgba(255,255,255,.91), rgba(255,255,255,.77));
        border: 1.5px solid rgba(255,255,255,.9);
        box-shadow: 0 24px 40px rgba(101,38,177,.13), 0 2px 0 rgba(140,61,255,.24);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }

      .pp-field {
        height: 52px;
        border: 2px solid #e3d4fa;
        border-radius: 18px;
        background: rgba(255,255,255,.4);
        padding: 0 16px 0 54px;
        width: 100%;
        outline: none;
        color: #1c1045;
        font-weight: 500;
        font-size: 15px;
      }
      .pp-field:focus {
        border-color: #a02aff;
        box-shadow: 0 0 0 3px rgba(160,42,255,.08);
      }
      .pp-field::placeholder { color: #69618d; }

      .pp-pill {
        background: rgba(255,255,255,.64);
        border: 1px solid #ecd8ff;
        box-shadow: 0 5px 12px rgba(104,39,180,.11);
        border-radius: 30px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        white-space: nowrap;
        color: #1c1045;
      }

      .pp-primary {
        background: linear-gradient(105deg, #b72dea 0%, #8006d9 55%, #43009b 100%);
        box-shadow: 0 12px 22px rgba(106,21,185,.18);
        transition: filter .2s ease;
      }
      .pp-primary:hover:not(:disabled) { filter: brightness(1.06); }
      .pp-primary:disabled { opacity: .55; cursor: not-allowed; }

      .pp-accent { color: #8500f4; }

      .pp-left-title {
        font-size: clamp(28px, 3.4vw, 58px);
        line-height: 1.09;
        letter-spacing: -1.5px;
        font-weight: 900;
        color: #31066f;
      }

      /* ---- 320px+ responsive tweaks ---- */
      @media (max-width: 360px) {
        .pp-left-title { font-size: 26px !important; letter-spacing: -0.8px; }
        .pp-pill { padding: 6px 10px; font-size: 12px; gap: 6px; }
        .pp-field { font-size: 14px; padding-left: 48px; height: 48px; }
      }
    `}</style>
  );
}

// ================================================================
// FORGOT PASSWORD COMPONENT (logic unchanged)
// ================================================================
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/forgot", { email });
      setSent(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pp-page-bg relative isolate min-h-screen w-full overflow-x-hidden">
      <LoginStyles />

      {/* ============================================ */}
      {/* MOBILE / TABLET (< lg) — stacked, scroll ok */}
      {/* ============================================ */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1536px] flex-col items-center px-4 py-6 sm:px-6 lg:hidden">
        {/* LOGO */}
        <div className="mb-6 flex w-full items-center justify-center">
          <div className="flex h-[60px] w-[200px] items-center justify-center sm:h-[80px] sm:w-[260px]">
            <img
              src={logo}
              alt="AI Party Product Factory"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* HERO TEXT */}
        <div className="relative w-full text-left">
          <h1 className="pp-left-title">
            Forgot Password?
            <br />
            Reset Your Account <span className="pp-gradient-text">Safely</span>
          </h1>
          <p className="mt-3 max-w-[650px] text-[15px] font-semibold leading-[1.45] text-[#67608f] sm:text-[17px]">
            Enter your email and we'll send a secure reset link. No waiting. No
            hassle.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            <span className="pp-pill text-[12px] sm:text-[14px]">
              <LockKeyhole
                className="pp-accent h-5 w-5 sm:h-6 sm:w-6"
                strokeWidth={2}
              />
              Secure Reset Link
            </span>
            <span className="pp-pill text-[12px] sm:text-[14px]">
              <Sparkles
                className="h-5 w-5 text-fuchsia-500 sm:h-6 sm:w-6"
                strokeWidth={2}
              />
              Quick &amp; Easy
            </span>
            <span className="pp-pill text-[12px] sm:text-[14px]">
              <Users
                className="h-5 w-5 text-pink-500 sm:h-6 sm:w-6"
                strokeWidth={2}
              />
              24/7 Support
            </span>
          </div>
        </div>

        {/* FORGOT PASSWORD CARD */}
        <section className="pp-login-card mt-6 w-full max-w-[560px] rounded-[28px] px-5 py-6 sm:rounded-[36px] sm:px-8 sm:py-8">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-[60px] w-[200px] items-center justify-center">
              <img
                src={logo}
                alt="AI Party Product Factory"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <h2 className="text-center text-[26px] font-extrabold tracking-tight text-[#130b36] sm:text-[32px]">
            Reset Password
          </h2>
          <p className="mt-1.5 text-center text-[13px] font-semibold text-[#6b6594] sm:text-[15px]">
            Enter your email to receive a reset link.
          </p>

          {sent && (
            <div
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2"
              style={{
                border: "1px solid rgba(34,197,94,.35)",
                background:
                  "linear-gradient(90deg, rgba(34,197,94,.12), rgba(16,185,129,.08))",
              }}
            >
              <CheckCircle2
                size={14}
                style={{ color: "#16a34a", flexShrink: 0 }}
              />
              <span className="text-[11px] font-semibold tracking-[.2px] text-green-700">
                Reset link sent! Check your email.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on" className="mt-5">
            <label
              htmlFor="m-email"
              className="mb-1.5 block text-[14px] font-bold text-[#33265e]"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-[16px] top-1/2 h-5 w-5 -translate-y-1/2 text-[#77709f]"
                strokeWidth={2}
              />
              <input
                id="m-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="pp-field"
                aria-label="Email Address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pp-primary mt-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-[18px] text-[17px] font-bold text-white"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.25"
                    />
                    <path
                      fill="currentColor"
                      opacity="0.75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link{" "}
                  <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[13px] font-semibold text-[#585184] sm:text-[14px]">
            Remembered it?{" "}
            <Link
              to="/login"
              className="ml-1 text-[14px] font-extrabold text-[#7d00ef] hover:underline sm:text-[16px]"
            >
              Back to Sign In
            </Link>
          </p>
        </section>
      </div>

      {/* ============================================ */}
      {/* DESKTOP (>= lg) — 100vh, no scroll */}
      {/* ============================================ */}
      <div className="relative z-10 mx-auto hidden h-screen w-full max-w-[1536px] grid-cols-[1.13fr_1fr] items-center gap-10 px-[6.6%] py-8 lg:grid">
        {/* LEFT HERO */}
        <section className="flex h-full min-h-0 flex-col justify-center text-left">
          {/* LOGO */}
          <div className="mb-6 flex flex-none items-center">
            <div className="flex h-[80px] w-[260px] flex-none items-center justify-start">
              <img
                src={logo}
                alt="AI Party Product Factory"
                className="h-full w-full object-contain object-left"
              />
            </div>
          </div>

          <div className="relative flex-none">
            <h1 className="pp-left-title">
              Forgot Password?
              <br />
              Reset Your Account{" "}
              <span className="pp-gradient-text">Safely</span>
            </h1>
            <span className="pointer-events-none absolute right-[2%] top-[6%] text-3xl text-[#ffb500]">
              ✦
            </span>
            <p className="mt-4 max-w-[650px] text-[18px] font-semibold leading-[1.45] text-[#67608f]">
              Enter your email and we'll send a secure reset link. No waiting.
              No hassle.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="pp-pill text-[14px]">
                <LockKeyhole className="pp-accent h-6 w-6" strokeWidth={2} />
                Secure Reset Link
              </span>
              <span className="pp-pill text-[14px]">
                <Sparkles
                  className="h-6 w-6 text-fuchsia-500"
                  strokeWidth={2}
                />
                Quick &amp; Easy
              </span>
              <span className="pp-pill text-[14px]">
                <Users className="h-6 w-6 text-pink-500" strokeWidth={2} />
                24/7 Support
              </span>
            </div>
          </div>

          {/* ART PLACEHOLDER — takes remaining space, never overflows */}
          <div className="mt-4 min-h-0 flex-1" />
        </section>

        {/* RIGHT FORGOT PASSWORD PANEL */}
        <section className="pp-login-card mx-auto w-full max-w-[520px] rounded-[36px] px-10 py-8">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-[60px] w-[200px] items-center justify-center">
              <img
                src={logo}
                alt="AI Party Product Factory"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <h2 className="text-center text-[34px] font-extrabold tracking-tight text-[#130b36]">
            Reset Password
          </h2>
          <p className="mt-1.5 text-center text-[15px] font-semibold text-[#6b6594]">
            Enter your email to receive a reset link.
          </p>

          {sent && (
            <div
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2"
              style={{
                border: "1px solid rgba(34,197,94,.35)",
                background:
                  "linear-gradient(90deg, rgba(34,197,94,.12), rgba(16,185,129,.08))",
              }}
            >
              <CheckCircle2
                size={14}
                style={{ color: "#16a34a", flexShrink: 0 }}
              />
              <span className="text-[11px] font-semibold tracking-[.2px] text-green-700">
                Reset link sent! Check your email.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on" className="mt-6">
            <label
              htmlFor="d-email"
              className="mb-1.5 block text-[15px] font-bold text-[#33265e]"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-[18px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-[#77709f]"
                strokeWidth={2}
              />
              <input
                id="d-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="pp-field"
                aria-label="Email Address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pp-primary mt-6 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[22px] text-[19px] font-bold text-white"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.25"
                    />
                    <path
                      fill="currentColor"
                      opacity="0.75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link{" "}
                  <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.2} />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[14px] font-semibold text-[#585184]">
            Remembered it?{" "}
            <Link
              to="/login"
              className="ml-1 text-[16px] font-extrabold text-[#7d00ef] hover:underline"
            >
              Back to Sign In
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;
