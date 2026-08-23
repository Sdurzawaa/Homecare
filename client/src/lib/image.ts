export function optimizeCloudinaryUrl(url: string, width = 600): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  return url.replace(
    "/upload/",
    `/upload/w_${width},q_auto,f_auto/`,
  );
}
