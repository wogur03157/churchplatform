export { User } from "./user.entity";
export { Church, type ChurchStatus } from "./church.entity";
export { ChurchAdmin } from "./church-admin.entity";
export { ChurchFeature, ALL_FEATURES, type FeatureKey } from "./church-feature.entity";

import { User } from "./user.entity";
import { Church } from "./church.entity";
import { ChurchAdmin } from "./church-admin.entity";
import { ChurchFeature } from "./church-feature.entity";

/** 중앙(플랫폼) DB 공통 엔티티 — 모든 앱의 TypeOrmModule.forRoot entities에 포함 */
export const PLATFORM_ENTITIES = [User, Church, ChurchAdmin, ChurchFeature];
