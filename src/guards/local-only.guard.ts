import { Injectable, CanActivate  } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LocalOnlyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(): boolean {
    const isLocal = this.configService.get<boolean>("IS_LOCAL") === true;
    return isLocal;
  }
}
