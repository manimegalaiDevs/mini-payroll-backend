const db = require('../config/db');

// Create salary record
const createSalary = async (data) => {

    return await db.transaction(async (trx) => {

        if (data.is_current) {
            // Make previous salary non-current
            await trx('salary_detail')
                .where({
                    staff_detail_id: data.staff_detail_id,
                    is_current: true
                })
                .update({ is_current: false });
        }
        const [id] = await trx('salary_detail')
            .insert(data)
            .returning('id');

        const created = await trx('salary_detail')
            .where({ id })
            .first();

        return created;
    });
};

// Get salary by staff ID
const getSalaryByStaff = async (staff_detail_id) => {
    return await db('salary_detail')
        .where({ staff_detail_id })
        .orderBy('id', 'desc');
};

// Update salary
const updateSalary = async (id, data) => {
    const updatedRows = await db('salary_detail')
        .where({ id })
        .update(data);

    if (updatedRows === 0) {
        throw new Error('Salary record not found');
    }
    return { id, ...data };
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
