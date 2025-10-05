// src/components/DynamicTableRow.js
import React from "react";
import Link from 'next/link';
import { getVisibleColumns } from '@/config/tableConfig';

function DynamicTableRow({ participant, rowIndex, isFiltered = false }) {
  const visibleColumns = getVisibleColumns();

  const renderCell = (col, value) => {
    // Handle index column (row number) with medal emojis for top 3
    if (col.isIndex) {
      const medals = ['🥇', '🥈', '🥉'];
      const medal = rowIndex <= 3 ? medals[rowIndex - 1] : '';
      
      // Show search indicator for filtered results
      const searchIndicator = isFiltered && participant._isSearchResult ? ' 🔍' : '';
      
      return `${rowIndex} ${medal}${searchIndicator}`;
    }

    // Handle action column (View Details button)
    if (col.isAction) {
      const email = encodeURIComponent(participant["User Email"] || '');
      return (
        <Link 
          href={`/participant?email=${email}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition inline-block text-sm"
        >
          View Details
        </Link>
      );
    }

    // If custom render function exists, use it
    if (col.render) {
      const rendered = col.render(value, participant);
      return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
    }
    
    // Default rendering
    return value || '-';
  };

  // Determine row background based on position
  const getRowClasses = () => {
    let baseClasses = "border border-b-slate-200";
    
    if (rowIndex === 1) {
      // Gold - 1st place
      return `${baseClasses} bg-gradient-to-r from-yellow-300 to-yellow-200 text-yellow-900 font-semibold`;
    } else if (rowIndex === 2) {
      // Silver - 2nd place
      return `${baseClasses} bg-gradient-to-r from-gray-300 to-gray-200 text-gray-900 font-semibold`;
    } else if (rowIndex === 3) {
      // Bronze - 3rd place
      return `${baseClasses} bg-gradient-to-r from-orange-300 to-orange-200 text-orange-900 font-semibold`;
    } else {
      // Regular rows
      return `${baseClasses} odd:bg-white even:bg-gray-50`;
    }
  };

  return (
    <tr className={getRowClasses()}>
      {visibleColumns.map((col) => {
        const value = participant[col.key];
        const mobileHidden = !col.mobileVisible ? 'mob:hidden' : '';
        
        return (
          <td
            key={col.key}
            className={`${col.className} ${mobileHidden}`.trim()}
          >
            {renderCell(col, value)}
          </td>
        );
      })}
    </tr>
  );
}

export default DynamicTableRow;