export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  requestId?: string;
  errors?: unknown;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  nextCursor?: string | null;
}
