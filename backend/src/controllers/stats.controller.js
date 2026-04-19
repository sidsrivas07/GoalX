import prisma from '../utils/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/stats/streak
 * Calculates current completion streak for the user.
 * A streak is the number of consecutive days going back from today 
 * where at least one task was completed.
 */
export const getStreak = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let streak = 0;
  let checkDate = new Date();
  
  // Set to local midnight for consistent comparison
  checkDate.setHours(0, 0, 0, 0);

  // We loop backwards up to 365 days to find the streak
  for (let i = 0; i < 365; i++) {
    const currentDay = new Date(checkDate);
    currentDay.setDate(checkDate.getDate() - i);
    
    // Check if there was at least one completed task on this specific day
    // We filter by date range [start of day, end of day]
    const nextDay = new Date(currentDay);
    nextDay.setDate(currentDay.getDate() + 1);

    const completedOnDay = await prisma.task.findFirst({
      where: {
        categoryId: {
          in: (await prisma.category.findMany({ where: { userId }, select: { id: true } })).map(c => c.id)
        },
        completed: true,
        date: {
          gte: currentDay,
          lt: nextDay
        }
      }
    });

    if (completedOnDay) {
      streak++;
    } else {
      // If we haven't completed anything today yet, we DON'T break the streak immediately
      // unless it's a PAST day. This allows you to keep your streak alive while working today.
      if (i > 0) {
        break; 
      }
      
      // If i == 0 (today) and nothing is done, we check if yesterday was done.
      // If yesterday was done, streak stays at current count (0 + loop continues).
      // If yesterday was NOT done, it will break on next iteration.
    }
  }

  res.status(200).json(
    new ApiResponse(200, { streak }, "Streak calculated successfully")
  );
});
