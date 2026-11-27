// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeatures } from "../hooks/useFeatures";
import logo from "../assets/sidebar-logo.png";
import api from "../services/api";
import {
  LayoutDashboard,
  Crown,
  GraduationCap,
  Rocket,
  Headset,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Gift,
  Building2,
  Lightbulb,
  Tag,
  LayoutGrid,
  Infinity,
  Wand2,
  Briefcase,
  Package,
  Layers,   
} from "lucide-react";

// ================================================================
// 🎨 THEME — matches the HTML reference exactly
// ================================================================
const THEME = {
  sidebarBg: "linear-gradient(130deg, #fbfaff, #f2edff)",
  sidebarBorder: "#e8e2f8",
  brandPink: "#bd079e",
  brandInk: "#151032",
  navDefault: "#1a1243",
  navIcon: "#5b4b9b",
  navHoverBg: "#eee8ff",
  navActiveBg: "linear-gradient(100deg, #7924ff, #7d20e8)",
  navActiveText: "#ffffff",
  navActiveShadow: "0 5px 12px #7924ff30",
  navActiveBorder: "transparent",
  sectionText: "#8b7fb3",
  divider: "#e0daf2",
  dropdownBg: "#ffffff",
  dropdownBorder: "#e8e2f8",
  proCardBg: "linear-gradient(130deg, #e8ddff, #f8dafa)",
  proCardBorder: "#e4c9ff",
  violet: "#7620e8",
  pink: "#ec0b89",
  gold: "#ffb300",
  goldFill: "#ffc62d",
  ink: "#151032",
  muted: "#62558f",
};

// ================================================================
// BRAND LOGO (fallback if image missing)
// ================================================================
function BrandMark() {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-[14px] text-[22px] font-black text-white"
      style={{
        width: 55,
        height: 55,
        background: "linear-gradient(135deg, #b944ff, #5b00ce)",
        boxShadow: "0 5px 12px #9b4be233",
      }}
    >
      ✦
    </div>
  );
}

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { has } = useFeatures();
  const navigate = useNavigate();
  const [planName, setPlanName] = useState(user?.planName || "Free");
  const [planLoading, setPlanLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest("[data-hamburger]")
      ) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const fetchPlanName = async () => {
      if (!user?.planId) return;
      try {
        setPlanLoading(true);
        const response = await api.get("/plans");
        if (response.data && response.data.length > 0) {
          const planIds = user.planId || [1];
          const highestPlanId = Math.max(...planIds);
          const plan = response.data.find((p) => p.planId === highestPlanId);
          setPlanName(plan ? plan.name : user?.planName || "Free");
        }
      } catch (error) {
        console.error("Failed to fetch plan name:", error);
        setPlanName(user?.planName || "Free");
      } finally {
        setPlanLoading(false);
      }
    };
    fetchPlanName();
  }, [user?.planId]);

  // ================================================================
  // NAV ITEMS
  // ================================================================
  const navItems = [
    // ─── Always available (baseline — Free / FE) ───
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      path: "/product-ideas",
      label: "Product Ideas",
      icon: Lightbulb,
      show: true,
    },
    {
      path: "/product-generator",
      label: "Party Product Studio",
      icon: Sparkles,
      show: true,
    },
    {
      path: "/party-kit-builder",
      label: "Party Kit Builder",
      icon: Gift,
      show: true,
    },
    {
      path: "/my-creations",
      label: "My Creations",
      icon: LayoutGrid,
      show: true,
    },
    {
      path: "/unlimited",
      label: "Unlimited",
      icon: Infinity,
      show: has("Unlimited"),
    },
    {
      path: "/premium-design-studio",
      label: "Design Studio",
      icon: Wand2,
      show: has("DesignStudio"),
    },
    {
      path: "/business-studio",
      label: "Business Studio",
      icon: Briefcase,
      show: has("BusinessStudio"),
    },
    {
      path: "/bundle-empire",
      label: "Bundle Empire",
      icon: Layers,
      show: has("BundleEmpire"),
    },
    {
      path: "/traffic-machine",
      label: "Traffic Machine",
      icon: Rocket,
      show: has("TrafficMax"),
    },
    {
      path: "/dfy-pack",
      label: "DFY Pack",
      icon: Package,
      show: has("dfyPartyProduct"),
    },
    {
      path: "/agency",
      label: "Agency",
      icon: Building2,
      show: has("agencyLicense"),
    },
    {
      path: "/reseller",
      label: "Reseller",
      icon: Gift,
      show: has("resellerLicense"),
    },
    {
      path: "/training",
      icon: GraduationCap,
      label: "Training",
      show: true,
      target: "_blank",
    },
    {
      path: "/upgrades",
      icon: Rocket,
      label: "Upgrades",
      show: true,
      target: "_blank",
      external: true,
      href: "https://www.podcastai.live/upgrades",
    },
    {
      path: "/support",
      icon: Headset,
      label: "Support",
      show: true,
      target: "_blank",
    },
  ];

  const adminNavItem = {
    path: "/admin/dashboard",
    label: "Admin Panel",
    icon: Shield,
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  const visibleNavItems = navItems.filter((item) => item.show);
  const isExternalLink = (item) => item.external === true;

  // shared nav link styles (padding-based, no fixed height)
  const navLinkBase = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    borderRadius: 15,
    fontSize: 16,
    textDecoration: "none",
    margin: "0 0 4px",
    whiteSpace: "nowrap",
    transition: "background .15s ease, color .15s ease",
  };

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <>
      <style>{`
        .pp-sidebar { font-family: 'Inter', -apple-system, sans-serif; }
        .pp-sidebar nav::-webkit-scrollbar { width: 6px; }
        .pp-sidebar nav::-webkit-scrollbar-track { background: transparent; }
        .pp-sidebar nav::-webkit-scrollbar-thumb {
          background: rgba(121,36,255,.25);
          border-radius: 3px;
        }
        .pp-sidebar nav::-webkit-scrollbar-thumb:hover {
          background: rgba(121,36,255,.45);
        }
        @keyframes ppFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ppSlideUp {
          from { opacity: 0; transform: translateY(6px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>

      {/* MOBILE HAMBURGER */}
      <button
        data-hamburger
        onClick={toggleMobileSidebar}
        className="fixed md:hidden z-[60] grid place-items-center rounded-xl"
        style={{
          top: 14,
          left: 14,
          width: 44,
          height: 44,
          background: "#ffffff",
          border: `1px solid ${THEME.sidebarBorder}`,
          boxShadow: "0 8px 24px rgba(80,40,160,.15)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          transition: "all .2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = THEME.violet;
          e.currentTarget.style.background = "#f5f0ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = THEME.sidebarBorder;
          e.currentTarget.style.background = "#ffffff";
        }}
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? (
          <X size={22} style={{ color: THEME.violet }} />
        ) : (
          <Menu size={22} style={{ color: THEME.violet }} />
        )}
      </button>

      {/* MOBILE BACKDROP */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 md:hidden"
          style={{
            background: "rgba(21,16,50,.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 40,
            animation: "ppFadeIn .2s ease-out",
          }}
          onClick={closeMobileSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        ref={sidebarRef}
        className={`pp-sidebar fixed left-0 top-0 flex h-screen w-72 flex-col transition-transform duration-300 ease-out shrink-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{
          background: THEME.sidebarBg,
          borderRight: `1px solid ${THEME.sidebarBorder}`,
          zIndex: 50,
        }}
      >
        {/* BRAND — padding-based, no fixed height */}
        <div
          className="flex shrink-0 items-center gap-3 border-b border-[#e8e2f8]"
          style={{
            padding: "5px 27px",
            marginBottom: 6,
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt="AI Party Product Factory"
              className="shrink-0 object-contain"
              style={{ width: 280, height: 80 }}
            />
          ) : (
            <BrandMark />
          )}
        </div>

        {/* NAV — padding-based links */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: "0 18px 18px" }}
        >
          {user?.role === "admin" && (
            <NavLink
              to={adminNavItem.path}
              onClick={closeMobileSidebar}
              style={({ isActive }) => ({
                ...navLinkBase,
                background: isActive ? THEME.navActiveBg : "transparent",
                color: isActive ? THEME.navActiveText : THEME.navDefault,
                boxShadow: isActive ? THEME.navActiveShadow : "none",
                fontWeight: isActive ? 700 : 500,
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.background = THEME.navHoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Shield
                    size={23}
                    strokeWidth={2.1}
                    style={{
                      color: isActive ? "#fff" : THEME.navIcon,
                      flexShrink: 0,
                    }}
                  />
                  <span>{adminNavItem.label}</span>
                </>
              )}
            </NavLink>
          )}

          <div>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              if (isExternalLink(item)) {
                return (
                  <a
                    key={item.path}
                    href={item.href}
                    target={item.target || "_blank"}
                    rel="noopener noreferrer"
                    onClick={closeMobileSidebar}
                    style={{
                      ...navLinkBase,
                      color: THEME.navDefault,
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = THEME.navHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon
                      size={23}
                      strokeWidth={2.1}
                      style={{ color: THEME.navIcon, flexShrink: 0 }}
                    />
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  style={({ isActive }) => ({
                    ...navLinkBase,
                    background: isActive ? THEME.navActiveBg : "transparent",
                    color: isActive ? THEME.navActiveText : THEME.navDefault,
                    boxShadow: isActive ? THEME.navActiveShadow : "none",
                    fontWeight: isActive ? 700 : 500,
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.background = THEME.navHoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={23}
                        strokeWidth={2.1}
                        style={{
                          color: isActive ? "#fff" : THEME.navIcon,
                          flexShrink: 0,
                        }}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* USER */}
        <div
          className="shrink-0"
          style={{
            padding: "12px 16px 16px",
            borderTop: `1px solid ${THEME.divider}`,
          }}
        >
          <div
            className="relative flex cursor-pointer items-center transition"
            onClick={toggleDropdown}
            style={{ padding: "8px", borderRadius: 12 }}
            onMouseEnter={(e) => {
              if (!isDropdownOpen)
                e.currentTarget.style.background = THEME.navHoverBg;
            }}
            onMouseLeave={(e) => {
              if (!isDropdownOpen)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <div className="relative shrink-0">
              <div
                className="flex items-center justify-center overflow-hidden rounded-full"
                style={{
                  width: 42,
                  height: 42,
                  background: "linear-gradient(145deg, #b944ff, #5b00ce)",
                  boxShadow: "0 5px 12px #9b4be233",
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <span
                className="absolute rounded-full"
                style={{
                  bottom: 0,
                  right: 0,
                  width: 11,
                  height: 11,
                  background: "#22c55e",
                  border: "2px solid #fbfaff",
                }}
              />
            </div>

            <div className="ml-3 min-w-0 flex-1">
              <div
                className="truncate"
                style={{ fontSize: 14, fontWeight: 700, color: THEME.ink }}
              >
                {user?.name || "User"}
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                {planLoading ? (
                  <span style={{ fontSize: 11, color: THEME.muted }}>
                    Loading...
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 truncate"
                    style={{
                      fontSize: 12,
                      color: THEME.muted,
                      fontWeight: 500,
                    }}
                  >
                    {planName?.replace(/^Complyzo\s+/, "") || "Free"}
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={16}
              style={{
                color: THEME.navIcon,
                transition: "transform .2s",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                flexShrink: 0,
              }}
            />
          </div>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-3 right-3 z-50 overflow-hidden"
              style={{
                bottom: 90,
                background: THEME.dropdownBg,
                border: `1px solid ${THEME.dropdownBorder}`,
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(80,40,160,.18)",
                animation: "ppSlideUp .18s ease-out",
              }}
            >
              <div style={{ padding: 6 }}>
                <NavLink
                  to="/settings"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: THEME.navDefault,
                    borderRadius: 10,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.navHoverBg;
                    e.currentTarget.style.color = THEME.violet;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = THEME.navDefault;
                  }}
                >
                  <Settings size={16} style={{ color: THEME.navIcon }} />
                  <span>Settings</span>
                </NavLink>

                <NavLink
                  to="/subscription"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: THEME.navDefault,
                    borderRadius: 10,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.navHoverBg;
                    e.currentTarget.style.color = THEME.violet;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = THEME.navDefault;
                  }}
                >
                  <Crown size={16} style={{ color: THEME.navIcon }} />
                  <span>Subscription</span>
                </NavLink>

                <NavLink
                  to="/support"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: THEME.navDefault,
                    borderRadius: 10,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = THEME.navHoverBg;
                    e.currentTarget.style.color = THEME.violet;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = THEME.navDefault;
                  }}
                >
                  <Headset size={16} style={{ color: THEME.navIcon }} />
                  <span>Support</span>
                </NavLink>

                <div
                  style={{
                    height: 1,
                    background: THEME.divider,
                    margin: "4px 0",
                  }}
                />

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileSidebar();
                  }}
                  className="flex w-full items-center gap-3"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#dc2626",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    borderRadius: 10,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(220,38,38,.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
