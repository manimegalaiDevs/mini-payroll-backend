// constants/roles.js

const ROLES = {
    SUPER_ADMIN: 'Super Admin', // Full access
    ADMIN: 'Admin', // Own station details
    DATA_ENTRY_OPERATOR: 'Data Entry Operator', // Staff & salary (own station)
    STAFF_USER: 'Staff User', // Own details only (view + limited actions)

    CHECKING_OFFICER: 'Checking Officer', // Duty, Leave, Claim (own station)
    CERTIFYING_OFFICER: 'Certifying Officer', // Duty, Leave, Claim (own station)
    MATRON: 'Matron', // Duty, Leave, Claim (own station)

    ACCOUNTANT: 'Accountant', // Salary claim only (district level)
    RDHS: 'RDHS', // View all staff + Salary claim (district level)
    MS: 'M.S', // View all staff + Salary claim (district level)
    DMO: 'D.M.O', // View all staff + Salary claim (district level)
    AO: 'A.O' // View all staff + Salary claim (district level)
};

// Role-based access mapping
const ROLE_ACCESS = {
    [ROLES.SUPER_ADMIN]: ['ALL'],
    [ROLES.ADMIN]: ['STATION_ALL'],
    [ROLES.DATA_ENTRY_OPERATOR]: ['STATION_STAFF', 'STATION_SALARY'],
    [ROLES.STAFF_USER]: ['OWN_DUTY', 'OWN_LEAVE', 'OWN_CLAIM'],

    [ROLES.CHECKING_OFFICER]: ['STATION_DUTY', 'STATION_LEAVE', 'STATION_CLAIM'],
    [ROLES.CERTIFYING_OFFICER]: ['STATION_DUTY', 'STATION_LEAVE', 'STATION_CLAIM'],
    [ROLES.MATRON]: ['STATION_DUTY', 'STATION_LEAVE', 'STATION_CLAIM'],

    [ROLES.ACCOUNTANT]: ['DISTRICT_SALARY'],
    [ROLES.RDHS]: ['DISTRICT_VIEW', 'DISTRICT_SALARY'],
    [ROLES.MS]: ['DISTRICT_VIEW', 'DISTRICT_SALARY'],
    [ROLES.DMO]: ['DISTRICT_VIEW', 'DISTRICT_SALARY'],
    [ROLES.AO]: ['DISTRICT_VIEW', 'DISTRICT_SALARY']
};

module.exports = { ROLES, ROLE_ACCESS };
