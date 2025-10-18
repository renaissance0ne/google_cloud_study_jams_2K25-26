"use client"
import React, { useState, useEffect } from 'react'
import DynamicTableHeader from './DynamicTableHeader'
import TableBody from './TableBody'
import { ELIGIBILITY_CONFIG } from '@/config/tableConfig'
import * as XLSX from 'xlsx'

function TableIndex() {
  const [data, setData] = useState([]);
  const [Participationdata, setParticipationdata] = useState([]);
  const [EligibleforSwags, setEligibleforSwags] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    redemptionStatus: 'all', // 'all', 'done', 'not-done'
    allCompleted: 'all', // 'all', 'yes', 'no'
    skillBadgeSort: 'none', // 'none', 'asc', 'desc'
    arcadeGameSort: 'none', // 'none', 'asc', 'desc'
    searchTerm: ''
  });

  // Apply filters and sorting
  const applyFiltersAndSort = (dataToFilter) => {
    let filteredData = [...dataToFilter];

    // Apply search filter
    if (filters.searchTerm.trim()) {
      filteredData = filteredData.filter((participant) => {
        const searchFields = [
          participant["User Name"],
          participant["User Email"],
          participant["Profile URL Status"]
        ].filter(Boolean);
        
        return searchFields.some(field => 
          field.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      });
    }

    // Apply redemption status filter
    if (filters.redemptionStatus !== 'all') {
      if (filters.redemptionStatus === 'done') {
        filteredData = filteredData.filter(p => p["Access Code Redemption Status"] === "Yes");
      } else if (filters.redemptionStatus === 'not-done') {
        filteredData = filteredData.filter(p => p["Access Code Redemption Status"] !== "Yes");
      }
    }

    // Apply all completed filter
    if (filters.allCompleted !== 'all') {
      if (filters.allCompleted === 'yes') {
        filteredData = filteredData.filter(p => p["All Skill Badges & Games Completed"] === "Yes");
      } else if (filters.allCompleted === 'no') {
        filteredData = filteredData.filter(p => p["All Skill Badges & Games Completed"] !== "Yes");
      }
    }

    // Apply sorting
    if (filters.skillBadgeSort !== 'none' || filters.arcadeGameSort !== 'none') {
      filteredData.sort((a, b) => {
        // Skill badge sorting takes priority
        if (filters.skillBadgeSort !== 'none') {
          const aSkill = parseInt(a["# of Skill Badges Completed"]) || 0;
          const bSkill = parseInt(b["# of Skill Badges Completed"]) || 0;
          
          if (aSkill !== bSkill) {
            return filters.skillBadgeSort === 'asc' ? aSkill - bSkill : bSkill - aSkill;
          }
        }
        
        // Arcade game sorting as secondary
        if (filters.arcadeGameSort !== 'none') {
          const aArcade = parseInt(a["# of Arcade Games Completed"]) || 0;
          const bArcade = parseInt(b["# of Arcade Games Completed"]) || 0;
          
          if (aArcade !== bArcade) {
            return filters.arcadeGameSort === 'asc' ? aArcade - bArcade : bArcade - aArcade;
          }
        }
        
        // Fall back to original ranking
        return (a._actualRank || 0) - (b._actualRank || 0);
      });
    }

    // Add context information
    return filteredData.map(participant => ({
      ...participant,
      _totalParticipants: dataToFilter.length,
      _isSearchResult: filters.searchTerm.trim() !== '' || 
                      filters.redemptionStatus !== 'all' || 
                      filters.allCompleted !== 'all' ||
                      filters.skillBadgeSort !== 'none' ||
                      filters.arcadeGameSort !== 'none'
    }));
  };
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
      })
      .map((participant, sortedIndex) => ({
        ...participant,
        _actualRank: sortedIndex + 1 // Add actual leaderboard position
      }));
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
        
        // Add total participant count to each participant
        const dataWithTotal = sortedData.map(participant => ({
          ...participant,
          _totalParticipants: sortedData.length
        }));
        
        setData(dataWithTotal);
        // Apply initial filters (which should show all data initially)
        const initialFiltered = applyFiltersAndSort(dataWithTotal);
        setParticipationdata(initialFiltered);
        
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

  // Reapply filters when filter state changes
  useEffect(() => {
    if (data.length > 0) {
      const filteredData = applyFiltersAndSort(data);
      setParticipationdata(filteredData);
    }
  }, [filters, data]);

  // Update search function to use filter state
  const searchname = (name) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: name
    }));
  };

  // Filter control functions
  const updateFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      redemptionStatus: 'all',
      allCompleted: 'all',
      skillBadgeSort: 'none',
      arcadeGameSort: 'none',
      searchTerm: ''
    });
  };

  // Export function to create Excel file
  const exportToExcel = () => {
    if (Participationdata.length === 0) return;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Prepare data for export
    const exportData = Participationdata.map((participant, index) => ({
      'Rank': participant._actualRank || (index + 1),
      'Name': participant['User Name'] || '',
      'Email': participant['User Email'] || '',
      'Redemption Status': participant['Access Code Redemption Status'] || '',
      'All Completed': participant['All Skill Badges & Games Completed'] || '',
      'Skill Badges': participant['# of Skill Badges Completed'] || 0,
      'Arcade Games': participant['# of Arcade Games Completed'] || 0,
      'Profile URL Status': participant['Profile URL Status'] || '',
      'Profile URL': participant['Google Cloud Skills Boost Profile URL'] || '',
      'Skill Badge Names': participant['Names of Completed Skill Badges'] || '',
      'Arcade Game Names': participant['Names of Completed Arcade Games'] || ''
    }));

    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 8 },  // Rank
      { wch: 25 }, // Name
      { wch: 35 }, // Email
      { wch: 18 }, // Redemption Status
      { wch: 15 }, // All Completed
      { wch: 15 }, // Skill Badges
      { wch: 15 }, // Arcade Games
      { wch: 20 }, // Profile URL Status
      { wch: 60 }, // Profile URL
      { wch: 80 }, // Skill Badge Names
      { wch: 80 }  // Arcade Game Names
    ];
    ws['!cols'] = colWidths;

    // Add styling to header row
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    // Apply header styling
    const headers = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1'];
    headers.forEach(cellRef => {
      if (ws[cellRef]) {
        ws[cellRef].s = headerStyle;
      }
    });

    // Add conditional styling for status columns
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
      // Redemption Status column (D) - Bright Green for Done, Bright Red for Not Done
      const redemptionCell = `D${row + 1}`;
      if (ws[redemptionCell]) {
        const value = ws[redemptionCell].v;
        if (value === 'Yes') {
          ws[redemptionCell].s = {
            fill: { fgColor: { rgb: "16A34A" } }, // Bright green background
            font: { color: { rgb: "FFFFFF" }, bold: true }, // White text
            border: {
              top: { style: "thick", color: { rgb: "15803D" } },
              bottom: { style: "thick", color: { rgb: "15803D" } },
              left: { style: "thick", color: { rgb: "15803D" } },
              right: { style: "thick", color: { rgb: "15803D" } }
            }
          };
        } else if (value === 'No' || value !== 'Yes') {
          ws[redemptionCell].s = {
            fill: { fgColor: { rgb: "DC2626" } }, // Bright red background
            font: { color: { rgb: "FFFFFF" }, bold: true }, // White text
            border: {
              top: { style: "thick", color: { rgb: "B91C1C" } },
              bottom: { style: "thick", color: { rgb: "B91C1C" } },
              left: { style: "thick", color: { rgb: "B91C1C" } },
              right: { style: "thick", color: { rgb: "B91C1C" } }
            }
          };
        }
      }

      // All Completed column (E) - Bright Green for Yes, Bright Red for No
      const completedCell = `E${row + 1}`;
      if (ws[completedCell]) {
        const value = ws[completedCell].v;
        if (value === 'Yes') {
          ws[completedCell].s = {
            fill: { fgColor: { rgb: "16A34A" } }, // Bright green background
            font: { color: { rgb: "FFFFFF" }, bold: true }, // White text
            border: {
              top: { style: "thick", color: { rgb: "15803D" } },
              bottom: { style: "thick", color: { rgb: "15803D" } },
              left: { style: "thick", color: { rgb: "15803D" } },
              right: { style: "thick", color: { rgb: "15803D" } }
            }
          };
        } else if (value === 'No' || value !== 'Yes') {
          ws[completedCell].s = {
            fill: { fgColor: { rgb: "DC2626" } }, // Bright red background
            font: { color: { rgb: "FFFFFF" }, bold: true }, // White text
            border: {
              top: { style: "thick", color: { rgb: "B91C1C" } },
              bottom: { style: "thick", color: { rgb: "B91C1C" } },
              left: { style: "thick", color: { rgb: "B91C1C" } },
              right: { style: "thick", color: { rgb: "B91C1C" } }
            }
          };
        }
      }

      // Rank column (A) - Gold for top 3
      const rankCell = `A${row + 1}`;
      if (ws[rankCell]) {
        const rank = ws[rankCell].v;
        if (rank <= 3) {
          const colors = [
            { bg: "FFD700", text: "8B4513" }, // Gold
            { bg: "C0C0C0", text: "2F4F4F" }, // Silver
            { bg: "CD7F32", text: "FFFFFF" }  // Bronze
          ];
          const colorIndex = rank - 1;
          ws[rankCell].s = {
            fill: { fgColor: { rgb: colors[colorIndex].bg } },
            font: { color: { rgb: colors[colorIndex].text }, bold: true },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Leaderboard');
    
    // Generate filename with current date and filter info
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    let filename = `CloudJam_Leaderboard_${dateStr}`;
    
    // Add filter info to filename if filtered
    if (Participationdata[0]?._isSearchResult) {
      filename += '_Filtered';
    }
    filename += '.xlsx';
    
    // Save file
    XLSX.writeFile(wb, filename);
  };

  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200'>
        <div className="text-center text-red-500 dark:text-red-400">
          <p className="text-xl">Error loading data: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full relative bg-white dark:bg-gray-900 transition-colors duration-200'>
      {/* Top Stats Section */}
      <div className="sec m-auto my-10 space-y-8 w-full max-w-7xl flex flex-col px-3">
        <div className="info flex mob:flex-col mob:justify-center mob:items-center mob:space-y-10 mob:p-5 justify-center space-x-3 mob:space-x-0">
          <div className="eligibleforswag w-fit mob:w-full h-20 p-5 space-x-5 rounded-lg flex flex-row justify-evenly mob:justify-between items-center bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-300/30 dark:shadow-green-800/20 border border-green-200 dark:border-green-700 transition-colors duration-200">
            <p className="text-center mob:text-start text-sm text-green-400 dark:text-green-300">
              No of Eligible <br /> Participants for swags
            </p>
            <p className="no text-2xl border-l-2 border-l-green-700 dark:border-l-green-600 pl-3 text-green-800 dark:text-green-300">
              {EligibleforSwags}
            </p>
          </div>
          <div className="eligibleforswag w-fit mob:w-full h-20 p-5 space-x-5 rounded-lg flex flex-row justify-evenly mob:justify-between items-center bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-300/30 dark:shadow-blue-800/20 border border-blue-200 dark:border-blue-700 transition-colors duration-200">
            <p className="text-center mob:text-start text-sm text-blue-400 dark:text-blue-300">
              Total No of <br />Participants
            </p>
            <p className="no text-2xl border-l-2 border-l-blue-700 dark:border-l-blue-600 pl-3 text-blue-800 dark:text-blue-300">
              {data.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout - CSS Grid Layout for Proper Sidebar */}
      <div className="w-full lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 px-4">
        
        {/* Left Panel - Filters and Search - Desktop Only */}
        <div className="hidden lg:block">
          <div className="sticky top-4 space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full transition-colors duration-200">
            
            {/* Search Bar */}
            <div className="search py-2 space-x-5 flex justify-start items-center shadow-lg shadow-blue-400/30 dark:shadow-blue-600/20 bg-blue-50 dark:bg-blue-900/30 w-full rounded-full transition-colors duration-200">
              <div className="icon px-3">
                <svg xmlns="http://www.w3.org/2000/svg" className='h-5' viewBox="0 0 512 512">
                  <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" fill="#3b82f6" />
                </svg>
              </div>
              <div className="input w-full">
                <input
                  value={filters.searchTerm}
                  onChange={(e) => searchname(e.target.value)}
                  className='bg-transparent text-base outline-none w-full pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400' 
                  type="text" 
                  name="searchbar" 
                  id="searchbar" 
                  placeholder='Search Your Name Here' 
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="filters bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3 transition-colors duration-200">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Filters & Sorting</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={resetFilters}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded transition-colors flex-1"
                  >
                    Reset All
                  </button>
                  <button 
                    onClick={exportToExcel}
                    className="px-2 py-1 text-xs bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded transition-colors flex-1"
                    disabled={Participationdata.length === 0}
                  >
                    Export
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Redemption Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Redemption Status
                  </label>
                  <select 
                    value={filters.redemptionStatus}
                    onChange={(e) => updateFilter('redemptionStatus', e.target.value)}
                    className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="done">Done</option>
                    <option value="not-done">Not Done</option>
                  </select>
                </div>

                {/* All Completed Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    All Completed
                  </label>
                  <select 
                    value={filters.allCompleted}
                    onChange={(e) => updateFilter('allCompleted', e.target.value)}
                    className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Skill Badges Sort */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort Skill Badges
                  </label>
                  <select 
                    value={filters.skillBadgeSort}
                    onChange={(e) => updateFilter('skillBadgeSort', e.target.value)}
                    className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="none">Default</option>
                    <option value="desc">High→Low</option>
                    <option value="asc">Low→High</option>
                  </select>
                </div>

                {/* Arcade Games Sort */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort Arcade Games
                  </label>
                  <select 
                    value={filters.arcadeGameSort}
                    onChange={(e) => updateFilter('arcadeGameSort', e.target.value)}
                    className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  >
                    <option value="none">Default</option>
                    <option value="desc">High→Low</option>
                    <option value="asc">Low→High</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(filters.redemptionStatus !== 'all' || filters.allCompleted !== 'all' || 
                filters.skillBadgeSort !== 'none' || filters.arcadeGameSort !== 'none' || 
                filters.searchTerm.trim() !== '') && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Active:</span>
                  <div className="flex flex-wrap gap-1">
                    {filters.searchTerm && (
                      <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        "{filters.searchTerm.length > 8 ? filters.searchTerm.substring(0, 8) + '...' : filters.searchTerm}"
                      </span>
                    )}
                    {filters.redemptionStatus !== 'all' && (
                      <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                        {filters.redemptionStatus === 'done' ? 'Done' : 'Not Done'}
                      </span>
                    )}
                    {filters.allCompleted !== 'all' && (
                      <span className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                        {filters.allCompleted === 'yes' ? 'Yes' : 'No'}
                      </span>
                    )}
                    {filters.skillBadgeSort !== 'none' && (
                      <span className="px-1 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                        S:{filters.skillBadgeSort === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                    {filters.arcadeGameSort !== 'none' && (
                      <span className="px-1 py-0.5 bg-pink-100 text-pink-800 rounded text-xs">
                        A:{filters.arcadeGameSort === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        
        {/* Mobile Filters - Show above leaderboard on small screens */}
        <div className="lg:hidden w-full mb-4 px-4">
          {/* Search Bar */}
          <div className="search py-2 space-x-5 flex justify-start items-center shadow-lg shadow-blue-400/30 dark:shadow-blue-600/20 bg-blue-50 dark:bg-blue-900/30 w-full rounded-full mb-4 transition-colors duration-200">
            <div className="icon px-3">
              <svg xmlns="http://www.w3.org/2000/svg" className='h-5' viewBox="0 0 512 512">
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" fill="#3b82f6" />
              </svg>
            </div>
            <div className="input w-full">
              <input
                value={filters.searchTerm}
                onChange={(e) => searchname(e.target.value)}
                className='bg-transparent mob:text-lg text-base outline-none w-full pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400' 
                type="text" 
                name="searchbar" 
                id="searchbar" 
                placeholder='Search Your Name Here' 
              />
            </div>
          </div>

          {/* Mobile Filter Controls */}
          <div className="filters bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 transition-colors duration-200">
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Filters & Sorting</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={resetFilters}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded transition-colors flex-1"
                >
                  Reset All
                </button>
                <button 
                  onClick={exportToExcel}
                  className="px-2 py-1 text-xs bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded transition-colors flex-1"
                  disabled={Participationdata.length === 0}
                >
                  Export
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Mobile filters in 2 columns */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Redemption Status</label>
                <select 
                  value={filters.redemptionStatus}
                  onChange={(e) => updateFilter('redemptionStatus', e.target.value)}
                  className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded transition-colors"
                >
                  <option value="all">All</option>
                  <option value="done">Done</option>
                  <option value="not-done">Not Done</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">All Completed</label>
                <select 
                  value={filters.allCompleted}
                  onChange={(e) => updateFilter('allCompleted', e.target.value)}
                  className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded transition-colors"
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Skill Badges</label>
                <select 
                  value={filters.skillBadgeSort}
                  onChange={(e) => updateFilter('skillBadgeSort', e.target.value)}
                  className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded transition-colors"
                >
                  <option value="none">Default</option>
                  <option value="desc">High→Low</option>
                  <option value="asc">Low→High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Arcade Games</label>
                <select 
                  value={filters.arcadeGameSort}
                  onChange={(e) => updateFilter('arcadeGameSort', e.target.value)}
                  className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded transition-colors"
                >
                  <option value="none">Default</option>
                  <option value="desc">High→Low</option>
                  <option value="asc">Low→High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Leaderboard */}
        <div className="w-full lg:w-auto lg:min-w-0">
          {Participationdata.length === 0 && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              No results found with current filters
            </div>
          )}

          {Participationdata.length > 0 && (
            <div className="w-full">
              {/* Search/Filter results indicator */}
              {Participationdata.length > 0 && Participationdata[0]._isSearchResult && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-4 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>🔍 Filtered Results:</strong> Showing {Participationdata.length} result(s) with their actual leaderboard positions out of {data.length} total participants.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className='w-full table-fixed'>
                  <DynamicTableHeader />
                  <TableBody
                    Participationdata={Participationdata}
                    setParticipationdata={setParticipationdata}
                  />
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TableIndex