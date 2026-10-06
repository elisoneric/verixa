import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Req, 
  Param, 
  Headers, 
  UnauthorizedException, 
  BadRequestException, 
  UseGuards 
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { PaystackService } from './paystack.service';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import * as crypto from 'crypto';

@Controller('v1/billing')
export class BillingController {
  constructor(
    private billingService: BillingService,
    private paystackService: PaystackService,
  ) {}

  @UseGuards(DualAuthGuard)
  @Get('balance')
  async getBalance(@Req() req: any) {
    return this.billingService.getBalance(req.organizationId);
  }

  @UseGuards(DualAuthGuard)
  @Get('transactions')
  async getTransactions(@Req() req: any) {
    return this.billingService.getTransactions(req.organizationId);
  }

  @UseGuards(DualAuthGuard)
  @Post('fund-sandbox')
  async fundSandbox(@Req() req: any, @Body() body: { amount?: number }) {
    return this.billingService.fundSandbox(req.organizationId, body.amount || 10000);
  }

  @UseGuards(DualAuthGuard)
  @Post('checkout')
  async createCheckout(
    @Req() req: any, 
    @Body() body: { 
      amount: number; 
      reference?: string; 
      customerEmail?: string; 
      callbackUrl?: string; 
      metadata?: any; 
    }
  ) {
    if (!body.amount || body.amount < 100) {
      throw new BadRequestException('Amount must be at least 100 NGN');
    }

    const email = body.customerEmail || req.user?.email || 'developer@verixa.internal';
    const reference = body.reference || `vrx_tx_${crypto.randomBytes(8).toString('hex')}`;

    const checkoutResult = await this.paystackService.initializeCheckout(
      email,
      body.amount,
      reference,
      body.callbackUrl,
      {
        ...body.metadata,
        org_id: req.organizationId,
        environment: req.environment,
      }
    );

    const balanceData = await this.billingService.getBalance(req.organizationId);

    return {
      status: 'success',
      url: checkoutResult.authorization_url, // Backward compatibility with dashboard
      data: {
        reference: checkoutResult.reference,
        checkoutUrl: checkoutResult.authorization_url,
        accessCode: checkoutResult.access_code,
        amount: body.amount,
        currency: 'NGN',
        customerEmail: email,
        callbackUrl: body.callbackUrl || null,
        dedicatedVirtualAccount: balanceData.dedicatedVirtualAccount,
      },
    };
  }

  @UseGuards(DualAuthGuard)
  @Get('payments/:reference')
  async getPaymentStatus(@Req() req: any, @Param('reference') reference: string) {
    return this.billingService.verifyPayment(reference, req.organizationId);
  }

  @UseGuards(DualAuthGuard)
  @Post('payments/verify')
  async verifyPaymentBody(@Req() req: any, @Body() body: { reference: string }) {
    if (!body.reference) {
      throw new BadRequestException('Payment reference is required');
    }
    return this.billingService.verifyPayment(body.reference, req.organizationId);
  }

  @Post('webhook/paystack')
  async handleWebhook(@Headers('x-paystack-signature') signature: string, @Body() body: any) {
    const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key';
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');

    if (hash !== signature && process.env.NODE_ENV === 'production' && !secret.startsWith('sk_test_mock')) {
      throw new UnauthorizedException('Invalid signature');
    }

    const event = body.event;
    if (event === 'charge.success') {
      const data = body.data;
      const amountNgx = data.amount / 100; // Convert from kobo to NGX
      const customerEmail = data.customer?.email;
      const orgIdFromMeta = data.metadata?.org_id;

      await this.billingService.handleSuccessfulTopup(customerEmail, amountNgx, data.reference, orgIdFromMeta);
    }

    return { status: 'success' };
  }
}
