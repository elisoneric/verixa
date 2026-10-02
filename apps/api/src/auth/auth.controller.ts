import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Environment } from '../organizations/entities/environment-config.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.email, body.password, body.orgName, body.complianceData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api-keys')
  listApiKeys(@Req() req: any) {
    return this.authService.listApiKeys(req.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api-keys')
  generateApiKey(@Req() req: any, @Body() body: { environment?: Environment; name?: string }) {
    const env = body.environment || Environment.SANDBOX;
    return this.authService.generateApiKey(req.organizationId, env, body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('api-keys/:id')
  revokeApiKey(@Req() req: any, @Param('id') id: string) {
    return this.authService.revokeApiKey(req.organizationId, id);
  }
}
