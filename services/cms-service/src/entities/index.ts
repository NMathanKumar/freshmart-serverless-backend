export interface CmsPage {
  pageId: string;
  slug: string;
  title: string;
  content: string;
  type: 'ABOUT_US' | 'PRIVACY_POLICY' | 'TERMS' | 'FAQ' | 'CONTACT' | 'ANNOUNCEMENT';
  isPublished: boolean;
  updatedAt: string;
}