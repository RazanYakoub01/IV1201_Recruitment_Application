const applicantDAO = require('../integration/ApplicantDAO'); 

/**
 * Fetches all competences (areas of expertise) from the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCompetences = async (req, res) => {
  try {
    console.log('Competences accessed by:', {
      userId: req.user ? req.user.personId : 'Unauthenticated',
      timestamp: new Date().toISOString()
    });

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
  console.log('1. Initial request data:', {
    userId: userId,
    expertiseCount: expertise?.length || 0,
    availabilityCount: availability?.length || 0,
  });

  // Verify that the authenticated user is the same as the userId in the request
  // This ensures users can only submit applications for themselves
  if (req.user.personId !== userId) {
    console.log('Unauthorized application submission attempt:', { 
      tokenUserId: req.user.personId, 
      requestedUserId: userId 
    });
    return res.status(403).json({
      success: false,
      message: 'Unauthorized. You can only submit applications for yourself.',
    });
  }

  if (!userId || typeof userId !== 'number' || userId <= 0) {
    console.log('2. Failed at userId validation:', { userId });
    return res.status(400).json({
      success: false,
      message: 'Invalid userId. It must be a positive number.',
    });
  }

  if (!Array.isArray(expertise) || expertise.length === 0) {
    console.log('3. Failed at expertise array validation:', { expertise });
    return res.status(400).json({
      success: false,
      message: 'Expertise must be a non-empty array.',
    });
  }

  for (const item of expertise) {
    console.log('4. Checking expertise item:', item);
    const competenceId = Number(item.competence_id);
    const yearsExperience = Number(item.years_of_experience);

    if (
      isNaN(competenceId) || 
      competenceId <= 0 ||
      isNaN(yearsExperience) ||
      yearsExperience < 0 ||
      yearsExperience > 99
    ) {
      console.log('5. Failed at expertise item validation:', item);
      return res.status(400).json({
        success: false,
        message: 'Each expertise item must have a valid competence_id and years_of_experience (0-99).',
      });
    }
  }

  if (!Array.isArray(availability) || availability.length === 0) {
    console.log('6. Failed at availability array validation:', { availability });
    return res.status(400).json({
      success: false,
      message: 'Availability must be a non-empty array.',
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  for (const period of availability) {
    console.log('7. Checking availability period:', period);
    if (!period.from_date || !period.to_date) {
      console.log('8. Failed at date existence check:', period);
      return res.status(400).json({
        success: false,
        message: 'Each availability period must have a from_date and to_date.',
      });
    }

    const fromDate = new Date(period.from_date);
    fromDate.setHours(0, 0, 0, 0); 
    const toDate = new Date(period.to_date);
    toDate.setHours(0, 0, 0, 0);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      console.log('9. Failed at date format check:', { fromDate, toDate });
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please provide valid dates.',
      });
    }

    if (fromDate < today) {
      console.log('10. Failed at past date check:', { fromDate, today });
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past.',
      });
    }

    if (fromDate > toDate) {
      console.log('11. Failed at date order check:', { fromDate, toDate });
      return res.status(400).json({
        success: false,
        message: 'from_date cannot be later than to_date.',
      });
    }
  }

  console.log('12. Passed all validations, attempting to submit');
  try {
    console.log('Submitting application:', {
      userId: userId,
      expertiseCount: expertise?.length || 0,
      availabilityCount: availability?.length || 0,
      timestamp: new Date().toISOString()
    });
    await applicantDAO.submitApplication(userId, expertise, availability);
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
    });
    console.log('Submited application successfully', {
      userId: userId,
      expertiseCount: expertise?.length || 0,
      availabilityCount: availability?.length || 0,
      timestamp: new Date().toISOString()
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