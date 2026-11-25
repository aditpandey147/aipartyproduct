// frontend/src/pages/support/Support.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Search,
  HelpCircle,
  Key,
  Lock,
  User,
  LogIn,
  Shield,
  Copy,
  ExternalLink,
  Headphones,
  Clock,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  BookOpen,
  CheckCircle,
  Sparkles,
  Mic2,
  Radio,
  Palette,
  TrendingUp,
  Film,
  Infinity as InfinityIcon,
  Crown,
  Building2,
} from "lucide-react";

// ================================================================
// 🎨 THEME — updated to match your app
// ================================================================
const C = {
  mainBg: "#faf9ff",
  card: "rgba(255,255,255,.76)",
  cardSecondary: "#ffffff",
  input: "#ffffff",
  gold: "#8200ff",              // primary purple (was gold)
  goldHover: "#8e15e5",
  darkGold: "#4e118c",          // deep purple (was dark gold)
  cyan: "#ec4899",              // pink accent (was cyan)
  heading: "#151032",           // dark text
  secondary: "#62558f",         // muted purple
  muted: "#8b7fb3",             // lighter muted
  border: "#e0d8ff",            // lavender border
  rose: "#ec4899",              // pink
  goldGradient:
    "linear-gradient(110deg,#d634ef 0%,#8e15e5 50%,#4d00af 100%)",
  textLink: "#8500f8",
  purpleBg: "rgba(130,0,255,.08)",
  purpleBorder: "rgba(130,0,255,.35)",
  pinkBg: "rgba(236,72,153,.08)",
  pinkBorder: "rgba(236,72,153,.35)",
};

const Support = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("credentials");

  const APP_URL =
    import.meta.env.VITE_APP_URL || "https://podcastai.albinolabs.com";
  const SUPPORT_DESK_URL = "https://supportalbinolabs.tawk.help/";

  const userCredentials = {
    appUrl: APP_URL,
    loginEmail: user?.email || "Your purchase email",
    defaultPassword: user?.email || "Your purchase email (default password)",
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(label);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const loginFaqs = [
    {
      id: 1,
      question: "What is my login email?",
      answer:
        "Your login email is the email address you used to purchase PodcastAI. This is the email where you received your purchase confirmation and login credentials.",
      icon: "📧",
    },
    {
      id: 2,
      question: "What is my default password?",
      answer:
        "Your default password is exactly the same as your purchase email. For example, if you purchased with 'john@example.com', your default password is also 'john@example.com'. We recommend changing this after your first login for security.",
      icon: "🔑",
    },
    {
      id: 3,
      question: "How do I login to my account?",
      answer:
        "1. Go to podcastai.albinolabs.com\n2. Enter your purchase email as your login email\n3. Enter your purchase email as your password (same as login email)\n4. Click 'Login' to access your dashboard",
      icon: "🎙️",
    },
    {
      id: 4,
      question: "I forgot my password. What should I do?",
      answer:
        "If you've forgotten your password, click the 'Forgot Password' link on the login page. Enter your purchase email, and we'll send you a password reset link. You can then create a new password.",
      icon: "🔄",
    },
    {
      id: 5,
      question: "Can I change my password?",
      answer:
        "Yes! Once logged in, go to Settings > Security > Change Password. Enter your current password and your new password. Make sure to save your new password in a safe place.",
      icon: "🔐",
    },
    {
      id: 6,
      question: "Why is my password the same as my email?",
      answer:
        "For security and convenience, we automatically set your password to match your purchase email. This ensures you can login immediately after purchase. You can change this anytime from your settings.",
      icon: "💡",
    },
    {
      id: 7,
      question: "How do I add team members to my Agency plan?",
      answer:
        "If you have the Agency plan, go to the Agency page in the sidebar. Click 'Add Member' and enter their name, email, and a password. They'll instantly get access to your subscription — no separate billing required.",
      icon: "🏢",
    },
    {
      id: 8,
      question: "I'm having trouble logging in. What should I do?",
      answer:
        "If you're having trouble logging in, try these steps:\n1. Make sure you're using the correct email (the one you purchased with)\n2. Your password is the same as your email (case sensitive)\n3. Clear your browser cache and cookies\n4. Try a different browser or device\n5. If still having issues, contact our support team via Support Ticket or email.",
      icon: "🆘",
    },
  ];

  const tabs = [
    { id: "credentials", label: "Login Credentials", icon: Key },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "help", label: "Help Topics", icon: BookOpen },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = loginFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ background: C.mainBg }}>
      <div className="flex-1 ml-0 flex flex-col min-h-screen">
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 78% 5%, #f2edff 0%, transparent 40%)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* ===== HERO ===== */}
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8"
              style={{
                background:
                  "linear-gradient(135deg, #f6e9ff 0%, #f9e5fa 60%, #e6caff 100%)",
                border: `1px solid ${C.purpleBorder}`,
                boxShadow: "0 22px 70px rgba(80,40,160,.1)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
                style={{ background: "rgba(236,72,153,.08)" }}
              />
              <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
                style={{ background: "rgba(130,0,255,.06)" }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  {/* Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                    style={{
                      background: "rgba(255,255,255,.8)",
                      border: `1px solid ${C.purpleBorder}`,
                      color: C.gold,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: C.rose,
                        boxShadow: `0 0 12px ${C.rose}`,
                      }}
                    />
                    24/7 Support Available
                  </div>

                  <h1
                    className="font-['Playfair_Display',Georgia,serif] text-4xl md:text-5xl font-bold mb-4 leading-tight"
                    style={{ color: C.darkGold }}
                  >
                    How can we{" "}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: C.goldGradient,
                        WebkitBackgroundClip: "text",
                      }}
                    >
                      support
                    </span>{" "}
                    you?
                  </h1>

                  <p
                    className="text-lg max-w-2xl"
                    style={{ color: C.secondary }}
                  >
                    Get instant answers, find solutions, and connect with our
                    support team.
                  </p>

                  {/* Search */}
                  <div className="max-w-xl mt-6">
                    <div
                      className="relative rounded-2xl"
                      style={{
                        background: C.input,
                        border: `1px solid ${C.border}`,
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <div className="flex items-center px-5">
                        <Search size={20} style={{ color: C.muted }} />
                        <input
                          type="text"
                          placeholder="Search for help..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm"
                          style={{ color: C.heading }}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="transition"
                            style={{ color: C.muted }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-end gap-4">
                  {[
                    { value: "24/7", label: "Support Available" },
                    { value: "100%", label: "Satisfaction Rate" },
                    { value: "5★", label: "User Rating" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 text-center min-w-[110px]"
                      style={{
                        background: "rgba(255,255,255,.9)",
                        border: `1px solid ${C.purpleBorder}`,
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <div
                        className="text-3xl font-bold"
                        style={{ color: C.gold }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: C.secondary }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== TWO COLUMN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===== LEFT COLUMN - Tabs ===== */}
              <div className="lg:col-span-1">
                <div
                  className="rounded-2xl p-4 sticky top-4"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(80,40,160,.06)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider mb-4 px-2"
                    style={{ color: C.secondary }}
                  >
                    Support Topics
                  </h3>

                  <div className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                          style={
                            isActive
                              ? {
                                  background: C.goldGradient,
                                  color: "#fff",
                                  boxShadow:
                                    "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 24px rgba(130,0,255,.35)",
                                }
                              : {
                                  color: C.secondary,
                                }
                          }
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = C.purpleBg;
                              e.currentTarget.style.color = C.heading;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = C.secondary;
                            }
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: isActive
                                ? "rgba(255,255,255,.2)"
                                : C.input,
                              border: isActive
                                ? "1px solid rgba(255,255,255,.3)"
                                : `1px solid ${C.border}`,
                            }}
                          >
                            <Icon
                              size={16}
                              style={{
                                color: isActive ? "#fff" : C.gold,
                              }}
                            />
                          </div>
                          <span className="flex-1 text-left">{tab.label}</span>
                          {isActive && (
                            <div
                              className="w-1.5 h-6 rounded-full"
                              style={{ background: "rgba(255,255,255,.5)" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Contact */}
                  <div
                    className="mt-6 pt-6"
                    style={{ borderTop: `1px solid ${C.border}` }}
                  >
                    <h4
                      className="text-xs font-medium uppercase tracking-wider mb-3"
                      style={{ color: C.secondary }}
                    >
                      Quick Contact
                    </h4>
                    <a
                      href={SUPPORT_DESK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                      style={{
                        background: C.purpleBg,
                        color: C.gold,
                        border: `1px solid ${C.purpleBorder}`,
                      }}
                    >
                      <MessageCircle size={18} />
                      Support
                      <ExternalLink
                        size={14}
                        className="ml-auto"
                        style={{ color: C.muted }}
                      />
                    </a>
                  </div>

                  {/* Support Hours */}
                  <div
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      background: C.pinkBg,
                      border: `1px solid ${C.pinkBorder}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} style={{ color: C.rose }} />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: C.heading }}
                      >
                        Support Hours
                      </span>
                    </div>
                    <div
                      className="space-y-1 text-xs"
                      style={{ color: C.secondary }}
                    >
                      <p>Mon-Fri: 9:00 AM - 9:00 PM EST</p>
                      <p>Sat-Sun: 10:00 AM - 6:00 PM EST</p>
                      <p
                        className="font-medium mt-1"
                        style={{ color: C.rose }}
                      >
                        ⚡ Average response: &lt; 2 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN - Content ===== */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(80,40,160,.06)",
                  }}
                >
                  {/* ===== CREDENTIALS TAB ===== */}
                  {activeTab === "credentials" && (
                    <div>
                      <div
                        className="px-6 py-5"
                        style={{ background: C.goldGradient }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,.2)" }}
                          >
                            <Key size={20} style={{ color: "#fff" }} />
                          </div>
                          <div>
                            <h2
                              className="text-xl font-bold"
                              style={{ color: "#fff" }}
                            >
                              Login Credentials
                            </h2>
                            <p
                              className="text-sm"
                              style={{ color: "#fff", opacity: 0.85 }}
                            >
                              Use these credentials to login to your account
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Email */}
                          <div
                            className="rounded-xl p-5 transition"
                            style={{
                              background: C.input,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p
                                  className="text-xs font-medium uppercase tracking-wider flex items-center gap-2"
                                  style={{ color: C.secondary }}
                                >
                                  <User size={14} style={{ color: C.muted }} />
                                  Login Email
                                </p>
                                <p
                                  className="text-base font-bold mt-2 font-mono break-all"
                                  style={{ color: C.heading }}
                                >
                                  {userCredentials.loginEmail}
                                </p>
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: C.muted }}
                                >
                                  Your purchase email is your login email
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    userCredentials.loginEmail,
                                    "Login Email"
                                  )
                                }
                                className="p-2.5 rounded-xl transition"
                                style={{ color: C.muted }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = C.gold;
                                  e.currentTarget.style.background = C.purpleBg;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = C.muted;
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          <div
                            className="rounded-xl p-5 transition"
                            style={{
                              background: C.pinkBg,
                              border: `1px solid ${C.pinkBorder}`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p
                                  className="text-xs font-medium uppercase tracking-wider flex items-center gap-2"
                                  style={{ color: C.secondary }}
                                >
                                  <Lock size={14} style={{ color: C.muted }} />
                                  Default Password
                                </p>
                                <p
                                  className="text-base font-bold mt-2 font-mono break-all"
                                  style={{ color: C.heading }}
                                >
                                  {userCredentials.defaultPassword}
                                </p>
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: C.rose }}
                                >
                                  ⚠️ Your purchase email is your default password
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    userCredentials.defaultPassword,
                                    "Default Password"
                                  )
                                }
                                className="p-2.5 rounded-xl transition"
                                style={{ color: C.muted }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = C.rose;
                                  e.currentTarget.style.background = C.pinkBg;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = C.muted;
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* How to Login */}
                          <div
                            className="rounded-xl p-5"
                            style={{
                              background: C.input,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  background: C.purpleBg,
                                  border: `1px solid ${C.purpleBorder}`,
                                }}
                              >
                                <LogIn size={16} style={{ color: C.gold }} />
                              </div>
                              <div>
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: C.heading }}
                                >
                                  How to Login
                                </p>
                                <ol
                                  className="text-sm mt-2 space-y-1.5 list-decimal list-inside"
                                  style={{ color: C.secondary }}
                                >
                                  <li>
                                    Go to{" "}
                                    <strong style={{ color: C.gold }}>
                                      {userCredentials.appUrl}
                                    </strong>
                                  </li>
                                  <li>
                                    Enter your <strong>Login Email</strong>
                                  </li>
                                  <li>
                                    Enter your <strong>Default Password</strong>
                                  </li>
                                  <li>
                                    Click <strong>Login</strong> to access your
                                    dashboard
                                  </li>
                                </ol>
                              </div>
                            </div>
                          </div>

                          {/* Security Tip */}
                          <div
                            className="rounded-xl p-5"
                            style={{
                              background: C.purpleBg,
                              border: `1px solid ${C.purpleBorder}`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  background: "rgba(130,0,255,.15)",
                                  border: `1px solid ${C.purpleBorder}`,
                                }}
                              >
                                <Shield size={16} style={{ color: C.gold }} />
                              </div>
                              <div>
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: C.heading }}
                                >
                                  Security Tip
                                </p>
                                <p
                                  className="text-sm mt-2 leading-relaxed"
                                  style={{ color: C.secondary }}
                                >
                                  For better security, we recommend changing
                                  your password after first login. Go to{" "}
                                  <strong style={{ color: C.gold }}>
                                    Settings → Security → Change Password
                                  </strong>
                                  .
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== FAQ TAB ===== */}
                  {activeTab === "faq" && (
                    <div>
                      <div
                        className="px-6 py-5"
                        style={{ background: C.goldGradient }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,.2)" }}
                          >
                            <HelpCircle size={20} style={{ color: "#fff" }} />
                          </div>
                          <div>
                            <h2
                              className="text-xl font-bold"
                              style={{ color: "#fff" }}
                            >
                              Frequently Asked Questions
                            </h2>
                            <p
                              className="text-sm"
                              style={{ color: "#fff", opacity: 0.85 }}
                            >
                              Common questions about logging into your account
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {filteredFaqs.length > 0 ? (
                          <div className="space-y-3">
                            {filteredFaqs.map((faq) => {
                              const isOpen = expandedFaq === faq.id;
                              return (
                                <div
                                  key={faq.id}
                                  className="rounded-xl overflow-hidden transition-all duration-200"
                                  style={{
                                    background: isOpen
                                      ? C.purpleBg
                                      : "rgba(255,255,255,.6)",
                                    border: isOpen
                                      ? `1px solid ${C.purpleBorder}`
                                      : `1px solid ${C.border}`,
                                    boxShadow: isOpen
                                      ? "0 8px 24px rgba(80,40,160,.08)"
                                      : "none",
                                  }}
                                >
                                  <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full px-5 py-4 text-left flex items-start gap-3 transition"
                                  >
                                    <span className="text-2xl mt-0.5 shrink-0">
                                      {faq.icon}
                                    </span>
                                    <span
                                      className="text-sm font-medium pr-4 flex-1"
                                      style={{ color: C.heading }}
                                    >
                                      {faq.question}
                                    </span>
                                    <span
                                      className="transition-transform duration-300 shrink-0 mt-1"
                                      style={{
                                        transform: isOpen
                                          ? "rotate(180deg)"
                                          : "rotate(0)",
                                        color: isOpen ? C.gold : C.muted,
                                      }}
                                    >
                                      <ChevronDown size={18} />
                                    </span>
                                  </button>

                                  {isOpen && (
                                    <div
                                      className="px-5 pb-4 pt-0"
                                      style={{
                                        borderTop: `1px solid ${C.border}`,
                                      }}
                                    >
                                      <p
                                        className="text-sm leading-relaxed whitespace-pre-line pt-4"
                                        style={{ color: C.secondary }}
                                      >
                                        {faq.answer}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="text-5xl mb-4">🔍</div>
                            <p style={{ color: C.secondary }}>
                              No results found for "
                              <strong style={{ color: C.gold }}>
                                {searchQuery}
                              </strong>
                              "
                            </p>
                            <button
                              onClick={() => setSearchQuery("")}
                              className="mt-3 text-sm font-medium transition"
                              style={{ color: C.gold }}
                            >
                              Clear search
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== HELP TOPICS TAB ===== */}
                  {activeTab === "help" && (
                    <div>
                      <div
                        className="px-6 py-5"
                        style={{ background: C.goldGradient }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,.2)" }}
                          >
                            <BookOpen size={20} style={{ color: "#fff" }} />
                          </div>
                          <div>
                            <h2
                              className="text-xl font-bold"
                              style={{ color: "#fff" }}
                            >
                              Help Topics
                            </h2>
                            <p
                              className="text-sm"
                              style={{ color: "#fff", opacity: 0.85 }}
                            >
                              Browse through our help articles and guides
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              icon: Mic2,
                              title: "Podcast Creation",
                              desc: "Create stunning AI-powered podcast videos",
                            },
                            {
                              icon: Sparkles,
                              title: "AI Dialogue",
                              desc: "Generate natural host & guest dialogues",
                            },
                            {
                              icon: Palette,
                              title: "Branding Suite",
                              desc: "Build a complete brand identity with AI",
                            },
                            {
                              icon: TrendingUp,
                              title: "Growth Studio",
                              desc: "Grow your podcast with AI insights",
                            },
                            {
                              icon: Film,
                              title: "Viral Shorts AI",
                              desc: "Turn episodes into viral short clips",
                            },
                            {
                              icon: Building2,
                              title: "Agency Management",
                              desc: "Add team members and share your plan",
                            },
                          ].map((topic, i) => {
                            const Icon = topic.icon;
                            return (
                              <div
                                key={i}
                                className="p-4 rounded-xl transition cursor-pointer"
                                style={{
                                  background: C.input,
                                  border: `1px solid ${C.border}`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = C.purpleBg;
                                  e.currentTarget.style.borderColor =
                                    C.purpleBorder;
                                  e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = C.input;
                                  e.currentTarget.style.borderColor =
                                    C.border;
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                      background: C.purpleBg,
                                      border: `1px solid ${C.purpleBorder}`,
                                    }}
                                  >
                                    <Icon
                                      size={18}
                                      style={{ color: C.gold }}
                                    />
                                  </div>
                                  <div>
                                    <h4
                                      className="text-sm font-semibold"
                                      style={{ color: C.heading }}
                                    >
                                      {topic.title}
                                    </h4>
                                    <p
                                      className="text-xs mt-1"
                                      style={{ color: C.secondary }}
                                    >
                                      {topic.desc}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== CTA ===== */}
                <div
                  className="mt-6 relative overflow-hidden rounded-2xl p-8 text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #f6e9ff 0%, #f9e5fa 100%)",
                    border: `1px solid ${C.purpleBorder}`,
                    boxShadow: "0 22px 70px rgba(80,40,160,.1)",
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl"
                    style={{ background: "rgba(236,72,153,.12)" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl"
                    style={{ background: "rgba(130,0,255,.08)" }}
                  />

                  <div className="relative z-10">
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background: C.purpleBg,
                        border: `1px solid ${C.purpleBorder}`,
                      }}
                    >
                      <MessageCircle size={28} style={{ color: C.gold }} />
                    </div>
                    <h3
                      className="font-['Playfair_Display',Georgia,serif] text-2xl font-bold mb-3"
                      style={{ color: C.darkGold }}
                    >
                      Still Need Help?
                    </h3>
                    <p
                      className="mb-6 max-w-md mx-auto"
                      style={{ color: C.secondary }}
                    >
                      Our support team is ready to assist you with any
                      questions.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <a
                        href={SUPPORT_DESK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-[1px]"
                        style={{
                          background: C.goldGradient,
                          color: "#fff",
                          border: `1px solid ${C.goldHover}`,
                          boxShadow:
                            "inset 0 1px 1px rgba(255,255,255,.25), 0 8px 24px rgba(130,0,255,.4)",
                        }}
                      >
                        <MessageCircle size={18} />
                        Contact Support
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;