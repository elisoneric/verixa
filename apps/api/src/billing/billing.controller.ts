import { Controller, Post, Get, Body, Req, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PaystackService } from './paystack.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as crypto from 'crypto';

@Controller('v1/billing')
export class BillingController {
  constructor(
    private billingService: BillingService,
    private paystackService: PaystackService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Req() req: any) {
    return this.billingService.getBalance(req.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(@Req() req: any) {
    return this.billingService.getTransactions(req.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('fund-sandbox')
  async fundSandbox(@Req() req: any, @Body() body: { amount?: number }) {
    return this.billingService.fundSandbox(req.organizationId, body.amount || 10000);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(@Req() req: any, @Body() body: { amount: number; reference: string }) {
    const url = await this.paystackService.initializeCheckout(req.user.email, body.amount, body.reference);
    return { url };
  }

  @Post('webhook/paystack')
  async handleWebhook(@Headers('x-paystack-signature') signature: string, @Body() body: any) {
    const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key';
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');

    if (hash !== signature && process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Invalid signature');
    }

    const event = body.event;
    if (event === 'charge.success') {
      const data = body.data;
      const amountNgx = data.amount / 100; // Convert from kobo to NGX
      const customerEmail = data.customer.email;

      await this.billingService.handleSuccessfulTopup(customerEmail, amountNgx, data.reference);
    }

    return { status: 'success' };
  }
}
