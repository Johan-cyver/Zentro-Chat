// Age-related utility functions for Zentro

/**
 * Calculate age from birth date
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};


// Professional directory is now open to all ages (no restriction)
export const isProfessionalEligible = (birthDate) => true;

export const getProfessionalEligibilityDate = (birthDate) => null;

/**
 * Get user's current age from localStorage
 * @returns {number} Current age or 0 if not found
 */
export const getCurrentUserAge = () => {
  const birthDate = localStorage.getItem('zentro_user_birthDate');
  return birthDate ? calculateAge(birthDate) : 0;
};


// Always true now
export const isCurrentUserProfessionalEligible = () => true;


// No restriction message needed
export const getProfessionalRestrictionMessage = (birthDate) => '';
