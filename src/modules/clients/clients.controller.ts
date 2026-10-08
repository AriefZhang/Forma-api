import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/auth-user";
import { AuthGuard } from "../auth/auth.guard";
import { ClientsService } from "./clients.service";
import { LinkClientDto } from "./dto/clients.dto";
@Controller("api")
@UseGuards(AuthGuard)
export class ClientsController {
  constructor(private service: ClientsService) {}
  @Get("clients")
  clients(@Req() req: AuthenticatedRequest) {
    return this.service.clients(req.user);
  }
  @Post("clients")
  addClient(@Req() req: AuthenticatedRequest, @Body() input: LinkClientDto) {
    return this.service.addClient(req.user, input);
  }
  @Get("trainer-requests")
  requests(@Req() req: AuthenticatedRequest) {
    return this.service.requests(req.user);
  }
  @Post("trainer-requests/:id/accept")
  accept(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.accept(req.user, id);
  }
  @Delete("trainer-requests/:id")
  revoke(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.revoke(req.user, id);
  }
}
