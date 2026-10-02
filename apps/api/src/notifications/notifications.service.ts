import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.verixaid.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'no-reply@verixaid.com',
        pass: process.env.SMTP_PASS || 'secret_password',
      },
    });
  }

  async sendWelcomeEmail(to: string, orgName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #18181b;">
        <h1 style="color: #09090b;">Welcome to Verixa ID, ${orgName}!</h1>
        <p>Your dedicated organization account and sandbox environment have been provisioned.</p>
        <p>You have been credited with <b>100,000 Free Sandbox NGX credits</b> to test our identity verification APIs.</p>
        <p>Join our developer community for real-time announcements:</p>
        <ul>
          <li><a href="https://chat.whatsapp.com/verixaid">WhatsApp Developer Community</a></li>
          <li><a href="https://t.me/verixaid">Telegram Channel</a></li>
        </ul>
        <p>Best regards,<br/>The Verixa ID Team</p>
      </div>
    `;

    await this.sendMail(to, 'Welcome to Verixa ID — Developer Account Ready', html);
  }

  async sendTopUpSuccessEmail(to: string, amount: number, newBalance: number) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #18181b;">
        <h2 style="color: #16a34a;">NGX Balance Top-Up Confirmed</h2>
        <p>We received your deposit of <b>${amount.toLocaleString()} NGX</b> (₦${amount.toLocaleString()}.00 NGN).</p>
        <p>Your updated available balance is: <b>${newBalance.toLocaleString()} NGX</b>.</p>
        <p>Transactions are instantly accessible in your dashboard ledger.</p>
      </div>
    `;

    await this.sendMail(to, 'NGX Balance Credited — Verixa ID', html);
  }

  async sendPlanUpgradeEmail(
    to: string,
    orgName: string,
    tier: string,
    rates: { bvn: number; nin: number; nuban: number }
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #18181b; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #09090b; margin-top: 0;">Account Plan Upgraded: ${tier}</h2>
        <p>Dear ${orgName},</p>
        <p>Congratulations! Based on your verification volume and partnership tier, your account has been upgraded to the <b>${tier} Plan</b> with customized volume rates.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f4f4f5; text-align: left;">
              <th style="padding: 8px; border-bottom: 1px solid #e4e4e7;">Service</th>
              <th style="padding: 8px; border-bottom: 1px solid #e4e4e7;">Your Custom Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">BVN Verification</td>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; font-weight: bold; color: #16a34a;">${rates.bvn} NGX (₦${rates.bvn}.00)</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">NIN Verification</td>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; font-weight: bold; color: #16a34a;">${rates.nin} NGX (₦${rates.nin}.00)</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">NUBAN Bank Account Resolution</td>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; font-weight: bold; color: #16a34a;">${rates.nuban} NGX (₦${rates.nuban}.00)</td>
            </tr>
          </tbody>
        </table>

        <p>These rates are now active automatically on all your live API requests.</p>
        <p><a href="https://dashboard.verixaid.com/dashboard/billing" style="display: inline-block; background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Dashboard</a></p>
        <p>Best regards,<br/>Verixa ID Accounts Team</p>
      </div>
    `;

    await this.sendMail(to, `Account Upgraded to ${tier} — Verixa ID`, html);
  }

  async sendBonusDayAnnouncement(to: string, discountPercent: number, title: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #18181b; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #16a34a;">🎉 ${title}: ${discountPercent}% Rate Slash Active!</h2>
        <p>Special Announcement for Verixa ID developers and partners:</p>
        <p>All identity and bank verification request fees have been discounted by <b>${discountPercent}%</b> across all endpoints.</p>
        <p>This promotional discount applies automatically at execution time. Top up your balance to take full advantage.</p>
        <p><a href="https://dashboard.verixaid.com/dashboard/billing" style="display: inline-block; background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Top Up NGX Credits</a></p>
      </div>
    `;

    await this.sendMail(to, `⚡ Special Rate Slash: ${discountPercent}% Off All Verifications — Verixa ID`, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: '"Verixa ID" <no-reply@verixaid.com>',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }
}
