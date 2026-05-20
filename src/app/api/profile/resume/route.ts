import { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { apiError } from "@/lib/utils";
import { parsePDF, parseDOCX, structureResumeWithClaude } from "@/services/resume/resume-parser";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const formData = await req.formData();
  const file = formData.get("resume") as File | null;

  if (!file) return apiError("No file provided", "NO_FILE");
  if (file.size > MAX_FILE_SIZE) return apiError("File too large (max 5MB)", "FILE_TOO_LARGE");
  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiError("Only PDF and DOCX files are allowed", "INVALID_FILE_TYPE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "application/pdf" ? "pdf" : "docx";
  const key = `resumes/${session.user.id}/${Date.now()}.${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  const rawText = ext === "pdf" ? await parsePDF(buffer) : await parseDOCX(buffer);
  const parsed = await structureResumeWithClaude(rawText);

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      resumeUrl: `${R2_PUBLIC_URL}/${key}`,
      resumeKey: key,
      parsedSkills: parsed.skills,
      parsedExp: parsed.experience as unknown as object[],
      parsedEdu: parsed.education as unknown as object[],
    },
    update: {
      resumeUrl: `${R2_PUBLIC_URL}/${key}`,
      resumeKey: key,
      parsedSkills: parsed.skills,
      parsedExp: parsed.experience as unknown as object[],
      parsedEdu: parsed.education as unknown as object[],
    },
  });

  return Response.json({ parsed, resumeUrl: `${R2_PUBLIC_URL}/${key}` });
}
