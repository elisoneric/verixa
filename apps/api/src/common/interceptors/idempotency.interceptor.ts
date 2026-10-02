import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];

    // Only apply idempotency to POST requests that have the header
    if (request.method !== 'POST' || !idempotencyKey) {
      return next.handle();
    }

    // Include org ID to prevent key collision across users
    const cacheKey = `idempotency:${request.organizationId}:${idempotencyKey}`;
    const cachedResponse = await this.redisClient.get(cacheKey);

    if (cachedResponse) {
      return of(JSON.parse(cachedResponse));
    }

    return next.handle().pipe(
      tap((data) => {
        // Cache successful response for 24 hours
        this.redisClient.set(cacheKey, JSON.stringify(data), 'EX', 60 * 60 * 24);
      }),
    );
  }
}
