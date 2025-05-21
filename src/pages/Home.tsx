import React from "react";
import { Link } from "react-router-dom";
import { useElectionData } from "../context/ElectionDataContext";
// import HomeHeroSlider from "../components/HomeHeroSlider";

const Home: React.FC = () => {
  const { electionStats } = useElectionData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Static Image */}
      <section className="relative w-full h-64 md:h-96 overflow-hidden rounded-b-2xl shadow-lg">
        <img
          src="https://www.shutterstock.com/image-photo/election-sri-lanka-hand-man-260nw-1581645550.jpg"
          alt="Sri Lanka Election Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex flex-col items-center justify-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white text-center drop-shadow-lg px-4 ">
            Sri Lanka Parliamentary Election 2025 Results
          </h1>
          <div className="absolute bottom-8 right-8 z-20">
            <Link
              to="/results"
              className="inline-block bg-teal-800 hover:bg-teal-900 text-white font-medium py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              View Results
            </Link>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
            Election Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Votes Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-teal-800  ">
              <h3 className="text-xl font-semibold mb-2 text-teal-800">
                Total Votes
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {electionStats.totalVotes.toLocaleString()}
              </p>
              <p className="text-gray-500 mt-2">
                Cast across 22 electoral districts
              </p>
            </div>

            {/* Total Seats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-teal-800">
              <h3 className="text-xl font-semibold mb-2 text-teal-800">
                Total Seats
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {electionStats.totalSeats}
              </p>
              <p className="text-gray-500 mt-2">Parliament seats allocated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
            Quick Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              to="/results"
              className="group block bg-teal-50 rounded-lg p-6 hover:bg-teal-100 transition duration-300 "
            >
              <h3 className="text-xl font-semibold mb-3 text-teal-800 group-hover:text-teal-900">
                View Election Results
              </h3>
              <p className="text-gray-700">
                Explore detailed election results including vote counts, seat
                allocations, and bonus seats for all 22 electoral districts.
              </p>
            </Link>

            <Link
              to="/admin"
              className="group block bg-teal-50 rounded-lg p-6 hover:bg-teal-100 transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-teal-800 group-hover:text-teal-900">
                Admin Panel
              </h3>
              <p className="text-gray-700">
                Manage parties and votes data through the administrative
                interface.
              </p>
            </Link>

            <Link
              to="/about"
              className="group block bg-teal-50 rounded-lg p-6 hover:bg-teal-100 transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-teal-800 group-hover:text-teal-900">
                About the Election
              </h3>
              <p className="text-gray-700">
                Learn about the Sri Lanka Parliamentary Election 2025, voting
                process, and seat allocation methodology.
              </p>
            </Link>

            <Link
              to="/contact"
              className="group block bg-teal-50 rounded-lg p-6 hover:bg-teal-100 transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-teal-800 group-hover:text-teal-900">
                Contact Information
              </h3>
              <p className="text-gray-700">
                Get in touch with the Election Commission of Sri Lanka for
                inquiries and information.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
