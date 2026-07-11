import { Announcement } from "./modules/announcements/entities/announcement.entity";
import { ContentCategory } from "./modules/content-pages/entities/content-category.entity";
import { ContentPage } from "./modules/content-pages/entities/content-page.entity";
import { ContentPageMedia } from "./modules/content-pages/entities/content-page-media.entity";
import { FloatingMessage } from "./modules/floating-messages/entities/floating-message.entity";
import { FormField } from "./modules/form-fields/entities/form-field.entity";
import { FormSubmission } from "./modules/form-submissions/entities/form-submission.entity";
import { HeroSlide } from "./modules/hero-slides/entities/hero-slide.entity";
import { Image } from "./modules/images/entities/image.entity";
import { LayoutSetting } from "./modules/layout-settings/entities/layout-setting.entity";
import { Media } from "./modules/media/entities/media.entity";
import { PageGroup } from "./modules/page-groups/entities/page-group.entity";
import { Popup } from "./modules/popups/entities/popup.entity";
import { SiteConfig } from "./modules/site-config/entities/site-config.entity";
import { Video } from "./modules/videos/entities/video.entity";
import { VideoCategory } from "./modules/video-categories/entities/video-category.entity";

/**
 * 교회별(테넌트) DB에 저장되는 엔티티 목록.
 * 여기 없는 엔티티(User, Church, ChurchAdmin, ChurchFeature, Invitation)는
 * 중앙(플랫폼) DB에 저장됩니다.
 */
export const TENANT_ENTITIES = [
  Announcement,
  ContentCategory,
  ContentPage,
  ContentPageMedia,
  FloatingMessage,
  FormField,
  FormSubmission,
  HeroSlide,
  Image,
  LayoutSetting,
  Media,
  PageGroup,
  Popup,
  SiteConfig,
  Video,
  VideoCategory,
] as const;
