import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaUsers, FaBriefcase, FaEye, FaUserShield, FaGlobe, FaUserFriends, FaArrowLeft } from 'react-icons/fa';
import ProfessionalCard from '../SmartProfilePanel/ProfessionalCard';
import { useNavigate } from 'react-router-dom';

/**
 * TalentDirectory - A recruitment-focused directory of professional profiles
 *
 * Features:
 * - Grid of professional profile cards
 * - Search and filter functionality
 * - Perfect for recruiters and startup founders
 * - Click "View Profile" to see full professional details
 */
const TalentDirectory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');
  const [userType, setUserType] = useState('public'); // 'public', 'recruiter', 'friend'

  // Mock data - in real app, this would come from your database
  const mockTalents = [
    {
      uid: 'talent_alex_chen_001',
      displayName: 'Alex Chen',
      email: 'alex.chen@example.com',
      photoURL: null,
      location: 'San Francisco, CA',
      professional: {
        role: 'Full Stack Developer',
        industry: 'Technology',
        bio: 'Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'GraphQL', 'Docker', 'Kubernetes'],
        jobSkills: 'Expert in modern web development with React and Node.js. Strong experience with cloud deployment, microservices architecture, and agile development practices.',
        activities: 'Open source contributor, tech meetup organizer, mentor for coding bootcamp students.',
        links: {
          github: 'https://github.com/alexchen',
          linkedin: 'https://linkedin.com/in/alexchen',
          portfolio: 'https://alexchen.dev',
          resume: 'https://alexchen.dev/resume.pdf'
        }
      },
      visibility: 'public'
    },
    {
      uid: 'talent_sarah_johnson_002',
      displayName: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      photoURL: null,
      location: 'New York, NY',
      professional: {
        role: 'UX/UI Designer',
        industry: 'Design',
        bio: 'Creative UX/UI designer with a passion for creating intuitive and beautiful user experiences. 4+ years of experience in product design.',
        skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems', 'HTML/CSS'],
        jobSkills: 'Specialized in user-centered design, prototyping, and design systems. Experience with both B2B and B2C products.',
        activities: 'Design community leader, workshop facilitator, freelance designer for non-profits.',
        links: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          portfolio: 'https://sarahjohnson.design'
        }
      },
      visibility: 'recruiters'
    },
    {
      uid: 'talent_michael_rodriguez_003',
      displayName: 'Michael Rodriguez',
      email: 'michael.rodriguez@example.com',
      photoURL: 'https://i.pravatar.cc/300?img=3',
      location: 'Austin, TX',
      professional: {
        role: 'Data Scientist',
        industry: 'Technology',
        bio: 'Data scientist with expertise in machine learning and AI. PhD in Computer Science with focus on natural language processing.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'R', 'Machine Learning', 'Deep Learning', 'NLP'],
        jobSkills: 'Expert in machine learning model development, data analysis, and AI implementation. Strong background in statistical analysis and research.',
        activities: 'AI research publications, kaggle competitions, university guest lecturer.',
        links: {
          github: 'https://github.com/mrodriguez',
          linkedin: 'https://linkedin.com/in/michaelrodriguez'
        }
      },
      visibility: 'friends'
    },
    {
      uid: 'talent_emily_davis_004',
      displayName: 'Emily Davis',
      email: 'emily.davis@example.com',
      photoURL: null,
      location: 'Seattle, WA',
      professional: {
        role: 'Product Manager',
        industry: 'Technology',
        bio: 'Strategic product manager with 6+ years of experience leading cross-functional teams to deliver innovative products.',
        skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis', 'Roadmapping', 'Stakeholder Management'],
        jobSkills: 'Expert in product lifecycle management, user research, and data-driven decision making. Strong background in B2B SaaS products.',
        activities: 'Product management mentor, startup advisor, women in tech advocate.',
        links: {
          linkedin: 'https://linkedin.com/in/emilydavis',
          portfolio: 'https://emilydavis.pm'
        }
      },
      visibility: 'public'
    },
    {
      uid: 'talent_david_kim_005',
      displayName: 'David Kim',
      email: 'david.kim@example.com',
      photoURL: null,
      location: 'Boston, MA',
      professional: {
        role: 'DevOps Engineer',
        industry: 'Technology',
        bio: 'DevOps engineer specializing in cloud infrastructure and automation. 4+ years of experience with AWS and Kubernetes.',
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Python', 'Linux', 'Monitoring'],
        jobSkills: 'Specialized in cloud infrastructure automation, CI/CD pipelines, and system reliability. AWS certified solutions architect.',
        activities: 'Cloud computing blogger, DevOps community organizer, open source contributor.',
        links: {
          github: 'https://github.com/davidkim',
          linkedin: 'https://linkedin.com/in/davidkim'
        }
      },
      visibility: 'recruiters'
    }
  ];

  const industries = ['all', 'Technology', 'Design', 'Marketing', 'Finance', 'Healthcare'];
  const visibilityOptions = ['all', 'public', 'recruiters', 'friends'];

  // Function to check if user can view a profile based on visibility settings
  const canViewProfile = (talent) => {
    switch (talent.visibility) {
      case 'public':
        return true; // Everyone can see public profiles
      case 'recruiters':
        return userType === 'recruiter' || userType === 'friend'; // Recruiters and friends can see
      case 'friends':
        return userType === 'friend'; // Only friends can see
      default:
        return true;
    }
  };

  const filteredTalents = mockTalents.filter(talent => {
    const matchesSearch = talent.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.professional.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.professional.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIndustry = selectedIndustry === 'all' || talent.professional.industry === selectedIndustry;

    const matchesVisibility = selectedVisibility === 'all' || talent.visibility === selectedVisibility;

    const canView = canViewProfile(talent);

    return matchesSearch && matchesIndustry && matchesVisibility && canView;
  });

  const handleViewProfile = (talent) => {
    // In a real app, you might navigate to a dedicated profile page
    // For now, we'll navigate to the profile page
    navigate('/profile', { state: { viewUser: talent, viewMode: 'professional' } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white">
      <div className="max-w-7xl mx-auto py-10 px-4">
        {/* Header with Back Button */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <FaArrowLeft />
              <span>Back to Chat</span>
            </button>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
            Talent Directory
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Discover skilled professionals ready for their next opportunity. Connect with top talent across various industries.
          </p>

          {/* User Type Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-800 rounded-lg p-1 border border-gray-600">
              <button
                onClick={() => setUserType('public')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  userType === 'public'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FaGlobe className="inline mr-2" />
                Public User
              </button>
              <button
                onClick={() => setUserType('recruiter')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  userType === 'recruiter'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FaUserShield className="inline mr-2" />
                Recruiter
              </button>
              <button
                onClick={() => setUserType('friend')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  userType === 'friend'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FaUserFriends className="inline mr-2" />
                Friend
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            {userType === 'public' && 'Viewing as public user - only public profiles visible'}
            {userType === 'recruiter' && 'Viewing as recruiter - public and recruiter-only profiles visible'}
            {userType === 'friend' && 'Viewing as friend - all profiles visible'}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <FaEye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none"
              >
                {visibilityOptions.map(visibility => (
                  <option key={visibility} value={visibility}>
                    {visibility === 'all' ? 'All Visibility' :
                     visibility === 'public' ? 'Public Only' :
                     visibility === 'recruiters' ? 'Recruiters Only' :
                     'Friends Only'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-2">
            <FaUsers className="text-purple-400" />
            <span className="text-gray-300">
              {filteredTalents.length} professional{filteredTalents.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaBriefcase className="text-blue-400" />
            <span className="text-gray-300">Ready for opportunities</span>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTalents.map((talent, index) => (
            <motion.div
              key={talent.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ProfessionalCard
                user={talent}
                onViewProfile={() => handleViewProfile(talent)}
                className="h-full"
              />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTalents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No professionals found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30">
          <h3 className="text-2xl font-bold text-white mb-4">Looking to join our talent directory?</h3>
          <p className="text-gray-300 mb-6">Create your professional profile and get discovered by top companies and startups.</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300"
          >
            Create Your Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentDirectory;
