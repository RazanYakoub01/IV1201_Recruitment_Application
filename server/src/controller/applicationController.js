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

  if (!userId || typeof userId !== 'number' || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid userId. It must be a positive number.',
    });
  }

  if (!Array.isArray(expertise) || expertise.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Expertise must be a non-empty array.',
    });
  }

  for (const item of expertise) {
    if (
      !item.competence_id ||
      typeof item.competence_id !== 'number' ||
      item.competence_id <= 0 ||
      !item.years_of_experience ||
      typeof item.years_of_experience !== 'number' ||
      item.years_of_experience < 0 ||
      item.years_of_experience > 99
    ) {
      return res.status(400).json({
        success: false,
        message: 'Each expertise item must have a valid competence_id and years_of_experience (0-99).',
      });
    }
  }

  if (!Array.isArray(availability) || availability.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Availability must be a non-empty array.',
    });
  }

  const today = new Date();

  for (const period of availability) {
    if (!period.from_date || !period.to_date) {
      return res.status(400).json({
        success: false,
        message: 'Each availability period must have a from_date and to_date.',
      });
    }

    const fromDate = new Date(period.from_date);
    const toDate = new Date(period.to_date);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please provide valid dates.',
      });
    }

    if (fromDate < today || toDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Dates cannot be in the past.',
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: 'from_date cannot be later than to_date.',
      });
    }
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