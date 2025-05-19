import React from "react";


const Footer: React.FC = () => {
  return (
    <footer className="bg-purple-950 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">
              Election Commission of Sri Lanka
            </h3>
            <p className="text-gray-300 text-sm">
              Official Election Results Portal
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <a
              href="/privacy-policy"
              className="text-gray-300 hover:text-white transition duration-300"
            >
              Privacy Policy
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
          <p>© 2025 Election Commission of Sri Lanka. All rights reserved.</p>
          <p className="mt-2">
            Current Date: May 18, 2025 | Time: 09:46 AM +0530
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
