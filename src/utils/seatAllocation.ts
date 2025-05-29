export interface Party {
  id: string;
  name: string;
  votes: number;
  logoData?: string;
  districtId: string;
  percentage?: number;
  seats?: number;
  hasBonusSeat?: boolean;
}

export function allocateSeats(parties: Party[], totalSeats: number): Party[] {
  // 1. Calculate total valid votes
  const totalValidVotes = parties.reduce((sum, p) => sum + p.votes, 0);

  // 2. Determine minimum votes to qualify
  const minVotesToQualify = Math.floor(totalValidVotes * 0.05);

  // 3. Filter out disqualified parties
  const qualified = parties.map((p) => p.votes >= minVotesToQualify);
  const qualifiedParties = parties.filter((_, i) => qualified[i]);
  const disqualifiedParties = parties.filter((_, i) => !qualified[i]);
  const disqualifiedVotes = disqualifiedParties.reduce(
    (sum, p) => sum + p.votes,
    0
  );

  // 4. Only use qualified votes for seat allocation
  const seatsValidVotes = totalValidVotes - disqualifiedVotes;

  // 5. Bonus seat allocation
  const maxVotes = Math.max(...qualifiedParties.map((p) => p.votes));
  const bonusSeatPartyIds = qualifiedParties
    .filter((p) => p.votes === maxVotes && maxVotes > 0)
    .map((p) => p.id);
  let seatsLeft = totalSeats - bonusSeatPartyIds.length;
  const seatAlloc: Record<string, number> = {};
  qualifiedParties.forEach((p) => (seatAlloc[p.id] = 0));
  bonusSeatPartyIds.forEach((id) => {
    seatAlloc[id] += 1;
  });

  // 6. First round seat allocation
  const votesPerSeat =
    seatsLeft > 0 ? Math.floor(seatsValidVotes / seatsLeft) : 0;
  const partyVotes: Record<string, number> = {};
  qualifiedParties.forEach((p) => (partyVotes[p.id] = p.votes));
  let changed = true;
  while (changed && seatsLeft > 0) {
    changed = false;
    qualifiedParties.forEach((p) => {
      while (partyVotes[p.id] >= votesPerSeat && seatsLeft > 0) {
        partyVotes[p.id] -= votesPerSeat;
        seatAlloc[p.id] += 1;
        seatsLeft -= 1;
        changed = true;
      }
    });
  }

  // 7. Second round seat allocation (by highest remaining votes)
  const sorted = [...qualifiedParties].sort(
    (a, b) => partyVotes[b.id] - partyVotes[a.id]
  );
  let i = 0;
  while (seatsLeft > 0 && sorted.length > 0) {
    seatAlloc[sorted[i % sorted.length].id] += 1;
    seatsLeft -= 1;
    i++;
  }

  // 8. Compose result for all parties
  return parties.map((p) => ({
    ...p,
    percentage: totalValidVotes > 0 ? (p.votes / totalValidVotes) * 100 : 0,
    seats: seatAlloc[p.id] || 0,
    hasBonusSeat: bonusSeatPartyIds.includes(p.id),
  }));
}
