import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import { TEMPLATES_REGISTRY, getTemplateDemoContent } from "@/lib/templates/registry";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const template = TEMPLATES_REGISTRY[slug];

    if (!template) {
      return apiError("Không tìm thấy mẫu thiệp yêu cầu.", "TEMPLATE_NOT_FOUND", 404);
    }

    const demoContent = getTemplateDemoContent(slug);

    return apiSuccess({
      template,
      demoContent,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

