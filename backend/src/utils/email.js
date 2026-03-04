const { Resend } = require('resend');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hasEmailConfig = () => {
  return process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key';
};

const sendOTPEmail = async (toEmail, otp) => {
  // Always log to console
  console.log(`\n📧 ==============================`);
  console.log(`📧  OTP for ${toEmail}: ${otp}`);
  console.log(`📧 ==============================\n`);

  if (hasEmailConfig()) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'PEERLearn <onboarding@resend.dev>', // Resend's default testing email
        to: [toEmail],
        subject: '🔐 PEERLearn — Verify Your Email',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#0D0D1A;border-radius:16px;overflow:hidden;border:1px solid rgba(255,224,178,0.15)">
            <div style="background:linear-gradient(135deg,#FF6F00,#FFB74D);padding:24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:28px">🤝 PEERLearn</h1>
              <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px">Peer to Peer Skill Sharing</p>
            </div>
            <div style="padding:32px 28px;text-align:center">
              <p style="color:#FFE0B2;font-size:16px;margin:0 0 8px">Your verification code is:</p>
              <div style="background:rgba(255,111,0,0.12);border:2px solid #FF6F00;border-radius:12px;padding:20px;margin:16px 0">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#FFB74D">${otp}</span>
              </div>
              <p style="color:rgba(255,224,178,0.6);font-size:13px;margin:16px 0 0">This code expires in <strong style="color:#FF6F00">10 minutes</strong>.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Email sent via Resend to', toEmail);
    } catch (emailErr) {
      console.error('❌ Resend email rejected:', emailErr.message);
      throw new Error(emailErr.message);
    }
  } else {
    console.log('ℹ️  Email not configured — OTP shown in frontend (dev mode)');
  }
};

module.exports = { generateOTP, sendOTPEmail, hasEmailConfig };
