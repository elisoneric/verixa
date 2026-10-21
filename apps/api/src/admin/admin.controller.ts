import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationTier } from '../organizations/entities/organization.entity';
import { SmtpConfig } from '../notifications/notifications.service';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('v1/pricing')
export class PricingController {
  constructor(private adminService: AdminService) {}

  @Get()
  async getPublicPricing() {
    return this.adminService.getPublicPricing();
  }
}

@Controller('v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async getMetrics() {
    return this.adminService.getPlatformMetrics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue')
  async getRevenue() {
    return this.adminService.getRevenueMetrics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getLogs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('serviceType') serviceType?: string,
    @Query('status') status?: string,
    @Query('orgId') orgId?: string,
  ) {
    return this.adminService.getClusterLogs({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      serviceType,
      status,
      orgId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations')
  async getOrganizations() {
    return this.adminService.getOrganizations();
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations/:id/users')
  async getOrganizationUsers(@Param('id') orgId: string) {
    return this.adminService.getOrganizationUsers(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizations/:id/balance')
  async adjustOrgBalance(
    @Param('id') orgId: string,
    @Body() body: {
      amount: number;
      environment: 'live' | 'sandbox';
      reason?: string;
      notifyEmail?: boolean;
    }
  ) {
    return this.adminService.adjustOrganizationBalance(
      orgId,
      body.amount,
      body.environment,
      body.reason,
      body.notifyEmail ?? true
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizations/:id/status')
  async updateOrgStatus(
    @Param('id') orgId: string,
    @Body() body: { status: 'active' | 'suspended' }
  ) {
    return this.adminService.updateOrganizationStatus(orgId, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizations/:id/tier')
  async upgradeOrgTier(
    @Param('id') orgId: string,
    @Body() body: {
      tier: OrganizationTier;
      customRates?: { bvn?: number; nin?: number; nuban?: number };
      notifyEmail?: boolean;
    }
  ) {
    return this.adminService.upgradeOrganization(
      orgId,
      body.tier,
      body.customRates,
      body.notifyEmail ?? true
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('pricing')
  async getPricing() {
    return this.adminService.getPricingConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Post('pricing')
  async updatePricing(
    @Body() body: {
      baseRates?: Record<string, number>;
      cacheRates?: Record<string, number>;
      cacheSettings?: { enabled?: boolean; ttlDays?: number };
      bonusPromotion?: { active: boolean; discountPercent: number; title: string; expiry?: string };
    }
  ) {
    return this.adminService.updatePricing(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dojah-pricing')
  async getDojahPricing() {
    return this.adminService.getDojahPricing();
  }

  @UseGuards(JwtAuthGuard)
  @Post('dojah-pricing')
  async updateDojahPricing(@Body() body: { rates: Record<string, number> }) {
    return this.adminService.updateDojahPricing(body.rates);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pricing/broadcast')
  async broadcastPromotion(
    @Body() body: { discountPercent: number; title: string }
  ) {
    return this.adminService.broadcastPromotion(body.discountPercent, body.title);
  }

  @UseGuards(JwtAuthGuard)
  @Get('providers')
  async getProviderHealth() {
    return this.adminService.getProviderHealth();
  }

  @UseGuards(JwtAuthGuard)
  @Get('config')
  async getConfigs() {
    return this.adminService.getAllConfigs();
  }

  @UseGuards(JwtAuthGuard)
  @Post('config')
  async updateConfig(@Body() body: { key: string; value: string; isSecret?: boolean; description?: string }) {
    await this.adminService.updateConfig(body.key, body.value, body.isSecret ?? false, body.description);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('notifications/test')
  async testNotification(
    @Body() body: { to: string; customConfig?: SmtpConfig }
  ) {
    return this.adminService.testSmtpConnection(body.to, body.customConfig);
  }
}
