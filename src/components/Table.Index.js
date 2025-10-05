"use client"
import React, { useState, useEffect } from 'react'
import DynamicTableHeader from './DynamicTableHeader'
import TableBody from './TableBody'
import { ELIGIBILITY_CONFIG } from '@/config/tableConfig'

function TableIndex() {
  const [data, setData] = useState([]);
  const [Participationdata, setParticipationdata] = useState([]);
  const [EligibleforSwags, setEligibleforSwags] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);

  // Sorting function: Redemption Status (Yes first) → Total Score (DESC) → Original CSV order
  const sortLeaderboard = (dataToSort) => {
    return dataToSort
      .map((participant, originalIndex) => ({
        ...participant,
        _originalIndex: originalIndex, // Preserve original CSV position
        _totalScore: 
          (parseInt(participant["# of Skill Badges Completed"]) || 0) + 
          (parseInt(participant["# of Arcade Games Completed"]) || 0)
      }))
      .sort((a, b) => {
        // 1. Primary Sort: Redemption Status (Yes first)
        const statusA = a["Access Code Redemption Status"] === "Yes" ? 0 : 1;
        const statusB = b["Access Code Redemption Status"] === "Yes" ? 0 : 1;
        
        if (statusA !== statusB) {
          return statusA - statusB; // Yes (0) comes before No (1)
        }
        
        // 2. Secondary Sort: Total Score (Higher = Better = Top)
        if (b._totalScore !== a._totalScore) {
          return b._totalScore - a._totalScore; // Descending order
        }
        
        // 3. Tertiary Sort: Original CSV position (Earlier row wins)
        return a._originalIndex - b._originalIndex;
      });
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        const jsonData = result.data || result; // Support both formats
        
        // Sort the data before setting state
        const sortedData = sortLeaderboard(jsonData);
        
        setData(sortedData);
        setParticipationdata(sortedData);
        
        // Store CSV headers if available
        if (result.headers) {
          setCsvHeaders(result.headers);
        }
        
        // Calculate eligibility using config
        const eligible = sortedData.filter(
          (ele) => ele[ELIGIBILITY_CONFIG.field] === ELIGIBILITY_CONFIG.eligibleValue
        ).length;
        setEligibleforSwags(eligible);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    
    // Optional: Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const searchname = (name) => {
    if (!name.trim()) {
      setParticipationdata(data);
      return;
    }
    
    const filteredArr = data.filter((participant) => {
      // Search across multiple fields
      const searchFields = [
        participant["User Name"],
        participant["User Email"],
        participant["Profile URL Status"]
      ].filter(Boolean);
      
      return searchFields.some(field => 
        field.toLowerCase().includes(name.toLowerCase())
      );
    });
    
    // Maintain sorted order in search results
    // (data is already sorted, so filteredArr preserves that order)
    setParticipationdata(filteredArr);
  }

  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="text-center text-red-500">
          <p className="text-xl">Error loading data: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full relative px-3'>
      <div className="sec m-auto my-10 space-y-8 w-1/2 mob:w-full flex flex-col">
        <div className="info flex mob:flex-col mob:justify-center mob:items-center mob:space-y-10 mob:p-5 justify-evenly space-x-3 mob:space-x-0">
          <div className="eligibleforswag w-fit mob:w-full h-20 p-5 space-x-5 rounded-lg flex flex-row justify-evenly mob:justify-between items-center bg-green-50 shadow-lg shadow-green-300/30 border border-green-200">
            <p className="text-center mob:text-start text-sm text-green-400">
              No of Eligible <br /> Participants for swags
            </p>
            <p className="no text-2xl border-l-2 border-l-green-700 pl-3 text-green-800">
              {EligibleforSwags}
            </p>
          </div>
          <div className="eligibleforswag w-fit mob:w-full h-20 p-5 space-x-5 rounded-lg flex flex-row justify-evenly mob:justify-between items-center bg-blue-50 shadow-lg shadow-blue-300/30 border border-blue-200">
            <p className="text-center mob:text-start text-sm text-blue-400">
              Total No of <br />Participants
            </p>
            <p className="no text-2xl border-l-2 border-l-blue-700 pl-3 text-blue-800">
              {data.length}
            </p>
          </div>
        </div>

        <div className="search m-auto mt-3 mob:py-3 py-2 space-x-5 flex justify-start items-center shadow-lg shadow-blue-400/30 bg-blue-50 w-full rounded-full">
          <div className="icon px-3">
            <svg xmlns="http://www.w3.org/2000/svg" className='h-5' viewBox="0 0 512 512">
              <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" fill="#3b82f6" />
            </svg>
          </div>
          <div className="input w-full">
            <input
              onChange={(e) => searchname(e.target.value)}
              className='bg-transparent mob:text-lg text-base outline-none w-full' 
              type="text" 
              name="searchbar" 
              id="searchbar" 
              placeholder='Search Your Name Here' 
            />
          </div>
        </div>

        {Participationdata.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-10">
            No results found
          </div>
        )}
      </div>

      {Participationdata.length > 0 && (
        <table className='mx-auto table-fixed m-5'>
          <DynamicTableHeader />
          <TableBody
            Participationdata={Participationdata}
            setParticipationdata={setParticipationdata}
          />
        </table>
      )}
    </div>
  )
}

export default TableIndex