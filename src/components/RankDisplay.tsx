export function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-brand font-bold">#1</span>
  if (rank === 2) return <span className="text-gray-300 font-bold">#2</span>
  if (rank === 3) return <span className="text-yellow-600 font-bold">#3</span>
  return <span className="text-gray-600">{rank}.</span>
}
