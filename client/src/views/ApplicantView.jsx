import React, { useState, useEffect } from 'react';
import '../styles/Applicant.css';  

const ApplicantForm = ({ onSubmit, competences, onError }) => {
  const [user, setUser] = useState(null);  
  const [selectedCompetence, setSelectedCompetence] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAddExpertise = () => {
    if (!selectedCompetence || !yearsOfExperience) {
      return onError('Please select a competence and years of experience.');
    }
    setExpertise([
      ...expertise,
      { competence_id: selectedCompetence, years_of_experience: yearsOfExperience },
    ]);
    setYearsOfExperience('');
  };

  const handleAddAvailability = () => {
    if (!fromDate || !toDate) {
      return onError('Please provide both start and end dates.');
    }
    setAvailability([...availability, { from_date: fromDate, to_date: toDate }]);
    setFromDate('');
    setToDate('');
  };

  const handleSubmit = () => {
    if (user) {
      const { person_id } = user;  
      console.log(person_id);
      onSubmit(person_id, expertise, availability);  
    } else {
      onError('User not found');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="applicant-container">
      <div className="applicant-box">
        <h2 className="applicant-header">Job Application</h2>

        <h3>Hello, {user.username}!</h3>

        <div className="expertise-section">
          <h3 className="applicant-title">Select Area of Expertise</h3>
          <div className="applicant-input-group">
            <select
              className="expertise-dropdown"
              onChange={(e) => setSelectedCompetence(e.target.value)}
            >
              <option value="">Select Expertise</option>
              {competences.map((competence) => (
                <option key={competence.competence_id} value={competence.competence_id}>
                  {competence.name}
                </option>
              ))}
            </select>

            <input
              className="expertise-dropdown"
              type="number"
              placeholder="Years of Experience"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
            />
            <button className="submit-button" onClick={handleAddExpertise}>
              Add Expertise
            </button>
          </div>
        </div>

        <div className="expertise-list">
          <h3>Your Expertise</h3>
          <ul>
            {expertise.map((expert, idx) => {
              const competence = competences.map((competence) => {
                console.log(competence.competence_id);
                console.log(expert.competence_id);
                if (competence.competence_id == expert.competence_id) {
                  console.log(competence.name);
                  return competence.name;
                }
                return null; 
              }).filter(name => name !== null);
              return (
                <li key={idx}>
                  {competence.length > 0 ? competence[0] : 'Competence not found'}: {expert.years_of_experience} years
                </li>
              );
            })}
          </ul>

        </div>

        <div className="availability-section">
          <h3 className="applicant-title">Select Availability</h3>
          <div className="applicant-input-group">
            <input
              className="expertise-dropdown"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              className="expertise-dropdown"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button className="submit-button" onClick={handleAddAvailability}>
              Add Availability
            </button>
          </div>
        </div>

        <div className="availability-list">
          <h3>Your Availability</h3>
          <ul>
            {availability.map((period, idx) => (
              <li key={idx}>
                From: {period.from_date}, To: {period.to_date}
              </li>
            ))}
          </ul>
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Submit Application
        </button>
        <button className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ApplicantForm;
