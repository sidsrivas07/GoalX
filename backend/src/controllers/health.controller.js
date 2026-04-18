/**
 * Health Controller
 *
 * Simple health-check endpoint to verify the server is running.
 */
import ApiResponse from '../utils/ApiResponse.js';

export const getHealth = (_req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'OK',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    }, 'GoalX API is running')
  );
};
