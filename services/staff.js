const db = require('../config/db');

// Create single staff
const createStaff = async (staffData) => {
    if (!staffData) {
        throw new Error("Invalid staff data (undefined)");
    }

    const exists = await db('staff_detail')
        .where({ NIC: staffData.NIC })
        .first();

    if (exists) {
        throw new Error(`Staff with NIC '${staffData.NIC}' already exists`);
    }

    const [created] = await db('staff_detail')
        .insert(staffData)
        .returning('*');

    return created;
};

// Fetch ALL staff (no pagination)
const getAllStaff = async () => {
    const items = await db('staff_detail').select('*').orderBy('id', 'desc');
    return items;
};

// Fetch staff WITH pagination
const getStaffPaginated = async ({ skip, take }) => {
    const items = await db('staff_detail')
        .select('*')
        .offset(skip)
        .limit(take)
        .orderBy('id', 'desc');

    const totalRow = await db('staff_detail').count('id as count').first();

    return {
        items,
        total: parseInt(totalRow.count),
        skip,
        take,
    };
};

// Get single staff by ID
const getStaffById = async (id) => {
    return await db('staff_detail').where({ id }).first();
};

// Update staff (with duplicate NIC check)
const updateStaff = async (id, data) => {
    if (data.NIC) {
        const duplicate = await db('staff_detail')
            .where({ NIC: data.NIC })
            .andWhereNot({ id })
            .first();
        if (duplicate) {
            throw new Error(`Another staff with NIC '${data.NIC}' already exists`);
        }
    }

    const [updated] = await db('staff_detail')
        .where({ id })
        .update({ ...data, updated_at: db.fn.now() })
        .returning('*');
    return updated;
};

// Delete staff
const deleteStaff = async (id) => {
    return await db('staff_detail').where({ id }).del();
};

module.exports = {
    createStaff,
    getAllStaff,
    getStaffPaginated,
    getStaffById,
    updateStaff,
    deleteStaff,
};
