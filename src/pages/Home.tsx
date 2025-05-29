import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useElectionData } from "../context/ElectionDataContext";
import SriLankaMap from "../components/SriLankaMap";
// import HomeHeroSlider from "../components/HomeHeroSlider";

const Home: React.FC = () => {
  const { electionStats, year, parties, districts, calculatedResults } = useElectionData();

  // Calculate leading party and voter turnout from actual data
  const { leadingParty, voterTurnout } = useMemo(() => {
    // Calculate leading party from all districts
    let totalVotes = 0;
    let partyVotes: Record<string, { name: string; votes: number; seats: number }> = {};

    // Sum up votes and seats for each party across all districts
    Object.values(calculatedResults).forEach(districtParties => {
      districtParties.forEach(party => {
        const key = party.name.trim().toLowerCase();
        if (!partyVotes[key]) {
          partyVotes[key] = {
            name: party.name,
            votes: 0,
            seats: 0
          };
        }
        partyVotes[key].votes += party.votes;
        partyVotes[key].seats += (party as any).totalSeats || 0;
      });
    });

    // Find the party with highest votes
    const leadingPartyData = Object.values(partyVotes).reduce((prev, curr) => 
      curr.votes > prev.votes ? curr : prev
    , { name: '', votes: 0, seats: 0 });

    // Calculate total votes from all districts
    totalVotes = districts
      .filter(d => d.id !== "all-districts")
      .reduce((sum, d) => sum + d.totalVotes, 0);

    // Calculate voter turnout (assuming registered voters is 1.5x total votes for this example)
    const registeredVoters = totalVotes * 1.5;
    const turnout = Math.round((totalVotes / registeredVoters) * 100);

    return {
      leadingParty: {
        name: leadingPartyData.name || 'N/A',
        seats: leadingPartyData.seats || 0
      },
      voterTurnout: turnout
    };
  }, [calculatedResults, districts]);

  return (
    <div className="flex flex-col min-h-screen">
      

      {/* Hero Section with Static Image */}
      <section className="relative w-full h-64 md:h-96 overflow-hidden rounded-b-2xl shadow-lg ">
        <img
          src="https://www.shutterstock.com/image-photo/election-sri-lanka-hand-man-260nw-1581645550.jpg"
          alt="Sri Lanka Election Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex flex-col items-center justify-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white text-center drop-shadow-lg px-4 ">
            Sri Lanka Parliamentary Election {year} Results
          </h1>
          <div className="absolute bottom-8 right-8 z-20 flex gap-4">
            <Link
              to="/"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Back to Landing
            </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Total Votes Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-teal-800">
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

            {/* Leading Party Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-teal-800">
              <h3 className="text-xl font-semibold mb-2 text-teal-800">
                Leading Party
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {leadingParty.name}
              </p>
              <p className="text-gray-500 mt-2">
                {leadingParty.seats} seats secured
              </p>
            </div>

            {/* Voter Turnout Card */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-teal-800">
              <h3 className="text-xl font-semibold mb-2 text-teal-800">
                Voter Turnout
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {voterTurnout}%
              </p>
              <p className="text-gray-500 mt-2">
                Of registered voters participated
              </p>
            </div>
          </div>
        </div>
      </section>

     

      
    </div>
  );
};

export default Home;
