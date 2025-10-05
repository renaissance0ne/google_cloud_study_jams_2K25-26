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
          return (
            <DynamicTableRow 
              key={participant["User Email"] || participant["User Name"] || index} 
              participant={participant}
              rowIndex={index + 1}
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