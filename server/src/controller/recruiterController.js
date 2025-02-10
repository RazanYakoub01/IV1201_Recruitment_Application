const recruiterDAO = require('../integration/RecruiterDAO');

/**
 * Fetches all applications for recruiters.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getApplications = async (req, res) => {
  try {
    const applications = await recruiterDAO.getApplications();

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No applications found',
      });
    }

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = { getApplications };
