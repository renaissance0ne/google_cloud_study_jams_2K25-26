// src/config/tableConfig.js

/**
 * Table Column Configuration
 * 
 * Configure which columns to display, their order, and custom rendering
 * 
 * Fields:
 * - key: The exact column name from your CSV file
 * - label: Display name in the table header
 * - visible: Show/hide column
 * - mobileVisible: Show on mobile devices
 * - render: Custom rendering function (optional)
 * - className: Custom CSS classes for the cell
 */

export const COLUMN_CONFIG = [
    {
      key: '_index',
      label: '#',
      visible: true,
      mobileVisible: true,
      className: 'Index p-3 text-center font-semibold bg-gray-100',
      isIndex: true, // Special flag for index column
    },
    {
      key: 'User Name',
      label: 'Name',
      visible: true,
      mobileVisible: true,
      className: 'User_Name p-3 uppercase',
      render: (value, row) => {
        const badge = row["All Skill Badges & Games Completed"] === "Yes" ? '🏅' : '';
        return `${value} ${badge}`;
      }
    },
    {
      key: 'User Email',
      label: 'Email',
      visible: false, // HIDDEN - Set to true to show
      mobileVisible: false,
      className: 'User_Email p-3'
    },
    {
      key: 'Access Code Redemption Status',
      label: 'Redemption Status',
      visible: true,
      mobileVisible: false,
      className: 'Redemption_Status p-3 relative mob:hidden',
      render: (value) => {
        const isDone = value === "Yes";
        return `
          <div class="w-fit m-auto rounded-full px-4 py-1 text-center ${
            isDone ? 'bg-green-100 text-green-800 font-semibold border border-green-300' : 'bg-red-100 text-red-800 font-semibold border border-red-300'
          }">
            ${isDone ? 'Done' : 'Not Done'}
          </div>
        `;
      }
    },
    {
      key: 'Profile URL Status',
      label: 'Institution',
      visible: false, // HIDDEN on leaderboard, shown on detail page
      mobileVisible: false,
      className: 'Institution mob:hidden relative p-3',
      render: (value) => {
        const isGood = value === "All Good";
        return `
          <div class="m-auto w-fit rounded-3xl px-2 py-1 text-center ${
            isGood ? 'bg-green-200 text-green-600' : 'bg-yellow-200 text-yellow-600'
          }">
            ${isGood ? 'Valid' : 'Check'}
          </div>
        `;
      }
    },
    {
      key: 'All Skill Badges & Games Completed',
      label: 'All Completed',
      visible: true,
      mobileVisible: false,
      className: 'Completions_both_Pathways_relative p-3 text-center mob:hidden',
      render: (value) => {
        const isComplete = value === "Yes";
        return `
          <div class="m-auto w-fit rounded-full px-5 py-1 text-center ${
            isComplete ? 'bg-green-100 text-green-800 font-semibold border border-green-300' : 'bg-red-100 text-red-800 font-semibold border border-red-300'
          }">
            ${isComplete ? 'Yes' : 'No!'}
          </div>
        `;
      }
    },
    {
      key: '# of Skill Badges Completed',
      label: 'Number of Skill Badges Completed',
      visible: true,
      mobileVisible: false,
      className: 'no_Skill_Badges_Completed mob:hidden p-3 text-center'
    },
    {
      key: '# of Arcade Games Completed',
      label: 'Number of Arcade Games Completed',
      visible: true,
      mobileVisible: false,
      className: 'no_Arcade_Games_Completed mob:hidden p-3 text-center'
    },
    {
      key: 'Names of Completed Skill Badges',
      label: 'Completed Badges',
      visible: false, // HIDDEN - Set to true to show
      mobileVisible: false,
      className: 'Completed_Badges p-3 text-xs'
    },
    {
      key: 'Names of Completed Arcade Games',
      label: 'Completed Games',
      visible: false, // HIDDEN - Set to true to show
      mobileVisible: false,
      className: 'Completed_Games p-3 text-xs'
    },
    {
      key: 'Google Cloud Skills Boost Profile URL',
      label: 'Profile URL',
      visible: false, // HIDDEN on leaderboard, shown on detail page
      mobileVisible: false,
      className: 'Profile_URL p-3',
      render: (value) => {
        if (!value) return '-';
        return `<a href="${value}" target="_blank" class="text-blue-500 hover:underline">View Profile</a>`;
      }
    },
    {
      key: '_action',
      label: 'Actions',
      visible: true,
      mobileVisible: true,
      className: 'Actions p-3 text-center',
      isAction: true, // Special flag for action column
    }
  ];
  
  // Helper function to get visible columns
  export const getVisibleColumns = () => {
    return COLUMN_CONFIG.filter(col => col.visible);
  };
  
  // Helper function to get mobile visible columns
  export const getMobileVisibleColumns = () => {
    return COLUMN_CONFIG.filter(col => col.visible && col.mobileVisible);
  };
  
  // Helper function to get column config by key
  export const getColumnConfig = (key) => {
    return COLUMN_CONFIG.find(col => col.key === key);
  };
  
// Eligibility field configuration
export const ELIGIBILITY_CONFIG = {
  field: 'All Skill Badges & Games Completed',
  eligibleValue: 'Yes'
};