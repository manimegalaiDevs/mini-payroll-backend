const db = require('../config/db.cofig');

// Create
const createItem = async (items) => {
    if (!Array.isArray(items)) {
        items = [items]; // support both single and batch inserts
    }

    const inserted = [];
    const skipped = [];

    for (const item of items) {
        const { dropdown_type, item_name, filter_by = null } = item;

        const exists = await db('dropdownitems')
            .where({ dropdown_type, item_name })
            .andWhere(function () {
                if (filter_by === null) {
                    this.whereNull('filter_by');
                } else {
                    this.where('filter_by', filter_by);
                }
            })
            .first();

        if (exists) {
            skipped.push(item);
        } else {
            const [created] = await db('dropdownitems')
                .insert({ dropdown_type, item_name, filter_by })
                .returning('*');

            inserted.push(created);
        }
    }

    return {
        inserted,
        skipped,
        message:
            inserted.length > 0
                ? skipped.length > 0
                    ? 'Some items inserted, some skipped due to duplication'
                    : 'All items inserted successfully'
                : 'All items already exist. No new data inserted.',
    };
};

// Get (with optional filter_by)
const getDropdownItemsByFilters = async (filters = {}) => {
    const query = db('dropdownitems').select('*');

    if (filters.dropdown_type) {
        query.where('dropdown_type', filters.dropdown_type);
    }
    if (filters.item_name) {
        query.andWhere('item_name', filters.item_name);
    }
    if (filters.filter_by) {
        query.andWhere('filter_by', filters.filter_by);
    }

    return await query;
};



const getAllItems = async ({ skip, take }) => {
    const items = await db('dropdownitems')
        .select('*')
        .offset(skip)
        .limit(take);

    const totalRow = await db('dropdownitems').count('id as count').first();

    return {
        items,
        total: parseInt(totalRow.count),
        skip,
        take
    };
};


// Update
const updateItem = async (id, data) => {
    return await db('dropdownitems').where({ id }).update(data).returning('*');
};

// Delete
const deleteItem = async (id) => {
    return await db('dropdownitems').where({ id }).del();
};


module.exports = {
    createItem,
    getDropdownItemsByFilters,
    getAllItems,
    updateItem,
    deleteItem
};
