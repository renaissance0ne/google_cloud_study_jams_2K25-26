import React from 'react'
import DynamicTableRow from './DynamicTableRow'
import { getVisibleColumns } from '@/config/tableConfig'

function TableBody({ Participationdata, setParticipationdata }) {
  const visibleColumns = getVisibleColumns();
  const colSpan = visibleColumns.length;

  return (
    <tbody className='text-xs'>
      {Participationdata.length > 0 ? (
        Participationdata.map((participant, index) => {
          // Use actual rank if available, otherwise fall back to filtered index
          const displayRank = participant._actualRank || (index + 1);
          
          return (
            <DynamicTableRow 
              key={participant["User Email"] || participant["User Name"] || index} 
              participant={participant}
              rowIndex={displayRank}
              isFiltered={Participationdata.length !== participant._totalParticipants}
            />
          );
        })
      ) : (
        <tr>
          <td colSpan={colSpan} className='text-lg text-center p-10'>
            No Data Found
          </td>
        </tr>
      )}
    </tbody>
  )
}

export default TableBody