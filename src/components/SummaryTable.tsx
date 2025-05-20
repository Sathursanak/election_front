import React from 'react';
import { District } from '../types';

interface SummaryTableProps {
  district: District;
  parties: { id: string; name: string }[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ district, parties }) => {
  const bonusSeatParty = parties.find(party => party.id === district.bonusSeatPartyId);

  return (
    <div className="overflow-x-auto shadow-md rounded-lg bg-white border-2 border-teal-500">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              District
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Votes
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rejected Votes
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valid Votes
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seats Allocated
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bonus Seats
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bonus Seat Party
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {district.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {district.totalVotes.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {district.rejectedVotes.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {district.validVotes.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {district.seats}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {district.bonusSeats}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {bonusSeatParty ? (
                <span className="px-2 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  {bonusSeatParty.name}
                </span>
              ) : (
                <span className="text-sm text-gray-500">-</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;