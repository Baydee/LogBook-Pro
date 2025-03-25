/**
 * This file provides fallback functionality when API calls fail
 */

// Fallback function for when AI summary generation fails
export function generateFallbackSummary({
  activityLog,
  summaryLength,
  workingHours,
}: {
  activityLog: string;
  summaryLength: number;
  workingHours: string;
  companyName?: string;
  extractedFileText?: string;
}) {
  // Extract time information
  const [startTime, endTime] = workingHours.split(" - ");

  // Create a basic summary from the activity log
  let summary = `Today I arrived at ${startTime} and worked on various tasks. `;

  // Add some content from the activity log (limited by summary length)
  if (activityLog) {
    const words = activityLog.split(/\s+/);
    const excerpt = words
      .slice(0, Math.min(summaryLength - 30, words.length))
      .join(" ");
    summary += excerpt;

    if (summary.length < summaryLength * 5) {
      summary += `. I completed my work and left at ${endTime}.`;
    }
  } else {
    summary += `I focused on completing my assigned tasks and left at ${endTime}.`;
  }

  return summary;
}
