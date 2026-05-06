const otpTemplate = (code, purpose) => {
  const titles = {
    signup: 'Welcome to The Living Archive',
    login: 'Verify Your Identity',
    reset: 'Secure Your Account'
  };

  const descriptions = {
    signup: 'You are one step away from preserving and discovering the oral heritage of Rwanda.',
    login: 'A new sign-in to your account was detected. Please verify it is you.',
    reset: 'We received a request to reset the password for your account.'
  };

  const buttonText = {
    signup: 'Start Preserving',
    login: 'Enter Code to Sign In',
    reset: 'Enter Code to Reset'
  };

  const title = titles[purpose] || 'Verification Code';
  const description = descriptions[purpose] || 'Please use the code below to verify your identity.';
  const btn = buttonText[purpose] || 'Continue';

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Lexend:wght@300;400;500;600&display=swap');
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding-left: 24px !important; padding-right: 24px !important; }
      .mobile-full { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#fdf9e9; font-family:'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1c1c13;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fdf9e9;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" class="container" style="background-color:#ffffff; border-radius:32px; overflow:hidden; box-shadow:0 1px 3px rgba(28,28,19,0.04), 0 4px 12px rgba(28,28,19,0.06);">
          
          <!-- Header Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #9b2f00 0%, #c2410c 50%, #9b2f00 100%); font-size:0; line-height:0;">&nbsp;</td>
          </tr>
          
          <!-- Top Section: Logo & Title -->
          <tr>
            <td align="center" class="content-padding" style="padding: 56px 48px 0 48px;">
              <!-- Logo Icon (SVG) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" width="64" height="64" style="width:64px; height:64px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" style="background-color:#fdf9e9; border-radius:16px;">
                      <tr>
                        <td align="center" valign="middle">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="#9b2f00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                            <path d="M12 6V12L16 14" stroke="#9b2f00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 18C8 15.24 9.79 12.83 12 12C14.21 12.83 16 15.24 16 18" stroke="#9b2f00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                          </svg>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Brand Name -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top:24px;">
                    <span style="font-family:'Noto Serif', Georgia, serif; font-size:18px; font-weight:700; color:#9b2f00; letter-spacing:-0.5px;">INKOMOKO</span>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="48" style="margin-top:16px;">
                <tr>
                  <td height="1" style="background-color:#e6e3d3;"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Title & Description -->
          <tr>
            <td align="center" class="content-padding" style="padding: 40px 48px 0 48px;">
              <h1 style="font-family:'Noto Serif', Georgia, serif; font-size:26px; font-weight:700; color:#1c1c13; margin:0 0 12px 0; letter-spacing:-0.5px; line-height:1.3;">${title}</h1>
              <p style="font-size:15px; color:#59413a; line-height:1.6; margin:0;">${description}</p>
            </td>
          </tr>
          
          <!-- OTP Code Section -->
          <tr>
            <td align="center" class="content-padding" style="padding: 40px 48px 0 48px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:380px; background-color:#fdf9e9; border-radius:20px;">
                <tr>
                  <td align="center" style="padding: 32px 24px;">
                    <p style="font-size:10px; font-weight:600; color:#9b2f00; letter-spacing:2px; text-transform:uppercase; margin:0 0 12px 0;">Verification Code</p>
                    <p style="font-family:'Noto Serif', Georgia, serif; font-size:40px; font-weight:700; color:#1c1c13; margin:0; letter-spacing:10px;">${code}</p>
                    <p style="font-size:13px; color:#8d7168; margin:16px 0 0 0;">This code expires in 10 minutes.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Action Button -->
          <tr>
            <td align="center" class="content-padding" style="padding: 40px 48px 0 48px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius:9999px; background-color:#9b2f00;">
                    <a href="https://inkomokorwanda.vercel.app/" target="_blank" style="display:inline-block; padding:16px 48px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:9999px; letter-spacing:0.5px;">${btn}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Security Note -->
          <tr>
            <td align="center" class="content-padding" style="padding: 48px 48px 0 48px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:400px;">
                <tr>
                  <td align="center" style="padding:20px; background-color:#fdf9e9; border-radius:12px; border:1px solid #e6e3d3;">
                    <p style="font-size:13px; color:#59413a; line-height:1.5; margin:0;">If you didn't request this code, your account is still secure. You can safely ignore this email. <a href="https://inkomokorwanda.vercel.app/" style="color:#9b2f00; text-decoration:underline;">Secure your account</a> if you notice any unusual activity.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" class="content-padding" style="padding: 48px 48px 48px 48px;">
              <!-- Divider -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="64" style="margin-bottom:32px;">
                <tr>
                  <td height="1" style="background-color:#e6e3d3;"></td>
                </tr>
              </table>
              
              <p style="font-family:'Noto Serif', Georgia, serif; font-size:14px; font-weight:400; color:#8d7168; margin:0 0 8px 0;">INKOMOKO — Preservation of the Soul</p>
              <p style="font-size:12px; color:#8d7168; margin:0 0 16px 0;">Preserving Rwandan heritage for generations to come.</p>
              
              <p style="font-size:11px; color:#a89f96; margin:0;">&copy; 2026 Inkomoko Archive. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
        <!-- End Main Container -->
        
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = otpTemplate;
