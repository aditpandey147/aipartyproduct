// frontend/src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import loginBg from "../../assets/login-img.png";
import logo from "../../assets/nav-logo.png";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  ShieldCheck,
  XCircle,
  Clock,
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
// SHARED CARD SHELL — matches Login.jsx exactly
// ================================================================
function CardShell({ children, className = "" }) {
  return (
    <section className={`pp-login-card mx-auto w-full max-w-[520px] rounded-[36px] px-10 py-8 ${className}`}>
      {children}
    </section>
  );
}

// ================================================================
// RESET PASSWORD CARD — 3 states (checking / invalid / valid form)
// ================================================================
function ResetPasswordCard({
  password,
  setPassword,
  loading,
  handleSubmit,
  valid,
  checking,
}) {
  const [showPassword, setShowPassword] = useState(false);

  // -------- STATE 1: CHECKING --------
  if (checking) {
    return (
      <CardShell>
        <h2 className="text-center text-[34px] font-extrabold tracking-tight text-[#130b36]">
          Verifying Link...
        </h2>
        <p className="mt-1.5 text-center text-[15px] font-semibold text-[#6b6594]">
          Please wait while we verify your reset link.
        </p>
        <div
          className="mx-auto mt-6 grid place-items-center"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(160,42,255,.14), transparent 70%)",
            border: "1px solid rgba(160,42,255,.28)",
          }}
        >
          <svg className="animate-spin" width="34" height="34" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="rgba(160,42,255,.9)"
              strokeWidth="3"
              fill="none"
              opacity="0.25"
            />
            <path
              fill="rgba(160,42,255,.95)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </CardShell>
    );
  }

  // -------- STATE 2: INVALID --------
  if (!valid) {
    return (
      <CardShell>
        <h2 className="text-center text-[34px] font-extrabold tracking-tight text-[#130b36]">
          Invalid Link
        </h2>
        <p className="mt-1.5 text-center text-[15px] font-semibold text-[#6b6594]">
          This password reset link has expired or is invalid.
        </p>

        <div
          className="mx-auto mt-5 grid place-items-center"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(239,68,68,.16), transparent 70%)",
            border: "1px solid rgba(239,68,68,.35)",
          }}
        >
          <XCircle size={34} style={{ color: "#dc2626" }} />
        </div>

        <div
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2"
          style={{
            border: "1px solid rgba(251,191,36,.35)",
            background:
              "linear-gradient(90deg, rgba(251,191,36,.12), rgba(245,158,11,.08))",
          }}
        >
          <Clock size={14} style={{ color: "#d97706", flexShrink: 0 }} />
          <span className="text-[11px] font-semibold tracking-[.2px] text-amber-700">
            Reset links expire after 1 hour
          </span>
        </div>

        <Link
          to="/forgot-password"
          className="pp-primary mt-6 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[22px] text-[19px] font-bold text-white"
        >
          ← Request New Link
        </Link>

        <p className="mt-5 text-center text-[14px] font-semibold text-[#585184]">
          Remembered it?{" "}
          <Link to="/login" className="ml-1 text-[16px] font-extrabold text-[#7d00ef] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </CardShell>
    );
  }

  // -------- STATE 3: VALID FORM --------
  return (
    <CardShell>
      <h2 className="text-center text-[34px] font-extrabold tracking-tight text-[#130b36]">
        Set New Password
      </h2>
      <p className="mt-1.5 text-center text-[15px] font-semibold text-[#6b6594]">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} autoComplete="on" className="mt-6">
        <label htmlFor="d-password" className="mb-1.5 block text-[15px] font-bold text-[#33265e]">
          New Password
        </label>
        <div className="relative">
          <LockKeyhole
            className="absolute left-[18px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-[#77709f]"
            strokeWidth={2}
          />
          <input
            id="d-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            autoComplete="new-password"
            required
            minLength={6}
            className="pp-field pr-12"
            aria-label="New Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77709f] transition hover:text-[#a02aff]"
          >
            {showPassword ? (
              <Eye className="h-[22px] w-[22px]" strokeWidth={2} />
            ) : (
              <EyeOff className="h-[22px] w-[22px]" strokeWidth={2} />
            )}
          </button>
        </div>

        <p className="mt-2 text-[12px] leading-[1.4] text-[#8b95a5]">
          Password must be at least 6 characters long.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="pp-primary mt-6 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[22px] text-[19px] font-bold text-white"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Resetting...
            </>
          ) : (
            <>
              Reset Password <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.2} />
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-[14px] font-semibold text-[#585184]">
        Remembered it?{" "}
        <Link to="/login" className="ml-1 text-[16px] font-extrabold text-[#7d00ef] hover:underline">
          Back to Sign In
        </Link>
      </p>
    </CardShell>
  );
}

// ================================================================
// MAIN COMPONENT (logic unchanged)
// ================================================================
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/password/verify/${token}`);
        setValid(true);
      } catch {
        setValid(false);
      } finally {
        setChecking(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/reset", { token, password });
      toast.success("Password reset successful!");
      navigate("/login");
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
            Create a New Password
            <br />
            Secure Your Account <span className="pp-gradient-text">Safely</span>
          </h1>
          <p className="mt-3 max-w-[650px] text-[15px] font-semibold leading-[1.45] text-[#67608f] sm:text-[17px]">
            Choose a strong password with at least 6 characters. We'll update your account and send you back to sign in.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            <span className="pp-pill text-[12px] sm:text-[14px]">
              <LockKeyhole className="pp-accent h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
              Secure Reset
            </span>
            <span className="pp-pill text-[12px] sm:text-[14px]">
              <ShieldCheck className="h-5 w-5 text-fuchsia-500 sm:h-6 sm:w-6" strokeWidth={2} />
              Account Protected
            </span>
            <span className="pp-pill text-[12px] sm:text-[14px]">
              <Sparkles className="h-5 w-5 text-pink-500 sm:h-6 sm:w-6" strokeWidth={2} />
              Strong &amp; Memorable
            </span>
          </div>
        </div>

        {/* CARD */}
        <div className="mt-6 w-full max-w-[560px]">
          <ResetPasswordCard
            password={password}
            setPassword={setPassword}
            loading={loading}
            handleSubmit={handleSubmit}
            valid={valid}
            checking={checking}
          />
        </div>
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
              Create a New Password
              <br />
              Secure Your Account <span className="pp-gradient-text">Safely</span>
            </h1>
            <span className="pointer-events-none absolute right-[2%] top-[6%] text-3xl text-[#ffb500]">
              ✦
            </span>
            <p className="mt-4 max-w-[650px] text-[18px] font-semibold leading-[1.45] text-[#67608f]">
              Choose a strong password with at least 6 characters. We'll update your account and send you back to sign in.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="pp-pill text-[14px]">
                <LockKeyhole className="pp-accent h-6 w-6" strokeWidth={2} />
                Secure Reset
              </span>
              <span className="pp-pill text-[14px]">
                <ShieldCheck className="h-6 w-6 text-fuchsia-500" strokeWidth={2} />
                Account Protected
              </span>
              <span className="pp-pill text-[14px]">
                <Sparkles className="h-6 w-6 text-pink-500" strokeWidth={2} />
                Strong &amp; Memorable
              </span>
            </div>
          </div>

          {/* ART PLACEHOLDER — takes remaining space, never overflows */}
          <div className="mt-4 min-h-0 flex-1" />
        </section>

        {/* RIGHT — RESET PASSWORD PANEL */}
        <ResetPasswordCard
          password={password}
          setPassword={setPassword}
          loading={loading}
          handleSubmit={handleSubmit}
          valid={valid}
          checking={checking}
        />
      </div>
    </main>
  );
};

export default ResetPassword;