import { Op } from "sequelize";
import Users from "../../models/Users";
import { sendCommunityEmail } from "../../configs/email/emailConfig";

const TARGET_HOUR = 8;

let communityEmailTimeout: NodeJS.Timeout | null = null;

const getNextRunDelay = () => {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(TARGET_HOUR, 0, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime() - now.getTime();
};

export const runCommunityEmailJob = async () => {
  const now = new Date();
  const targetDayStart = new Date(now);
  targetDayStart.setHours(0, 0, 0, 0);
  targetDayStart.setDate(targetDayStart.getDate() - 69);

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
        await sendCommunityEmail(user.email);
      } catch (error: any) {
        console.error(
          `Failed to send community email to ${user.email}:`,
          error?.message ?? error
        );
      }
    }
  } catch (error: any) {
    console.error("Community email job failed:", error?.message ?? error);
  }
};

export const startCommunityEmailJob = () => {
  if (communityEmailTimeout) {
    return;
  }

  const scheduleNextRun = () => {
    const delay = getNextRunDelay();

    communityEmailTimeout = setTimeout(async () => {
      await runCommunityEmailJob();
      scheduleNextRun();
    }, delay);
  };

  scheduleNextRun();
};
