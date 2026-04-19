const otpTemplate = (code, purpose) => {
  const titles = {
    signup: 'Welcome to The Living Archive',
    login: 'Secure Sign In',
    reset: 'Reset Your Password'
  };

  const actionText = {
    signup: 'to verify your account and start your journey.',
    login: 'to securely access your account.',
    reset: 'to reset your password and secure your heritage.'
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inkomoko - Verification Code</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Lexend:wght@300;400;600&display=swap');
            
            body {
                margin: 0;
                padding: 0;
                background-color: #fdf9e9;
                font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                color: #1c1c13;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            .card {
                background-color: #ffffff;
                border-radius: 24px;
                padding: 48px;
                box-shadow: 0 4px 24px rgba(155, 47, 0, 0.05);
                border: 1px solid rgba(155, 47, 0, 0.1);
            }
            .logo {
                font-family: 'Noto Serif', serif;
                font-size: 24px;
                font-weight: 800;
                color: #9b2f00;
                text-align: center;
                margin-bottom: 40px;
                letter-spacing: -0.5px;
            }
            .headline {
                font-family: 'Noto Serif', serif;
                font-size: 28px;
                font-weight: 700;
                color: #1c1c13;
                text-align: center;
                margin-bottom: 16px;
            }
            .subheadline {
                font-size: 16px;
                color: #59413a;
                text-align: center;
                line-height: 1.6;
                margin-bottom: 40px;
            }
            .code-container {
                background-color: #f8f4e4;
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                margin-bottom: 40px;
                border: 1px dashed #9b2f00;
            }
            .code {
                font-size: 36px;
                font-weight: 700;
                color: #9b2f00;
                letter-spacing: 8px;
                margin: 0;
            }
            .footer {
                text-align: center;
                font-size: 14px;
                color: #8d7168;
                margin-top: 40px;
            }
            .footer p {
                margin: 8px 0;
            }
            .divider {
                height: 1px;
                background-color: #e6e3d3;
                margin: 32px 0;
            }
            .button {
                display: inline-block;
                padding: 16px 32px;
                background-color: #9b2f00;
                color: #ffffff;
                text-decoration: none;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 32px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="logo">The Living Archive</div>
                <h1 class="headline">${titles[purpose] || 'Verification Code'}</h1>
                <p class="subheadline">
                    Traditional stories, songs, and heritage are waiting for you. 
                    Please use the following code ${actionText[purpose] || 'to continue.'}
                </p>
                
                <div class="code-container">
                    <p class="code">${code}</p>
                </div>
                
                <p class="subheadline" style="font-size: 14px;">
                    This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
                </p>
                
                <div class="divider"></div>
                
                <div class="footer">
                    <p><strong>Inkomoko — Preservation of the Soul</strong></p>
                    <p>Preserving Rwandan heritage for generations to come.</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2026 Inkomoko Archive. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = otpTemplate;
