"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp } from "lucide-react"

interface Player {
  id: string
  playername: string
  votes: number
  position: number
}

export default function Component() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    const fetchVoterRankings = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://api.top-serveurs.net/v1/servers/TEST_SERVER/players-ranking")

        if (!response.ok) {
          throw new Error("Failed to fetch voter rankings")
        }

        const data = await response.json()
        console.log("API Response:", data) // Debug log

        // Handle different possible response structures
        let playersData: Player[] = []
        if (data.players && Array.isArray(data.players)) {
          playersData = data.players
        } else if (Array.isArray(data)) {
          playersData = data
        } else if (data.data && Array.isArray(data.data)) {
          playersData = data.data
        } else {
          console.error("Unexpected response format:", data)
          throw new Error("Unexpected response format")
        }

        // Ensure each player has required fields
        const processedPlayers = playersData.map((player: Player, index: number) => ({
          id: `player-${index}`,
          playername: player.playername || `Player ${index + 1}`,
          votes: player.votes || 0,
          position: index + 1,
        }))

        setPlayers(processedPlayers)
        setTotalVotes(processedPlayers.reduce((sum, player) => sum + player.votes, 0))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchVoterRankings()
  }, [])

  const getRankBadgeVariant = (position: number) => {
    switch (position) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              Top Voters
            </CardTitle>
            <CardDescription>Loading voter rankings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Users className="w-6 h-6" />
              Error Loading Voter Rankings
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Top Voters Leaderboard
          </CardTitle>
          <CardDescription className="flex items-center gap-4">
            <span>Server voting rankings</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {totalVotes} total votes
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {players.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No voter data available</div>
            ) : (
              players.map((player, index) => {
                const position = index + 1
                return (
                  <div
                    key={player.id || player.playername}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                      position <= 3 ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{player.playername}</h3>
                        {position <= 3 && (
                          <Badge variant={getRankBadgeVariant(position)} className="text-xs">
                            {position === 1 ? "Champion" : position === 2 ? "Runner-up" : "Third Place"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Rank #{position}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">{player.votes}</div>
                      <div className="text-xs text-muted-foreground">{player.votes === 1 ? "vote" : "votes"}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
