import { supabase } from "./supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = {
  "image/jpeg": true,
  "image/png": true,
  "image/gif": true,
  "application/pdf": true,
  "application/msword": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    true,
  "text/plain": true,
  "text/markdown": true,
  "text/javascript": true,
  "text/typescript": true,
  "text/html": true,
  "text/css": true,
  "application/json": true,
  "text/x-python": true,
  "text/x-java": true,
  "text/x-c": true,
  "text/x-c++": true,
};

export function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    );
  }
  if (!ALLOWED_FILE_TYPES[file.type]) {
    throw new Error("File type not supported");
  }
}

export async function uploadFile(file: File, userId: string, logId: string) {
  validateFile(file);
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${logId}/${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("activity-files")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("activity-files").getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("uploaded_files").insert({
      user_id: userId,
      log_id: logId,
      file_name: file.name,
      file_url: publicUrl,
    });

    if (dbError) throw dbError;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFile(fileId: string, filePath: string) {
  try {
    const { error: storageError } = await supabase.storage
      .from("activity-files")
      .remove([filePath]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from("uploaded_files")
      .delete()
      .eq("id", fileId);

    if (dbError) throw dbError;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export async function getFilesForLog(logId: string) {
  try {
    const { data, error } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("log_id", logId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting files:", error);
    throw error;
  }
}
