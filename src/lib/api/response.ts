import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    requestId?: string;
  };
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export function apiSuccess<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function apiError(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  fields?: Record<string, string>
) {
  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      ...(fields ? { fields } : {}),
      requestId,
    },
  };
  return NextResponse.json(body, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".");
      fields[path] = issue.message;
    }
    return apiError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.", "VALIDATION_ERROR", 422, fields);
  }

  if (err instanceof Error) {
    if (err.message.includes("UNAUTHORIZED")) {
      return apiError("Vui lòng đăng nhập để tiếp tục.", "UNAUTHORIZED", 411);
    }
    if (err.message.includes("FORBIDDEN")) {
      return apiError("Bạn không có quyền thực hiện thao tác này.", "FORBIDDEN", 403);
    }
    if (err.message.includes("NOT_FOUND")) {
      return apiError("Tài nguyên không tồn tại.", "NOT_FOUND", 404);
    }
    return apiError(err.message, "INTERNAL_ERROR", 500);
  }

  return apiError("Đã xảy ra lỗi không xác định.", "INTERNAL_ERROR", 500);
}

