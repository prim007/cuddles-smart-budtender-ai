/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as newsletterConfirmation } from './newsletter-confirmation.tsx'
import { template as welcomeBack } from './welcome-back.tsx'
import { template as tBreakMilestone } from './t-break-milestone.tsx'
import { template as articleApproved } from './article-approved.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'newsletter-confirmation': newsletterConfirmation,
  'welcome-back': welcomeBack,
  't-break-milestone': tBreakMilestone,
  'article-approved': articleApproved,
}