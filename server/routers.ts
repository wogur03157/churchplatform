import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Announcements
  announcements: router({
    list: publicProcedure
      .input(z.object({ publishedOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAnnouncements(input?.publishedOnly ?? false);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAnnouncementById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createAnnouncement({
          title: input.title,
          content: input.content,
          authorId: ctx.user.id,
          isPublished: input.isPublished ? 1 : 0,
          publishedAt: input.isPublished ? new Date() : undefined,
        });
        
        // Notify owner about new announcement
        if (input.isPublished) {
          await notifyOwner({
            title: "새 공지사항 발행",
            content: `"${input.title}" 공지사항이 발행되었습니다.`,
          });
        }
        
        return { success: true, id: (result as any).insertId };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.content !== undefined) updateData.content = input.content;
        if (input.isPublished !== undefined) {
          updateData.isPublished = input.isPublished ? 1 : 0;
          if (input.isPublished) {
            updateData.publishedAt = new Date();
          }
        }
        
        await db.updateAnnouncement(input.id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAnnouncement(input.id);
        return { success: true };
      }),
  }),

  // Images
  images: router({
    list: publicProcedure
      .input(z.object({ publishedOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getImages(input?.publishedOnly ?? false);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getImageById(input.id);
      }),
    
    upload: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        fileData: z.string(), // base64
        mimeType: z.string(),
        fileSize: z.number(),
        isPublished: z.boolean().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `images/${ctx.user.id}/${nanoid()}.${input.mimeType.split('/')[1]}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        const result = await db.createImage({
          title: input.title,
          description: input.description,
          fileKey,
          url,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          uploadedBy: ctx.user.id,
          isPublished: input.isPublished ? 1 : 0,
          displayOrder: input.displayOrder ?? 0,
        });
        
        // Notify owner about new image
        if (input.isPublished) {
          await notifyOwner({
            title: "새 이미지 업로드",
            content: `"${input.title}" 이미지가 갤러리에 추가되었습니다.`,
          });
        }
        
        return { success: true, id: (result as any).insertId, url };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        isPublished: z.boolean().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.isPublished !== undefined) updateData.isPublished = input.isPublished ? 1 : 0;
        if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
        
        await db.updateImage(input.id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteImage(input.id);
        return { success: true };
      }),
  }),

  // Videos
  videos: router({
    list: publicProcedure
      .input(z.object({ publishedOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getVideos(input?.publishedOnly ?? false);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideoById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        videoType: z.enum(["upload", "youtube", "vimeo", "url"]),
        url: z.string().url(),
        fileKey: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
        duration: z.number().optional(),
        isPublished: z.boolean().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createVideo({
          title: input.title,
          description: input.description,
          videoType: input.videoType,
          url: input.url,
          fileKey: input.fileKey,
          thumbnailUrl: input.thumbnailUrl,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          duration: input.duration,
          uploadedBy: ctx.user.id,
          isPublished: input.isPublished ? 1 : 0,
          displayOrder: input.displayOrder ?? 0,
        });
        
        // Notify owner about new video
        if (input.isPublished) {
          await notifyOwner({
            title: "새 영상 업로드",
            content: `"${input.title}" 영상이 추가되었습니다.`,
          });
        }
        
        return { success: true, id: (result as any).insertId };
      }),
    
    uploadFile: adminProcedure
      .input(z.object({
        fileData: z.string(), // base64
        mimeType: z.string(),
        fileSize: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `videos/${ctx.user.id}/${nanoid()}.${input.mimeType.split('/')[1]}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { success: true, url, fileKey };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        url: z.string().url().optional(),
        thumbnailUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.url !== undefined) updateData.url = input.url;
        if (input.thumbnailUrl !== undefined) updateData.thumbnailUrl = input.thumbnailUrl;
        if (input.isPublished !== undefined) updateData.isPublished = input.isPublished ? 1 : 0;
        if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
        
        await db.updateVideo(input.id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteVideo(input.id);
        return { success: true };
      }),
  }),

  // Floating Messages
  floatingMessages: router({
    list: publicProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getFloatingMessages(input?.activeOnly ?? false);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFloatingMessageById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        messageType: z.enum(["info", "warning", "success", "announcement"]).optional(),
        isActive: z.boolean().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        displayPosition: z.enum(["top", "bottom", "center"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createFloatingMessage({
          title: input.title,
          content: input.content,
          messageType: input.messageType ?? "info",
          isActive: input.isActive ? 1 : 0,
          startDate: input.startDate,
          endDate: input.endDate,
          displayPosition: input.displayPosition ?? "center",
          createdBy: ctx.user.id,
        });
        
        return { success: true, id: (result as any).insertId };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        messageType: z.enum(["info", "warning", "success", "announcement"]).optional(),
        isActive: z.boolean().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        displayPosition: z.enum(["top", "bottom", "center"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.content !== undefined) updateData.content = input.content;
        if (input.messageType !== undefined) updateData.messageType = input.messageType;
        if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;
        if (input.startDate !== undefined) updateData.startDate = input.startDate;
        if (input.endDate !== undefined) updateData.endDate = input.endDate;
        if (input.displayPosition !== undefined) updateData.displayPosition = input.displayPosition;
        
        await db.updateFloatingMessage(input.id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFloatingMessage(input.id);
        return { success: true };
      }),
  }),

  // Layout Settings
  layoutSettings: router({
    list: publicProcedure.query(async () => {
      return await db.getLayoutSettings();
    }),
    
    upsert: adminProcedure
      .input(z.object({
        sectionType: z.enum(["announcements", "images", "videos", "hero"]),
        isVisible: z.boolean(),
        displayOrder: z.number(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertLayoutSetting({
          sectionType: input.sectionType,
          isVisible: input.isVisible ? 1 : 0,
          displayOrder: input.displayOrder,
          title: input.title,
          subtitle: input.subtitle,
          updatedBy: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        isVisible: z.boolean().optional(),
        displayOrder: z.number().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updateData: Record<string, unknown> = {};
        if (input.isVisible !== undefined) updateData.isVisible = input.isVisible ? 1 : 0;
        if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
        if (input.title !== undefined) updateData.title = input.title;
        if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
        updateData.updatedBy = ctx.user.id;
        
        await db.updateLayoutSetting(input.id, updateData);
        return { success: true };
      }),
  }),

  // AI Content Assistant
  aiAssistant: router({
    improveText: adminProcedure
      .input(z.object({
        text: z.string().min(1),
        action: z.enum(["improve", "summarize", "translate_en", "translate_ko"]),
      }))
      .mutation(async ({ input }) => {
        let systemPrompt = "";
        
        switch (input.action) {
          case "improve":
            systemPrompt = "당신은 전문 작가입니다. 주어진 텍스트를 더 명확하고 우아하게 개선해주세요. 원래의 의미를 유지하면서 문장을 다듬고 가독성을 높여주세요.";
            break;
          case "summarize":
            systemPrompt = "주어진 텍스트를 핵심 내용만 간결하게 요약해주세요. 중요한 정보는 모두 포함하되 불필요한 부분은 제거해주세요.";
            break;
          case "translate_en":
            systemPrompt = "주어진 한국어 텍스트를 자연스러운 영어로 번역해주세요.";
            break;
          case "translate_ko":
            systemPrompt = "주어진 영어 텍스트를 자연스러운 한국어로 번역해주세요.";
            break;
        }
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.text },
          ],
        });
        
        const result = response.choices[0]?.message?.content || "";
        return { result };
      }),
  }),
});

export type AppRouter = typeof appRouter;
