import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType: 'admin' | 'normal') => {
    // Store user type in localStorage
    localStorage.setItem('userType', userType);
    
    if (userType === 'admin') {
      navigate('/home');
    } else {
      navigate('/home');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: 'url("https://media.istockphoto.com/id/1936277487/vector/sri-lanka-waving-flag-concept-background-design-with-sunset-view-on-the-hill-vector.jpg?s=612x612&w=0&k=20&c=Lmv909lJTIrbCaTAaQUc0GD3yyqU1po7aqto2lc1fO4=")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 text-center">
        <img 
          src="https://static.vecteezy.com/system/resources/thumbnails/020/244/539/small/map-pointer-with-contry-sri-lanka-sri-lanka-flag-illustration-vector.jpg"
          alt="Sri Lanka Logo"
          className="w-48 h-48 mx-auto mb-8 rounded-full shadow-lg"
        />
        
        <h1 className="text-4xl font-bold text-white mb-12">
          Sri Lanka Election System
        </h1>

        <div className="space-y-6">
          <button
            onClick={() => handleUserTypeSelect('admin')}
            className="w-64 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-lg"
          >
            Admin User
          </button>
          
          <div className="block">
            <button
              onClick={() => handleUserTypeSelect('normal')}
              className="w-64 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-lg"
            >
              Normal User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 