const applicantDAO = require('../integration/ApplicantDAO'); 

/**
 * Fetches all competences (areas of expertise) from the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCompetences = async (req, res) => {
  try {
    const competences = await applicantDAO.getCompetences();

    if (competences.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No competences found',
      });
    }

    res.status(200).json({
      success: true,
      competences,
    });
  } catch (err) {
    console.error('Error fetching competences:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Submits the applicant's application data (expertise and availability).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const submitApplication = async (req, res) => {
  const { userId, expertise, availability } = req.body;

  if (!userId || !expertise || !availability) {
    return res.status(400).json({
      success: false,
      message: 'userId, expertise, and availability are required',
    });
  }

  try {
    await applicantDAO.submitApplication(userId, expertise, availability);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = { getCompetences, submitApplication };
