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

/**
 * Updates the status of an application.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateApplication = async (req, res) => {
  const { application_id, status, lastUpdated } = req.body;

  if (!application_id || !status || !lastUpdated) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields.',
    });
  }

  try {
    const result = await recruiterDAO.updateApplication(application_id, status, lastUpdated);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(409).json(result); 
    }
  } catch (err) {
    console.error('Error in updating application status:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = { getApplications, updateApplication };
