'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ParticipantDetail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')

  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!email) {
      setError('No participant email provided')
      setLoading(false)
      return
    }

    const fetchParticipant = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch data')
        
        const result = await response.json()
        const data = result.data || result
        
        // Find participant by email
        const found = data.find(p => p['User Email'] === decodeURIComponent(email))
        
        if (!found) {
          setError('Participant not found')
        } else {
          setParticipant(found)
        }
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchParticipant()
  }, [email])

  // Parse pipe-separated badges/games
  const parseBadges = (badgeString) => {
    if (!badgeString || badgeString.trim() === '') return []
    return badgeString.split('|').map(b => b.trim()).filter(b => b.length > 0)
  }

  const skillBadges = participant ? parseBadges(participant['Names of Completed Skill Badges']) : []
  const arcadeGames = participant ? parseBadges(participant['Names of Completed Arcade Games']) : []

  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading participant details...</p>
        </div>
      </div>
    )
  }

  if (error || !participant) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error || 'Participant not found'}</p>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className='w-full shadow-md bg-white'>
        <div className="bg-gray-900 text-blue-500 w-full m-auto text-center p-2 flex justify-center items-center">
          <div className=""><Image src="/assets/cloudLg.png" alt="cloud" width="40" height="40" /></div>
          <p className=''>Google Cloud Study Jams 25 - 26</p>
        </div>
        <div className="p-3 flex mob:flex-col m-auto max-w-6xl justify-between items-center">
          <div className="logo mob:border-b mob:border-b-gray-200 flex justify-center items-center">
            <div className="img">
              <Image src="/assets/GDGOC-CMRIT.png" alt="Google Developer Groups On Campus CMR Institute of Technology" width="300" height="300" />
            </div>
          </div>
          <div className="links mob:py-3">
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 mob:p-3">
        {/* Participant Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mob:flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-gray-800 uppercase">
                  {participant['User Name']}
                </h1>
                {participant['All Skill Badges & Games Completed'] === 'Yes' && (
                  <span className="text-4xl">🏅</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Email</span>
                  <span className="text-base text-gray-800">{participant['User Email']}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Profile URL</span>
                  {participant['Google Cloud Skills Boost Profile URL'] ? (
                    <a 
                      href={participant['Google Cloud Skills Boost Profile URL']} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-base text-blue-500 hover:underline break-all"
                    >
                      View Profile →
                    </a>
                  ) : (
                    <span className="text-base text-gray-400">Not Available</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Profile URL Status</span>
                  <span className={`w-fit px-3 py-1 rounded-full text-sm ${
                    participant['Profile URL Status'] === 'All Good' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {participant['Profile URL Status']}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">Access Code Redemption</span>
                  <span className={`w-fit px-3 py-1 rounded-full text-sm ${
                    participant['Access Code Redemption Status'] === 'Yes' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {participant['Access Code Redemption Status'] === 'Yes' ? 'Redeemed' : 'Not Redeemed'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">All Completed</span>
                  <span className={`w-fit px-3 py-1 rounded-full text-sm ${
                    participant['All Skill Badges & Games Completed'] === 'Yes' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {participant['All Skill Badges & Games Completed'] === 'Yes' ? 'Yes ✓' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {participant['# of Skill Badges Completed'] || 0}
              </div>
              <div className="text-sm text-blue-800 mt-1">Skill Badges Completed</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {participant['# of Arcade Games Completed'] || 0}
              </div>
              <div className="text-sm text-green-800 mt-1">Arcade Games Completed</div>
            </div>
          </div>
        </div>

        {/* Skill Badges Section */}
        {skillBadges.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-500">🎖️</span>
              Completed Skill Badges
              <span className="text-lg font-normal text-gray-500">({skillBadges.length})</span>
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <ul className="space-y-3">
                {skillBadges.map((badge, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded hover:bg-blue-50 transition"
                  >
                    <span className="text-blue-600 font-semibold min-w-[2rem]">{index + 1}.</span>
                    <p className="text-gray-800 leading-relaxed">{badge}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Arcade Games Section */}
        {arcadeGames.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-green-500">🎮</span>
              Completed Arcade Games
              <span className="text-lg font-normal text-gray-500">({arcadeGames.length})</span>
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <ul className="space-y-3">
                {arcadeGames.map((game, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded hover:bg-green-50 transition"
                  >
                    <span className="text-green-600 font-semibold min-w-[2rem]">{index + 1}.</span>
                    <p className="text-gray-800 leading-relaxed">{game}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Empty State */}
        {skillBadges.length === 0 && arcadeGames.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-600">No badges or games completed yet</p>
            <p className="text-sm text-gray-400 mt-2">Keep learning and come back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

