import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationTier } from '../organizations/entities/organization.entity';

@Controller('v1/admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async getMetrics() {
    return this.adminService.getPlatformMetrics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizations')
  async getOrganizations() {
    return this.adminService.getOrganizations();
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
      baseRates?: { bvn?: number; nin?: number; nuban?: number };
      cacheRates?: { bvn?: number; nin?: number; nuban?: number };
      cacheSettings?: { enabled?: boolean; ttlDays?: number };
      bonusPromotion?: { active: boolean; discountPercent: number; title: string; expiry?: string };
    }
  ) {
    return this.adminService.updatePricing(body);
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
}
