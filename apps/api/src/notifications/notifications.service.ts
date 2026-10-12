import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
}

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationsService.name);
  private currentConfig: SmtpConfig = {};

  constructor() {
    this.configure({
      host: process.env.SMTP_HOST || 'mail.verixaid.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465,
      user: process.env.SMTP_USER || 'no-reply@verixaid.com',
      pass: process.env.SMTP_PASS || (process.env.NODE_ENV === 'production' ? '' : 'secret_password'),
      fromName: process.env.SMTP_FROM_NAME || 'Verixa ID',
      fromEmail: process.env.SMTP_FROM_EMAIL || 'no-reply@verixaid.com',
    });
  }

  configure(config: SmtpConfig) {
    this.currentConfig = { ...this.currentConfig, ...config };
    const host = this.currentConfig.host || process.env.SMTP_HOST || 'mail.verixaid.com';
    const port = this.currentConfig.port || parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = this.currentConfig.secure ?? (port === 465);
    const user = this.currentConfig.user || process.env.SMTP_USER || 'no-reply@verixaid.com';
    const pass = this.currentConfig.pass || process.env.SMTP_PASS || (process.env.NODE_ENV === 'production' ? '' : 'secret_password');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
    const maskedUser = user.includes('@') ? `${user.split('@')[0].slice(0, 3)}***@${user.split('@')[1]}` : '***';
    this.logger.debug(`SMTP configured for host: ${host}:${port} (account: ${maskedUser}, secure: ${secure})`);
  }

  private getFromHeader(): string {
    const name = this.currentConfig.fromName || 'Verixa ID';
    const email = this.currentConfig.fromEmail || this.currentConfig.user || 'no-reply@verixaid.com';
    return `"${name}" <${email}>`;
  }

  private getEmailWrapper(content: string, preheader = ''): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verixa ID Notification</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #090d16; padding: 24px 32px; border-bottom: 2px solid #10b981; }
          .logo-text { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; font-family: monospace; }
          .logo-tag { color: #10b981; font-weight: 700; margin-left: 2px; }
          .content { padding: 32px; }
          .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center; }
          .btn { display: inline-block; background: #10b981; color: #ffffff !important; font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 16px; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: bold; }
          .badge-green { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
          .badge-amber { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
          .badge-blue { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 8px 4px; border-bottom: 1px solid #e2e8f0; font-family: monospace; }
          td { padding: 10px 4px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <span style="display:none;font-size:0px;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>
        <div class="container">
          <div class="header">
            <span class="logo-text">VERIXA<span class="logo-tag">.ID</span></span>
            <span style="float: right; color: #94a3b8; font-size: 11px; font-family: monospace; padding-top: 6px;">DEVELOPER KYC APIS</span>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">Sent by <b>Verixa ID Platform</b> • High-Throughput Identity Infrastructure</p>
            <p style="margin: 0;">Automated notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(to: string, orgName: string) {
    const html = this.getEmailWrapper(`
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Welcome to Verixa ID, ${orgName}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Your developer organization has been provisioned and your API environment is active.
      </p>
      
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; font-weight: bold; color: #0f172a;">Sandbox Environment Ready</span>
          <span class="badge badge-green">100,000 NGX CREDITED</span>
        </div>
        <p style="font-size: 13px; color: #475569; margin: 0;">
          Use your complimentary sandbox test credits to integrate BVN, NIN, NIN Advance, and NUBAN bank resolution APIs instantly.
        </p>
      </div>

      <p style="font-size: 13px; color: #475569;">
        Next steps to integrate:
      </p>
      <ul style="font-size: 13px; color: #475569; padding-left: 20px; line-height: 1.8;">
        <li>Generate your <b>Sandbox API Key</b> in the console</li>
        <li>Review API definitions in our <a href="https://docs.verixaid.com" style="color: #10b981; font-weight: bold;">Interactive Docs</a></li>
        <li>Provision your <b>Dedicated Paystack Account</b> for automated live wallet funding</li>
      </ul>

      <a href="https://verixaid.com/dashboard" class="btn">Open Developer Console &rarr;</a>
    `, `Welcome to Verixa ID, ${orgName}. Your 100,000 Sandbox test credits are active.`);

    await this.sendMail(to, 'Welcome to Verixa ID — Developer Account Ready', html);
  }

  async sendLoginAlertEmail(to: string, details: { ip?: string; userAgent?: string; time: string; location?: string }) {
    const html = this.getEmailWrapper(`
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span class="badge badge-blue">SECURITY ALERT</span>
      </div>
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">New Login Detected</h2>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        A successful sign-in to your Verixa ID developer account was recorded at <b>${details.time}</b>.
      </p>

      <div class="card">
        <table>
          <tr>
            <th style="width: 35%;">Parameter</th>
            <th>Details</th>
          </tr>
          <tr>
            <td style="color: #64748b; font-family: monospace;">IP Address</td>
            <td style="font-family: monospace; font-weight: 600;">${details.ip || 'Unknown IP'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Client Device</td>
            <td style="font-size: 12px; color: #334155;">${details.userAgent || 'Web Browser'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Timestamp</td>
            <td style="font-family: monospace;">${details.time}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #64748b;">
        If you initiated this sign-in, no action is needed. If you did not authorize this, please revoke your API keys immediately and update your password.
      </p>

      <a href="https://verixaid.com/dashboard/settings" class="btn" style="background: #0f172a;">Review Security Settings</a>
    `, `New sign-in detected on your Verixa ID account at ${details.time}`);

    await this.sendMail(to, 'Security Notice: New Login to Verixa ID', html);
  }

  async sendTopUpSuccessEmail(to: string, amount: number, newBalance: number, reference?: string) {
    const html = this.getEmailWrapper(`
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span class="badge badge-green">PAYMENT CONFIRMED</span>
      </div>
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Live Balance Credited</h2>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        Your Paystack transfer or checkout was confirmed. Your available balance has been credited.
      </p>

      <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
        <div style="font-size: 11px; text-transform: uppercase; font-family: monospace; color: #166534;">Deposited Amount</div>
        <div style="font-size: 28px; font-weight: 800; color: #15803d; font-family: monospace; margin: 4px 0;">
          +₦${amount.toLocaleString()}.00
        </div>
        <div style="font-size: 12px; color: #166534;">
          Credited as <b>${amount.toLocaleString()} NGX</b> at a 1:1 ratio.
        </div>
      </div>

      <table>
        <tr>
          <td style="color: #64748b; font-family: monospace;">Updated Balance</td>
          <td style="font-weight: 700; font-size: 15px; color: #0f172a; font-family: monospace;">
            ${newBalance.toLocaleString()} NGX (₦${newBalance.toLocaleString()}.00)
          </td>
        </tr>
        ${reference ? `
        <tr>
          <td style="color: #64748b; font-family: monospace;">Reference ID</td>
          <td style="font-family: monospace; font-size: 12px; color: #334155;">${reference}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="color: #64748b; font-family: monospace;">Date</td>
          <td style="font-family: monospace; font-size: 12px;">${new Date().toUTCString()}</td>
        </tr>
      </table>

      <a href="https://verixaid.com/dashboard/billing" class="btn">View Ledger & Transactions &rarr;</a>
    `, `Payment Confirmed: ₦${amount.toLocaleString()} credited to your Verixa ID balance.`);

    await this.sendMail(to, `Payment Received: ₦${amount.toLocaleString()} Credited — Verixa ID`, html);
  }

  async sendLowBalanceEmail(to: string, orgName: string, currentBalance: number) {
    const html = this.getEmailWrapper(`
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span class="badge badge-amber">LOW BALANCE WARNING</span>
      </div>
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Balance Depletion Alert: ${orgName}</h2>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        Your live NGX credit balance has fallen below <b>1,000 NGX</b> (₦1,000.00). To ensure uninterrupted API verification queries in production, please top up your account.
      </p>

      <div class="card" style="background: #fffbeb; border-color: #fde68a;">
        <div style="font-size: 11px; text-transform: uppercase; font-family: monospace; color: #92400e;">Current Balance</div>
        <div style="font-size: 24px; font-weight: 800; color: #b45309; font-family: monospace; margin: 4px 0;">
          ${currentBalance.toLocaleString()} NGX
        </div>
        <div style="font-size: 12px; color: #92400e;">
          Queries will fail automatically with HTTP 402 once balance reaches 0.
        </div>
      </div>

      <p style="font-size: 13px; color: #475569;">
        Transfer directly to your Dedicated Virtual Account for instant automated top-up within seconds.
      </p>

      <a href="https://verixaid.com/dashboard/billing" class="btn" style="background: #d97706;">Fund Live Balance Now &rarr;</a>
    `, `Low Balance Alert: Your Verixa ID balance is ${currentBalance.toLocaleString()} NGX.`);

    await this.sendMail(to, `⚠️ Low Balance Warning: ${currentBalance.toLocaleString()} NGX Remaining — Verixa ID`, html);
  }

  async sendApiKeyCreatedEmail(to: string, details: { keyName: string; environment: string; keyPrefix: string }) {
    const html = this.getEmailWrapper(`
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span class="badge badge-blue">API CREDENTIALS</span>
      </div>
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">New API Key Provisioned</h2>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        A new API key was generated for your organization on Verixa ID.
      </p>

      <div class="card">
        <table>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Key Label</td>
            <td style="font-weight: 700;">${details.keyName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Environment</td>
            <td>
              <span class="badge ${details.environment === 'live' ? 'badge-green' : 'badge-amber'}">
                ${details.environment.toUpperCase()}
              </span>
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Key Prefix</td>
            <td style="font-family: monospace; font-weight: 700;">${details.keyPrefix}••••••••</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #64748b;">
        Never commit your API keys into public git repositories. If you did not create this key, revoke it immediately in your console.
      </p>

      <a href="https://verixaid.com/dashboard/api-keys" class="btn">Manage API Keys &rarr;</a>
    `, `New ${details.environment} API Key provisioned: ${details.keyName}`);

    await this.sendMail(to, `New ${details.environment.toUpperCase()} API Key Created — Verixa ID`, html);
  }

  async sendBalanceAdjustmentEmail(
    to: string,
    orgName: string,
    amount: number,
    environment: string,
    reason: string,
    newBalance: number
  ) {
    const isCredit = amount >= 0;
    const html = this.getEmailWrapper(`
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span class="badge ${isCredit ? 'badge-green' : 'badge-amber'}">ADMIN ADJUSTMENT</span>
      </div>
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Balance Adjustment Applied: ${orgName}</h2>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        An administrative adjustment was processed on your <b>${environment.toUpperCase()}</b> wallet.
      </p>

      <div class="card">
        <table>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Adjustment</td>
            <td style="font-weight: 700; font-family: monospace; font-size: 16px; color: ${isCredit ? '#15803d' : '#b45309'};">
              ${isCredit ? '+' : ''}${amount.toLocaleString()} NGX
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Reason / Note</td>
            <td style="font-size: 13px; color: #334155;">${reason}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-family: monospace;">Updated Balance</td>
            <td style="font-weight: 700; font-family: monospace;">${newBalance.toLocaleString()} NGX</td>
          </tr>
        </table>
      </div>

      <a href="https://verixaid.com/dashboard/billing" class="btn">View Ledger &rarr;</a>
    `, `Balance adjustment: ${isCredit ? '+' : ''}${amount.toLocaleString()} NGX`);

    await this.sendMail(to, `Account Balance Adjustment: ${isCredit ? '+' : ''}${amount.toLocaleString()} NGX — Verixa ID`, html);
  }

  async sendPlanUpgradeEmail(
    to: string,
    orgName: string,
    tier: string,
    rates: { bvn: number; nin: number; nuban: number }
  ) {
    const html = this.getEmailWrapper(`
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span class="badge badge-green">PLAN UPGRADED</span>
      </div>
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Account Upgraded: ${tier} Plan</h2>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        Dear ${orgName}, your organization has been upgraded to the <b>${tier} Plan</b> with negotiated volume rates.
      </p>
      
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Your Custom Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BVN Verification</td>
              <td style="font-weight: bold; color: #15803d; font-family: monospace;">${rates.bvn} NGX (₦${rates.bvn}.00)</td>
            </tr>
            <tr>
              <td>NIN Verification</td>
              <td style="font-weight: bold; color: #15803d; font-family: monospace;">${rates.nin} NGX (₦${rates.nin}.00)</td>
            </tr>
            <tr>
              <td>NUBAN Bank Account Resolution</td>
              <td style="font-weight: bold; color: #15803d; font-family: monospace;">${rates.nuban} NGX (₦${rates.nuban}.00)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style="font-size: 13px; color: #475569;">
        These rates are active immediately across all your live API requests and dashboard explorer lookups.
      </p>

      <a href="https://verixaid.com/dashboard/billing" class="btn">View Plan in Console &rarr;</a>
    `, `Account upgraded to ${tier} with customized volume rates.`);

    await this.sendMail(to, `Account Upgraded to ${tier} — Verixa ID`, html);
  }

  async sendBonusDayAnnouncement(to: string, discountPercent: number, title: string) {
    const html = this.getEmailWrapper(`
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span class="badge badge-green">PROMOTION ACTIVE</span>
      </div>
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">⚡ ${title}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Special developer announcement: All verification request rates have been slashed by <b>${discountPercent}%</b> across all endpoints!
      </p>

      <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
        <div style="font-size: 28px; font-weight: 800; color: #15803d; font-family: monospace;">
          ${discountPercent}% DISCOUNT
        </div>
        <p style="font-size: 13px; color: #166534; margin: 4px 0 0;">
          Applies automatically at execution time across NIN, BVN, NIN Advance, and NUBAN calls.
        </p>
      </div>

      <p style="font-size: 13px; color: #475569;">
        Fund your wallet balance now to take full advantage of this promotional window.
      </p>

      <a href="https://verixaid.com/dashboard/billing" class="btn">Top Up Live Balance &rarr;</a>
    `, `Special Announcement: ${discountPercent}% Rate Slash Active on Verixa ID!`);

    await this.sendMail(to, `⚡ Special Rate Slash: ${discountPercent}% Off All Verifications — Verixa ID`, html);
  }

  async sendTestEmail(to: string, customConfig?: SmtpConfig): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      const activeTransporter = customConfig
        ? nodemailer.createTransport({
            host: customConfig.host || 'mail.verixaid.com',
            port: customConfig.port || 465,
            secure: customConfig.secure ?? (customConfig.port === 465),
            auth: {
              user: customConfig.user || 'no-reply@verixaid.com',
              pass: customConfig.pass || 'secret_password',
            },
          })
        : this.transporter;

      const fromHeader = customConfig?.fromEmail
        ? `"${customConfig.fromName || 'Verixa ID'}" <${customConfig.fromEmail}>`
        : this.getFromHeader();

      const html = this.getEmailWrapper(`
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span class="badge badge-green">SMTP DIAGNOSTIC</span>
        </div>
        <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">SMTP Configuration Verified</h2>
        <p style="font-size: 13px; line-height: 1.6; color: #334155;">
          This is an automated test message dispatched from the <b>Verixa ID Platform Operator Console</b> to confirm active SMTP email delivery.
        </p>

        <div class="card">
          <table>
            <tr>
              <td style="color: #64748b; font-family: monospace;">Host</td>
              <td style="font-family: monospace; font-weight: bold;">${customConfig?.host || this.currentConfig.host || 'mail.verixaid.com'}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-family: monospace;">Port / SSL</td>
              <td style="font-family: monospace;">${customConfig?.port || this.currentConfig.port || 465} (SSL: ${customConfig?.secure ?? true})</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-family: monospace;">Recipient</td>
              <td style="font-family: monospace;">${to}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-family: monospace;">Timestamp</td>
              <td style="font-family: monospace;">${new Date().toISOString()}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 12px; color: #15803d; font-weight: 600;">
          ✓ SMTP transport authenticated and verified successfully.
        </p>
      `, 'Verixa ID SMTP Diagnostic Test Message');

      const info = await activeTransporter.sendMail({
        from: fromHeader,
        to,
        subject: '✓ Verixa ID SMTP Test — Delivery Operational',
        html,
      });

      return {
        success: true,
        message: `Test email successfully dispatched to ${to}`,
        messageId: info.messageId,
      };
    } catch (err: any) {
      this.logger.error(`SMTP diagnostic test failed for ${to}`, err);
      let errMsg = err.message || 'Failed to dispatch test email';
      if (errMsg.includes('ECONNREFUSED')) {
        errMsg = `${errMsg} — No mail daemon running on target host. Note: If using cPanel (mail.verixaid.com), verify your DNS points to your cPanel server IP (not the VPS application server).`;
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      const from = this.getFromHeader();
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email dispatched to ${to} [${subject}]`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to} [${subject}]`, error);
    }
  }
}
