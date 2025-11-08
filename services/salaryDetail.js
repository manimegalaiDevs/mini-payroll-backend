const db = require('../config/db');

// Create salary record
const createSalary = async (data) => {
    if (data.is_current) {
        // Mark all previous salary records for same staff as false
        await db('salary_detail')
            .where({ staff_detail_id: data.staff_detail_id })
            .update({ is_current: false });
    }

    const [inserted] = await db('salary_detail').insert(data).returning('*');
    return inserted;
};

// Get salary by staff ID
const getSalaryByStaff = async (staff_detail_id) => {
    return await db('salary_detail')
        .where({ staff_detail_id })
        .orderBy('id', 'desc');
};

// Update salary
const updateSalary = async (id, data) => {
    const updated = await db('salary_detail')
        .where({ id })
        .update({ ...data, updated_at: db.fn.now() })
        .returning('*');
    return updated[0];
};

// Delete salary record
const deleteSalary = async (id) => {
    return await db('salary_detail').where({ id }).del();
};

module.exports = {
    createSalary,
    getSalaryByStaff,
    updateSalary,
    deleteSalary,
};
