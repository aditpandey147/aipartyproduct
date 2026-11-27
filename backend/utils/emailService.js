require("dotenv").config();
const { SendMailClient } = require("zeptomail");

// ============================================================
// 📧 EMAIL CONFIGURATION
// ============================================================

const ZEPTOMAIL_TOKEN =
  process.env.ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_TOKEN;

const FROM_EMAIL = process.env.WELCOME_EMAIL;
const ALERTS_EMAIL = process.env.ALERTS_EMAIL;
const WELCOME_EMAIL = process.env.WELCOME_EMAIL;

const WELCOME_NAME = process.env.WELCOME_NAME || "AI Party Product Factory";
const ALERTS_NAME =
  process.env.ALERTS_NAME || "AI Party Product Factory Alerts";

console.log("📧 Email Configuration:");
console.log(`   Token: ${ZEPTOMAIL_TOKEN ? "✅ Set" : "❌ Not Set"}`);
console.log(`   Welcome Email: ${WELCOME_EMAIL}`);
console.log(`   Alert Email: ${ALERTS_EMAIL}`);
console.log(`   Welcome Name: ${WELCOME_NAME}`);
console.log(`   Alert Name: ${ALERTS_NAME}`);

let client = null;

if (ZEPTOMAIL_TOKEN) {
  try {
    client = new SendMailClient({
      url: "https://api.zeptomail.in/v1.1/email",
      token: ZEPTOMAIL_TOKEN,
    });
    console.log("✅ ZeptoMail client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize ZeptoMail client:", error.message);
  }
} else {
  console.log("⚠️ ZEPTOMAIL_API_KEY not set - Email sending disabled");
}

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// ============================================================
// 📧 SEND WELCOME EMAIL
// ============================================================

exports.sendWelcomeEmail = async (user, password) => {
  try {
    if (process.env.DISABLE_EMAILS === "true") {
      console.log("📧 [DISABLED] Welcome email would be sent to:", user.email);
      console.log(`🔑 Password: ${password || "Not set"}`);
      return true;
    }

    if (!user?.email) {
      console.log("❌ No email provided");
      return false;
    }

    if (!client) {
      console.log("⚠️ Email client not initialized");
      console.log(`📧 Would have sent to: ${user.email}`);
      return false;
    }

    if (!WELCOME_EMAIL) {
      console.log("⚠️ No welcome sender email configured");
      return false;
    }

    console.log(`📧 Sending welcome email to: ${user.email}`);
    console.log(`   From: ${WELCOME_EMAIL}`);

    await client.sendMail({
      from: {
        address: WELCOME_EMAIL,
        name: WELCOME_NAME,
      },
      to: [
        {
          email_address: {
            address: user.email,
            name: user.name || "User",
          },
        },
      ],
      subject: "🎉 Welcome to AI Party Product Factory",
      htmlbody: `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(80,40,160,0.10);">
      
      <!-- Header — Violet gradient -->
      <div style="background: linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%); background-color: #8e15e5; padding: 40px 24px 32px; text-align: center;">
        <div style="display: inline-block; background: rgba(255,255,255,0.20); padding: 6px 16px; border-radius: 50px; margin-bottom: 12px;">
          <span style="color: #FFFFFF; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Account Activated</span>
        </div>
        <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">Welcome to AI Party Product Factory 🎉</h1>
        <p style="color: #FFFFFF; opacity: 0.90; margin: 8px 0 0; font-size: 14px; font-weight: 500;">Your account is ready</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px 28px;">
        <p style="color: #151032; font-size: 15px; margin: 0 0 16px; font-weight: 500;">
          Hi <strong style="color: #151032;">${user.name || "there"}</strong> 👋,
        </p>
        <p style="color: #62558f; font-size: 14px; margin: 0 0 24px; line-height: 1.7;">
          Your <strong style="color: #151032;">AI Party Product Factory</strong> account is now active. Create complete, ready-to-use party products in minutes.
        </p>
        
        <!-- ============================================================ -->
        <!-- ✅ Credentials Box — email-safe table layout + inline SVG icon -->
        <!-- ============================================================ -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #F5EFFF 0%, #EADDFF 100%); background-color: #F5EFFF; border: 1px solid #7620e8; border-radius: 12px; margin: 0 0 24px;">
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <!-- Icon tile — 40×40 violet gradient + white key SVG -->
                  <td width="52" valign="top" style="width: 52px; padding-right: 14px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width: 40px;">
                      <tr>
                        <td align="center" valign="middle" width="40" height="40"
                            style="width: 40px; height: 40px;
                                  background: linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%);
                                  background-color: #8e15e5;
                                  border-radius: 10px;
                                  font-family: 'Segoe UI Symbol', 'Apple Color Emoji', 'Noto Sans Symbols', Arial, sans-serif;
                                  font-size: 20px;
                                  line-height: 40px;
                                  color: #FFFFFF;
                                  text-align: center;
                                  vertical-align: middle;">
                          &#128273;
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Text content -->
                  <td valign="top" style="font-family: 'Inter', Arial, sans-serif;">
                    <p style="color: #4d00af; font-size: 14px; font-weight: 600; margin: 0; line-height: 1.4;">
                      Your Login Credentials
                    </p>
                    <div style="color: #5b21b6; font-size: 13px; margin: 6px 0 0; line-height: 1.8;">
                      <strong style="color: #4d00af;">Email:</strong> ${user.email}<br>
                      <strong style="color: #4d00af;">Password:</strong> ${password || user.email}
                    </div>
                    <p style="color: #7c3aed; font-size: 11px; margin: 6px 0 0; line-height: 1.5;">
                      ⚠️ Please change your password after login
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center;">
          <a href="${frontendUrl}/dashboard" style="display: inline-block; background: linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%); background-color: #8e15e5; color: #FFFFFF; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(118, 32, 232, 0.35);">
            Go to Dashboard →
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #EDE8FB; padding: 20px 24px; text-align: center; background: #FAF9FF;">
        <p style="color: #8b7fb3; font-size: 12px; margin: 0 0 4px;">
          <strong style="color: #151032;">AI Party Product Factory</strong>
        </p>
        <p style="color: #8b7fb3; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} All rights reserved. · 
          <a href="${frontendUrl}/settings" style="color: #62558f; text-decoration: underline;">Notification Settings</a>
        </p>
      </div>
    </div>
  `,
    });

    console.log("✅ Welcome email sent successfully to:", user.email);
    return true;
  } catch (error) {
    console.error("❌ Welcome email failed:", error.message);
    if (error.response) {
      console.error(
        "📋 ZeptoMail Response:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return false;
  }
};

// ============================================================
// 📧 SEND PASSWORD RESET EMAIL
// ============================================================

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    if (!user?.email) {
      console.log("❌ No email provided");
      return false;
    }

    if (process.env.DISABLE_EMAILS === "true") {
      console.log(
        "📧 [DISABLED] Password reset email would be sent to:",
        user.email,
      );
      console.log(`🔗 Reset URL: ${resetUrl}`);
      return true;
    }

    if (!client) {
      console.log("⚠️ Email client not initialized");
      console.log(`📧 Would have sent to: ${user.email}`);
      console.log(`🔗 Reset URL: ${resetUrl}`);
      return false;
    }

    const fromEmail =
      process.env.WELCOME_EMAIL ||
      process.env.ALERTS_EMAIL ||
      "no-reply@albinolabs.com";
    const fromName = process.env.WELCOME_NAME || "AI Party Product Factory";

    console.log(`📧 Sending password reset email to: ${user.email}`);

    await client.sendMail({
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: user.email,
            name: user.name || "User",
          },
        },
      ],
      subject: "🔑 Reset Your AI Party Product Factory Password",
      htmlbody: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(80,40,160,0.10);">
          
          <!-- Header — Violet gradient -->
          <div style="background: linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%); background-color: #8e15e5; padding: 32px 24px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.20); padding: 6px 16px; border-radius: 50px; margin-bottom: 12px;">
              <span style="color: #FFFFFF; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Password Reset</span>
            </div>
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700;">🔑 Reset Your Password</h1>
            <p style="color: #FFFFFF; opacity: 0.85; margin: 8px 0 0; font-size: 14px;">AI Party Product Factory Password Reset Request</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 32px 28px;">
            <p style="color: #151032; font-size: 15px; margin: 0 0 16px; font-weight: 500;">
              Hi <strong style="color: #151032;">${user.name || "there"}</strong>,
            </p>
            <p style="color: #62558f; font-size: 14px; margin: 0 0 24px; line-height: 1.7;">
              We received a request to reset your AI Party Product Factory account password.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(110deg, #d634ef 0%, #8e15e5 50%, #4d00af 100%); background-color: #8e15e5; color: #FFFFFF; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(118, 32, 232, 0.35);">
                Reset Password →
              </a>
            </div>

            <div style="background: #F5EFFF; border: 1px solid #c4b5fd; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #5b21b6; font-size: 12px; margin: 0;">
                ⏰ This link will expire in <strong>1 hour</strong>
              </p>
            </div>
            
            <p style="color: #62558f; font-size: 12px; margin: 0;">
              If you didn't request this, ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #EDE8FB; padding: 20px 24px; text-align: center; background: #FAF9FF;">
            <p style="color: #8b7fb3; font-size: 12px; margin: 0 0 4px;">
              <strong style="color: #151032;">AI Party Product Factory</strong>
            </p>
            <p style="color: #8b7fb3; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} All rights reserved. · 
              <a href="${frontendUrl}/settings" style="color: #62558f; text-decoration: underline;">Notification Settings</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ Password reset email sent to:", user.email);
    return true;
  } catch (error) {
    console.error("❌ Password reset email failed:", error.message);
    if (error.response) {
      console.error(
        "📋 ZeptoMail Response:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return false;
  }
};

// ============================================================
// 🧪 TEST EMAIL CONFIGURATION
// ============================================================

exports.testEmailConfig = async () => {
  console.log("\n🧪 Testing Email Configuration...");
  console.log("=".repeat(50));
  console.log(`   Welcome Email: ${WELCOME_EMAIL || "Not configured"}`);
  console.log(`   Alert Email: ${ALERTS_EMAIL || "Not configured"}`);
  console.log(`   Token: ${ZEPTOMAIL_TOKEN ? "✅ Set" : "❌ Not Set"}`);
  console.log(`   Client: ${client ? "✅ Initialized" : "❌ Not Initialized"}`);
  console.log(`   Welcome Name: ${WELCOME_NAME}`);
  console.log(`   Alert Name: ${ALERTS_NAME}`);
  console.log("=".repeat(50));

  if (!WELCOME_EMAIL) {
    console.log("\n⚠️ No welcome sender email configured!");
    console.log("   Add to .env: WELCOME_EMAIL=no-reply@albinolabs.com");
    return false;
  }

  if (!ALERTS_EMAIL) {
    console.log("\n⚠️ No alert sender email configured!");
    console.log("   Add to .env: ALERTS_EMAIL=no-reply@albinolabs.com");
    return false;
  }

  if (!ZEPTOMAIL_TOKEN) {
    console.log("\n⚠️ No ZeptoMail token configured!");
    console.log("   Add to .env: ZEPTOMAIL_API_KEY=your-token-here");
    return false;
  }

  if (client) {
    try {
      console.log("\n📧 Sending test email...");
      await client.sendMail({
        from: {
          address: WELCOME_EMAIL,
          name: "AI Party Product Factory Test",
        },
        to: [
          {
            email_address: {
              address: WELCOME_EMAIL,
              name: "Test User",
            },
          },
        ],
        subject: "🧪 Test Email from AI Party Product Factory",
        htmlbody: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #FFFFFF; border-radius: 12px; border: 1px solid #EDE8FB;">
            <h2 style="color: #151032;">🧪 Test Email</h2>
            <p style="color: #62558f;">Test email for <strong>AI Party Product Factory</strong>.</p>
            <p style="color: #62558f;">✅ Email configuration is working correctly!</p>
            <hr style="border: none; border-top: 1px solid #EDE8FB; margin: 16px 0;">
            <p style="color: #8b7fb3; font-size: 12px;">Sent from AI Party Product Factory</p>
          </div>
        `,
      });
      console.log("✅ Test email sent successfully!");
      return true;
    } catch (error) {
      console.error("❌ Test email failed:", error.message);
      if (error.response) {
        console.error(
          "Response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
      return false;
    }
  }

  return false;
};
