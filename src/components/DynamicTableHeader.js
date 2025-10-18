// src/components/DynamicTableHeader.js
import React from 'react';
import { getVisibleColumns } from '@/config/tableConfig';

function DynamicTableHeader() {
  const visibleColumns = getVisibleColumns();

  return (
    <thead className='shadow-md text-sm text-gray-200 dark:text-gray-100 sticky top-0 z-50'>
      <tr className='text-center bg-blue-500 dark:bg-blue-700'>
        {visibleColumns.map((col, index) => {
          const isFirst = index === 0;
          const isLast = index === visibleColumns.length - 1;
          const mobileHidden = !col.mobileVisible ? 'mob:hidden' : '';
          const mobileRounded = index === 0 || (index === 1 && !visibleColumns[0].mobileVisible) 
            ? 'mob:rounded-se-lg' 
            : '';
          
          return (
            <td
              key={col.key}
              className={`
                p-2 border-r-2 border-r-gray-300 dark:border-r-gray-600 bg-blue-500 dark:bg-blue-700 transition-colors duration-200
                ${isFirst ? 'rounded-ss-lg w-80' : ''}
                ${isLast ? 'rounded-se-lg' : ''}
                ${mobileHidden}
                ${mobileRounded}
                max-w-[150px]
              `.trim()}
            >
              {col.label}
            </td>
          );
        })}
      </tr>
    </thead>
  );
}

export default DynamicTableHeader;