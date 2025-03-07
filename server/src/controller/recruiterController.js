const recruiterDAO = require('../integration/RecruiterDAO');

/**
 * Fetches all applications for recruiters.
 * Requires recruiter role authentication.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getApplications = async (req, res) => {
  try {
    console.log('Applications accessed by recruiter:', {
      recruiterId: req.user.personId,
      timestamp: new Date().toISOString()
    });

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
 * Requires recruiter role authentication.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateApplication = async (req, res) => {
  const { application_id, status, lastUpdated } = req.body;

  console.log('Application status update attempt:', {
    recruiterId: req.user.personId,
    applicationId: application_id,
    newStatus: status,
    timestamp: new Date().toISOString()
  });

  if (!application_id || typeof application_id !== 'number' || application_id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application_id. It must be a positive number.',
    });
  }

  const validStatuses = ['unhandled', 'accepted', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
    });
  }

  if (!lastUpdated || isNaN(Date.parse(lastUpdated))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lastUpdated. It must be a valid date string.',
    });
  }

  const lastUpdatedDate = new Date(lastUpdated);
  const now = new Date();

  if (lastUpdatedDate > now) {
    return res.status(400).json({
      success: false,
      message: 'lastUpdated cannot be a future date.',
    });
  }

  try {
    const result = await recruiterDAO.updateApplication(
      application_id, 
      status, 
      lastUpdated,
      req.user.personId
    );

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