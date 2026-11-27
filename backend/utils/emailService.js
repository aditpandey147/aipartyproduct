require("dotenv").config();

const { SendMailClient } = require("zeptomail");

// ============================================================
// AI PARTY PRODUCT FACTORY
// PREMIUM EMAIL SERVICE
//
// Branding: Purple + Pink + Gold
// ============================================================

// ============================================================
// EMAIL CONFIGURATION
// ============================================================

const ZEPTOMAIL_TOKEN =
  process.env.ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_TOKEN;

const WELCOME_EMAIL = process.env.WELCOME_EMAIL;

const ALERTS_EMAIL = process.env.ALERTS_EMAIL;

const WELCOME_NAME = process.env.WELCOME_NAME || "AI Party Product Factory";

const ALERTS_NAME =
  process.env.ALERTS_NAME || "AI Party Product Factory Alerts";

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://aipartyproduct.albinolabs.com"
).replace(/\/+$/, "");

// ============================================================
// BRAND COLORS
// ============================================================

const BRAND = {
  purple: "#6D28D9",
  deepPurple: "#4C1D95",
  pink: "#DB2777",
  lightPink: "#FCE7F3",
  gold: "#F5C76E",
  darkGold: "#B8860B",
  background: "#F8F7FF",
  white: "#FFFFFF",
  text: "#241638",
  muted: "#716780",
  border: "#E9E1F5",
};

// ============================================================
// SAFE HTML ESCAPING
// ============================================================

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHttpUrl(value) {
  try {
    const url = new URL(String(value));

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Invalid URL protocol");
    }

    return escapeHtml(url.toString());
  } catch {
    throw new Error("Invalid email action URL");
  }
}

// ============================================================
// EMAIL CONFIGURATION LOGS
// ============================================================

console.log("\n🎉 AI Party Product Factory Email Service");

console.log("======================================");

console.log(
  `📧 ZeptoMail Token: ${ZEPTOMAIL_TOKEN ? "✅ Configured" : "❌ Missing"}`,
);

console.log(`📧 Welcome Email: ${WELCOME_EMAIL || "Not configured"}`);

console.log(`📧 Alerts Email: ${ALERTS_EMAIL || "Not configured"}`);

console.log(`📧 Sender Name: ${WELCOME_NAME}`);

console.log(`🌐 Frontend: ${FRONTEND_URL}`);

console.log("======================================\n");

// ============================================================
// INITIALIZE ZEPTOMAIL
// ============================================================

let client = null;

if (ZEPTOMAIL_TOKEN) {
  try {
    client = new SendMailClient({
      url: "https://api.zeptomail.in/v1.1/email",
      token: ZEPTOMAIL_TOKEN,
    });

    console.log("✅ AI Party Product Factory ZeptoMail initialized");
  } catch (error) {
    console.error("❌ ZeptoMail initialization failed:", error.message);
  }
} else {
  console.warn("⚠️ ZeptoMail token missing — email sending disabled");
}

// ============================================================
// REUSABLE PREMIUM EMAIL WRAPPER
// ============================================================

function emailTemplate({
  badge = "AI PARTY PRODUCT FACTORY",
  title,
  subtitle,
  content,
  footerNote = "Made for creators, party lovers & digital product sellers.",
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${escapeHtml(title)}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F8F7FF;
  font-family:Arial,Helvetica,sans-serif;
">

  <table
    role="presentation"
    cellpadding="0"
    cellspacing="0"
    border="0"
    width="100%"
    style="background:#F8F7FF;"
  >
    <tr>
      <td
        align="center"
        style="padding:40px 16px;"
      >

        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          border="0"
          width="600"
          style="
            width:100%;
            max-width:600px;
            background:#FFFFFF;
            border-radius:20px;
            overflow:hidden;
            border:1px solid #E9E1F5;
          "
        >

          <!-- ========================================== -->
          <!-- PREMIUM HEADER -->
          <!-- ========================================== -->

          <tr>
            <td
              align="center"
              style="
                padding:44px 30px 40px;
                background:#6D28D9;
                background-image:linear-gradient(
                  125deg,
                  #4C1D95 0%,
                  #6D28D9 45%,
                  #DB2777 100%
                );
              "
            >

              <!-- BRAND ICON -->

              <div style="
                width:66px;
                height:66px;
                line-height:66px;
                border-radius:18px;
                background:#FFFFFF;
                background:rgba(255,255,255,0.16);
                margin:0 auto 18px;
                text-align:center;
                font-size:32px;
              ">
                🎉
              </div>

              <!-- BRAND NAME -->

              <div style="
                color:#FFFFFF;
                font-size:14px;
                font-weight:800;
                letter-spacing:0.4px;
                margin-bottom:20px;
              ">
                AI PARTY PRODUCT FACTORY
              </div>

              <!-- BADGE -->

              <div style="
                display:inline-block;
                padding:9px 17px;
                background:#F5C76E;
                color:#4C1D95;
                border-radius:30px;
                font-size:10px;
                font-weight:800;
                letter-spacing:1.3px;
                text-transform:uppercase;
                margin-bottom:18px;
              ">
                ${escapeHtml(badge)}
              </div>

              <!-- TITLE -->

              <h1 style="
                color:#FFFFFF;
                font-size:29px;
                font-weight:800;
                line-height:1.3;
                margin:0 0 12px;
              ">
                ${escapeHtml(title)}
              </h1>

              <!-- SUBTITLE -->

              <p style="
                color:#F5E9FF;
                font-size:14px;
                line-height:1.7;
                margin:0;
              ">
                ${escapeHtml(subtitle)}
              </p>

            </td>
          </tr>

          <!-- ========================================== -->
          <!-- EMAIL BODY -->
          <!-- ========================================== -->

          <tr>
            <td style="
              padding:38px 34px;
              background:#FFFFFF;
            ">

              ${content}

            </td>
          </tr>

          <!-- ========================================== -->
          <!-- FOOTER -->
          <!-- ========================================== -->

          <tr>
            <td
              align="center"
              style="
                padding:26px 24px;
                border-top:1px solid #E9E1F5;
                background:#FBFAFF;
              "
            >

              <p style="
                color:#6D28D9;
                font-size:15px;
                font-weight:800;
                margin:0 0 9px;
              ">
                ✨ AI Party Product Factory
              </p>

              <p style="
                color:#716780;
                font-size:12px;
                line-height:1.7;
                margin:0 0 15px;
              ">
                ${escapeHtml(footerNote)}
              </p>

              <p style="
                color:#9B91AA;
                font-size:11px;
                margin:0 0 8px;
              ">
                © ${new Date().getFullYear()}
                AI Party Product Factory.
                All rights reserved.
              </p>

              <p style="
                margin:0;
                font-size:11px;
              ">
                <a
                  href="${safeHttpUrl(FRONTEND_URL + "/dashboard")}"
                  style="
                    color:#6D28D9;
                    text-decoration:none;
                  "
                >
                  Dashboard
                </a>

                <span style="color:#C7BDDA;">
                  &nbsp; | &nbsp;
                </span>

                <a
                  href="${safeHttpUrl(FRONTEND_URL + "/settings")}"
                  style="
                    color:#6D28D9;
                    text-decoration:none;
                  "
                >
                  Account Settings
                </a>
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}

// ============================================================
// REUSABLE BUTTON
// ============================================================

function primaryButton(text, url) {
  return `
<table
  role="presentation"
  cellpadding="0"
  cellspacing="0"
  border="0"
  align="center"
  style="margin:28px auto;"
>
  <tr>
    <td
      align="center"
      bgcolor="#6D28D9"
      style="
        border-radius:12px;
        background:#6D28D9;
        background-image:linear-gradient(
          110deg,
          #6D28D9,
          #DB2777
        );
      "
    >

      <a
        href="${safeHttpUrl(url)}"
        style="
          display:inline-block;
          padding:16px 32px;
          font-family:Arial,sans-serif;
          font-size:14px;
          font-weight:800;
          color:#FFFFFF;
          text-decoration:none;
          border-radius:12px;
        "
      >
        ${escapeHtml(text)}
      </a>

    </td>
  </tr>
</table>
`;
}

// ============================================================
// REUSABLE INFO BOX
// ============================================================

function infoBox(content) {
  return `
<div style="
  background:#F8F5FF;
  border:1px solid #E9D5FF;
  border-radius:14px;
  padding:20px;
  margin:22px 0;
">
  ${content}
</div>
`;
}

// ============================================================
// INTERNAL SEND EMAIL FUNCTION
// ============================================================

async function sendEmail({
  to,
  toName = "Creator",
  subject,
  htmlbody,
  fromEmail = WELCOME_EMAIL,
  fromName = WELCOME_NAME,
}) {
  if (process.env.DISABLE_EMAILS === "true") {
    console.log("📧 [DISABLED] Email sending skipped:", subject);

    return true;
  }

  if (!client) {
    console.error("❌ ZeptoMail client not initialized");

    return false;
  }

  if (!to || !fromEmail) {
    console.error("❌ Missing recipient or sender email");

    return false;
  }

  try {
    await client.sendMail({
      from: {
        address: fromEmail,
        name: fromName,
      },

      to: [
        {
          email_address: {
            address: to,
            name: toName,
          },
        },
      ],

      subject,

      htmlbody,
    });

    console.log(`✅ Email sent successfully: ${subject}`);

    return true;
  } catch (error) {
    console.error("❌ ZeptoMail sending failed:", error.message);

    if (error.response) {
      console.error(
        "ZeptoMail Response:",
        JSON.stringify(error.response.data, null, 2),
      );
    }

    return false;
  }
}

// ============================================================
// SEND WELCOME EMAIL
// ============================================================

exports.sendWelcomeEmail = async (user, password) => {
  try {
    if (!user?.email) {
      console.error("❌ Welcome email: recipient missing");

      return false;
    }

    const userName = escapeHtml(user.name || "Creator");

    const userEmail = escapeHtml(user.email);

    const content = `

      <!-- GREETING -->

      <p style="
        color:#241638;
        font-size:16px;
        font-weight:600;
        margin:0 0 18px;
      ">
        Hey ${userName}! 👋
      </p>

      <!-- INTRO -->

      <p style="
        color:#716780;
        font-size:14px;
        line-height:1.9;
        margin:0 0 22px;
      ">
        Welcome aboard! 🎉

        Your
        <strong style="color:#6D28D9;">
          AI Party Product Factory
        </strong>
        account is officially ready.

        You're now one step closer to creating
        beautiful party products using the power
        of artificial intelligence.
      </p>

      <!-- HIGHLIGHT -->

      <div style="
        background:#FDF2F8;
        border-left:4px solid #DB2777;
        padding:18px 20px;
        border-radius:0 12px 12px 0;
        margin-bottom:25px;
      ">

        <p style="
          color:#831843;
          font-size:16px;
          font-weight:800;
          margin:0 0 7px;
        ">
          ✨ Your Creativity Starts Here!
        </p>

        <p style="
          color:#9D174D;
          font-size:13px;
          line-height:1.8;
          margin:0;
        ">
          Create personalized party invitations,
          printable games, decorations, favor tags,
          party kits, and much more—right from
          one powerful AI workspace.
        </p>

      </div>

      <!-- ACCOUNT DETAILS -->

      ${infoBox(`
        <p style="
          color:#4C1D95;
          font-size:14px;
          font-weight:800;
          margin:0 0 13px;
        ">
          🔐 Your Account Details
        </p>

        <p style="
          color:#716780;
          font-size:13px;
          margin:0 0 9px;
        ">
          <strong>Email:</strong>
          ${userEmail}
        </p>

        <p style="
          color:#716780;
          font-size:13px;
          margin:0;
        ">
          <strong>Status:</strong>
          <span style="
            color:#16A34A;
            font-weight:700;
          ">
            ● Active
          </span>
        </p>
      `)}

      <!-- FEATURES -->

      <h2 style="
        color:#241638;
        font-size:19px;
        font-weight:800;
        margin:30px 0 19px;
      ">
        🎁 Here's What You Can Create
      </h2>

      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
      >

        <tr>
          <td style="
            padding:12px 0;
            border-bottom:1px solid #F0EBF7;
            font-size:13px;
            color:#5B526A;
          ">
            💌 &nbsp;
            <strong>Party Invitations</strong>
            — Beautiful designs for every celebration
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px 0;
            border-bottom:1px solid #F0EBF7;
            font-size:13px;
            color:#5B526A;
          ">
            🎲 &nbsp;
            <strong>Party Games</strong>
            — Fun printable activities
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px 0;
            border-bottom:1px solid #F0EBF7;
            font-size:13px;
            color:#5B526A;
          ">
            🎈 &nbsp;
            <strong>Party Decorations</strong>
            — Signs, banners and more
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px 0;
            border-bottom:1px solid #F0EBF7;
            font-size:13px;
            color:#5B526A;
          ">
            🎁 &nbsp;
            <strong>Party Favor Products</strong>
            — Tags, labels and toppers
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px 0;
            border-bottom:1px solid #F0EBF7;
            font-size:13px;
            color:#5B526A;
          ">
            📦 &nbsp;
            <strong>Party Kits</strong>
            — Complete matching collections
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px 0;
            font-size:13px;
            color:#5B526A;
          ">
            🛍️ &nbsp;
            <strong>AI Sales Kit</strong>
            — Listing content for your digital products
          </td>
        </tr>

      </table>

      <!-- CTA -->

      ${primaryButton("🚀 Start Creating Now", FRONTEND_URL + "/dashboard")}

      <!-- SELLING ANGLE -->

      <div style="
        background:#FFF9EB;
        border:1px solid #F5C76E;
        border-radius:14px;
        padding:20px;
        margin-top:25px;
      ">

        <p style="
          color:#92400E;
          font-size:15px;
          font-weight:800;
          margin:0 0 9px;
        ">
          💡 Create for Fun. Or Create to Sell.
        </p>

        <p style="
          color:#92400E;
          font-size:13px;
          line-height:1.8;
          margin:0;
        ">
          Make personalized party products for
          your own celebrations—or build digital
          products you can prepare for marketplaces
          like Etsy, Gumroad, and Payhip, subject
          to your plan's commercial-use rights.
        </p>

      </div>

      <!-- SIGN OFF -->

      <p style="
        color:#716780;
        font-size:13px;
        line-height:1.8;
        margin:28px 0 0;
      ">
        We can't wait to see what you create!
        <br><br>

        Let's make every celebration unforgettable. ✨

        <br><br>

        <strong style="color:#6D28D9;">
          The AI Party Product Factory Team
        </strong>
      </p>
    `;

    const htmlbody = emailTemplate({
      badge: "WELCOME ABOARD",
      title: "Your Party Creation Journey Starts Now! 🎉",
      subtitle:
        "Your account is active. It's time to turn creative ideas into amazing party products.",
      content,
      footerNote:
        "Create, customize, download and share amazing party products.",
    });

    return await sendEmail({
      to: user.email,

      toName: user.name || "Creator",

      subject:
        "🎉 Welcome to AI Party Product Factory — Let's Create Something Amazing!",

      htmlbody,
    });
  } catch (error) {
    console.error("❌ Welcome email error:", error.message);

    return false;
  }
};

// ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    if (!user?.email) {
      console.error("❌ Password reset: recipient missing");

      return false;
    }

    const userName = escapeHtml(user.name || "Creator");

    const content = `

      <!-- GREETING -->

      <p style="
        color:#241638;
        font-size:16px;
        font-weight:600;
        margin:0 0 18px;
      ">
        Hi ${userName},
      </p>

      <!-- INTRO -->

      <p style="
        color:#716780;
        font-size:14px;
        line-height:1.9;
        margin:0 0 24px;
      ">
        We received a request to reset the password
        for your
        <strong style="color:#6D28D9;">
          AI Party Product Factory
        </strong>
        account.

        No worries! You can securely create a new
        password using the button below.
      </p>

      <!-- SECURITY ICON -->

      <div style="
        text-align:center;
        padding:20px 0 8px;
      ">

        <div style="
          width:76px;
          height:76px;
          line-height:76px;
          background:#F3E8FF;
          border-radius:20px;
          font-size:34px;
          margin:0 auto;
        ">
          🔐
        </div>

      </div>

      <!-- CTA -->

      ${primaryButton("🔑 Reset My Password", resetUrl)}

      <!-- EXPIRATION BOX -->

      ${infoBox(`
        <p style="
          color:#6D28D9;
          font-size:14px;
          font-weight:800;
          margin:0 0 8px;
        ">
          ⏰ Password Reset Link
        </p>

        <p style="
          color:#716780;
          font-size:13px;
          line-height:1.8;
          margin:0;
        ">
          For security, use this link before it
          expires. If it has expired, request
          a new password reset link from the
          login page.
        </p>
      `)}

      <!-- SECURITY NOTE -->

      <div style="
        background:#FFF9EB;
        border:1px solid #F5C76E;
        border-radius:12px;
        padding:17px 20px;
        margin-top:22px;
      ">

        <p style="
          color:#92400E;
          font-size:13px;
          font-weight:800;
          margin:0 0 7px;
        ">
          🛡️ Didn't request this?
        </p>

        <p style="
          color:#92400E;
          font-size:12px;
          line-height:1.8;
          margin:0;
        ">
          You can safely ignore this email if
          you didn't request a password reset.

          Your existing password will remain unchanged
          unless a valid reset request is completed.
        </p>

      </div>

      <!-- SIGN OFF -->

      <p style="
        color:#716780;
        font-size:13px;
        line-height:1.8;
        margin:28px 0 0;
      ">

        Need help? We're here to support you.

        <br><br>

        <strong style="color:#6D28D9;">
          AI Party Product Factory Support Team
        </strong>

      </p>
    `;

    const htmlbody = emailTemplate({
      badge: "SECURE PASSWORD RESET",

      title: "Reset Your Password 🔐",

      subtitle: "Let's get you safely back to creating amazing party products.",

      content,

      footerNote: "This is an automated account-security email.",
    });

    return await sendEmail({
      to: user.email,

      toName: user.name || "Creator",

      subject: "🔐 Reset Your AI Party Product Factory Password",

      htmlbody,
    });
  } catch (error) {
    console.error("❌ Password reset email failed:", error.message);

    return false;
  }
};

// ============================================================
// TEST EMAIL CONFIGURATION
// ============================================================

exports.testEmailConfig = async () => {
  console.log("\n🧪 Testing AI Party Product Factory Email");

  console.log("=".repeat(50));

  console.log(`Welcome Email: ${WELCOME_EMAIL || "Missing"}`);

  console.log(`Alerts Email: ${ALERTS_EMAIL || "Missing"}`);

  console.log(`ZeptoMail Token: ${ZEPTOMAIL_TOKEN ? "Configured" : "Missing"}`);

  console.log(`Client: ${client ? "Initialized" : "Not Initialized"}`);

  console.log(`Welcome Name: ${WELCOME_NAME}`);

  console.log("=".repeat(50));

  if (!WELCOME_EMAIL) {
    console.error("❌ WELCOME_EMAIL not configured");

    return false;
  }

  if (!ALERTS_EMAIL) {
    console.warn("⚠️ ALERTS_EMAIL not configured");
  }

  if (!ZEPTOMAIL_TOKEN || !client) {
    console.error("❌ ZeptoMail is not configured");

    return false;
  }

  const content = `

    <div style="text-align:center;">

      <div style="
        font-size:52px;
        margin-bottom:18px;
      ">
        🎉
      </div>

      <h2 style="
        color:#4C1D95;
        font-size:23px;
        margin:0 0 15px;
      ">
        Email Configuration Successful!
      </h2>

      <p style="
        color:#716780;
        font-size:14px;
        line-height:1.8;
        margin:0 0 20px;
      ">

        Congratulations!

        Your AI Party Product Factory
        email service is configured
        and ready to send messages.

      </p>

      ${infoBox(`
        <p style="
          color:#16A34A;
          font-size:14px;
          font-weight:800;
          margin:0;
        ">
          ✅ ZeptoMail connection working
        </p>
      `)}

      <p style="
        color:#716780;
        font-size:12px;
        margin:20px 0 0;
      ">
        This is an automated test email.
      </p>

    </div>
  `;

  const htmlbody = emailTemplate({
    badge: "EMAIL SYSTEM TEST",

    title: "Email Service Is Ready! ✅",

    subtitle: "Your AI Party Product Factory email integration is working.",

    content,

    footerNote: "Automated configuration test.",
  });

  return await sendEmail({
    to: WELCOME_EMAIL,

    toName: "Test User",

    subject: "🧪 AI Party Product Factory — Email Test Successful",

    htmlbody,

    fromEmail: WELCOME_EMAIL,

    fromName: WELCOME_NAME,
  });
};

// ============================================================
// END OF EMAIL SERVICE
// ============================================================
