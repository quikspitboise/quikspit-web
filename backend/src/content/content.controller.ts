import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminAllowlistGuard } from '../auth/admin-allowlist.guard';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { ContentService } from './content.service';
import { pageKey } from './content.validation';
import {
  CreatePageDto,
  ExpectedVersionDto,
  QuoteDto,
  ReorderSectionsDto,
  RestoreContentDto,
  RevisionQueryDto,
  SaveContentDraftDto,
} from './dto/content.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  bundle() {
    return this.content.getPublicBundle();
  }

  @Get('site')
  @Header('Cache-Control', 'no-store')
  site() {
    return this.content.getPublic('site');
  }

  @Get('catalog')
  @Header('Cache-Control', 'no-store')
  catalog() {
    return this.content.getPublic('catalog');
  }

  @Get('pages')
  @Header('Cache-Control', 'no-store')
  pages() {
    return this.content.listPublicPages();
  }

  @Get('pages/:slug')
  @Header('Cache-Control', 'no-store')
  page(@Param('slug') slug: string) {
    let key: string;
    try {
      key = pageKey(slug);
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new NotFoundException('Published content not found');
      throw error;
    }
    return this.content.getPublic(key);
  }

  @Post('quote')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  quote(@Body() dto: QuoteDto) {
    return this.content.quote(dto);
  }
}

@Controller('content/admin')
@UseGuards(ClerkAuthGuard, AdminAllowlistGuard)
export class ContentAdminController {
  constructor(private readonly content: ContentService) {}

  @Get('documents')
  @Header('Cache-Control', 'no-store')
  list() {
    return this.content.listAdmin();
  }

  @Get('documents/:key')
  @Header('Cache-Control', 'no-store')
  get(@Param('key') key: string) {
    return this.content.getAdmin(key);
  }

  @Post('pages')
  createPage(@Body() dto: CreatePageDto, @Req() req: AuthenticatedRequest) {
    return this.content.createPage(dto, req.clerkAuth!.userId);
  }

  @Put('documents/:key/draft')
  save(
    @Param('key') key: string,
    @Body() dto: SaveContentDraftDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.content.saveDraft(key, dto, req.clerkAuth!.userId);
  }

  @Post('documents/:key/publish')
  @HttpCode(200)
  publish(
    @Param('key') key: string,
    @Body() dto: ExpectedVersionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.content.publish(
      key,
      dto.expectedVersion,
      req.clerkAuth!.userId,
    );
  }

  @Post('documents/:key/unpublish')
  @HttpCode(200)
  unpublish(
    @Param('key') key: string,
    @Body() dto: ExpectedVersionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.content.unpublish(
      key,
      dto.expectedVersion,
      req.clerkAuth!.userId,
    );
  }

  @Post('documents/:key/reorder')
  @HttpCode(200)
  reorder(
    @Param('key') key: string,
    @Body() dto: ReorderSectionsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.content.reorderSections(key, dto, req.clerkAuth!.userId);
  }

  @Get('documents/:key/revisions')
  @Header('Cache-Control', 'no-store')
  revisions(@Param('key') key: string, @Query() query: RevisionQueryDto) {
    return this.content.listRevisions(key, query);
  }

  @Get('documents/:key/revisions/:id')
  @Header('Cache-Control', 'no-store')
  revision(@Param('key') key: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.content.getRevision(key, id);
  }

  @Post('documents/:key/restore')
  @HttpCode(200)
  restore(
    @Param('key') key: string,
    @Body() dto: RestoreContentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.content.restore(
      key,
      dto.expectedVersion,
      dto.revisionId,
      req.clerkAuth!.userId,
    );
  }
}
