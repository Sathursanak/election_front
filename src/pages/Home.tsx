import React from "react";
import { Link } from "react-router-dom";
import { useElectionData } from "../context/ElectionDataContext";

const Home: React.FC = () => {
  const { electionStats } = useElectionData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-purple-900 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Sri Lanka Parliamentary Election 2025 Results
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8">
              Vote counts and seat allocations by district
            </p>
            <Link
              to="/results"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Votes Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-2 text-purple-800">
                Total Votes
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {electionStats.totalVotes.toLocaleString()}
              </p>
              <p className="text-gray-500 mt-2">
                Cast across 23 electoral districts
              </p>
            </div>

            {/* Total Seats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-2 text-purple-800">
                Total Seats
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {electionStats.totalSeats}
              </p>
              <p className="text-gray-500 mt-2">Parliament seats allocated</p>
            </div>

            {/* Participating Parties Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-2 text-purple-800">
                Participating Parties
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {electionStats.participatingParties}
              </p>
              <p className="text-gray-500 mt-2">Contested in the election</p>
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
              className="group block bg-purple-50 rounded-lg p-6 hover:bg-purple-100 transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-purple-800 group-hover:text-purple-900">
                View Election Results
              </h3>
              <p className="text-gray-700">
                Explore detailed election results including vote counts, seat
                allocations, and bonus seats for all 23 electoral districts.
              </p>
            </Link>

            <Link
              to="/admin"
              className="group block bg-purple-50 rounded-lg p-6 hover:bg-purple-100 transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-purple-800 group-hover:text-purple-900">
                Admin Panel
              </h3>
              <p className="text-gray-700">
                Manage parties and votes data through the administrative
                interface.
              </p>
            </Link>

            <Link
              to="/about"
              className="group block bg-purple-50 rounded-lg p-6 hover:bg-purple-100 transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-purple-800 group-hover:text-purple-900">
                About the Election
              </h3>
              <p className="text-gray-700">
                Learn about the Sri Lanka Parliamentary Election 2025, voting
                process, and seat allocation methodology.
              </p>
            </Link>

            <Link
              to="/contact"
              className="group block bg-purple-50 rounded-lg p-6 hover:bg-purple-100 transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-purple-800 group-hover:text-purple-900">
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
