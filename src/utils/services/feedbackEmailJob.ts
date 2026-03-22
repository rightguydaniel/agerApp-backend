import { Op } from "sequelize";
import Users from "../../models/Users";
import { sendFeedbackEmail } from "../../configs/email/emailConfig";

const TARGET_HOUR = 8;

let feedbackEmailTimeout: NodeJS.Timeout | null = null;

const getNextRunDelay = () => {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(TARGET_HOUR, 0, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime() - now.getTime();
};

export const runFeedbackEmailJob = async () => {
  const now = new Date();
  const targetDayStart = new Date(now);
  targetDayStart.setHours(0, 0, 0, 0);
  targetDayStart.setDate(targetDayStart.getDate() - 9);

  const targetDayEnd = new Date(targetDayStart);
  targetDayEnd.setDate(targetDayEnd.getDate() + 1);

  try {
    const users = await Users.findAll({
      where: {
        isBlocked: null,
        createdAt: {
          [Op.gte]: targetDayStart,
          [Op.lt]: targetDayEnd,
        },
      } as any,
    });

    for (const user of users) {
      try {
        await sendFeedbackEmail(user.email);
      } catch (error: any) {
        console.error(
          `Failed to send feedback email to ${user.email}:`,
          error?.message ?? error
        );
      }
    }
  } catch (error: any) {
    console.error("Feedback email job failed:", error?.message ?? error);
  }
};

export const startFeedbackEmailJob = () => {
  if (feedbackEmailTimeout) {
    return;
  }

  const scheduleNextRun = () => {
    const delay = getNextRunDelay();

    feedbackEmailTimeout = setTimeout(async () => {
      await runFeedbackEmailJob();
      scheduleNextRun();
    }, delay);
  };

  scheduleNextRun();
};
