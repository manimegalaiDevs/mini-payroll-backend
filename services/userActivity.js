const db = require('../config/db'); // Ensure this path is correct

// Create new user activity record
const createUserActivity = async (activityData) => {
    console.log("Before inserting activity log:", activityData);

    const result = await db('user_activity_detail')
        .insert(activityData)
        .returning('*');

    console.log("After inserting activity log:", result);
    return result[0];
};

// Get all activities (with pagination)
const getAllUserActivity = async ({ skip = 0, take = 10 }) => {
    const value = await db('user_activity_detail')
        .join('user_detail', 'user_activity_detail.user_detail_id', 'user_detail.id')
        .orderBy('user_activity_detail.action_date_time', 'desc')
        .offset(skip)
        .limit(take)
        .select(
            'user_activity_detail.*',
            'user_detail.login_user_id as user_name'
        );

    const totalResult = await db('user_activity_detail')
        .count('id as count')
        .first();

    return {
        value,
        total: parseInt(totalResult?.count || 0, 10),
        skip,
        take
    };
};

// Get filtered activities (by any column)
const getUserActivityByFilter = async (filters = {}, skip = 0, take = 10) => {
    const query = db('user_activity_detail')
        .join('user_detail', 'user_activity_detail.user_detail_id', 'user_detail.id')
        .where((builder) => {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (key === 'do_action' || key === 'action_table') {
                        builder.andWhereRaw(`LOWER(user_activity_detail.??) LIKE LOWER(?)`, [key, `%${value}%`]);
                    } else if (key === 'from_date' || key === 'to_date') {
                        // handled below
                    } else {
                        builder.andWhere(`user_activity_detail.${key}`, value);
                    }
                }
            });

            const { from_date, to_date } = filters;
            if (from_date || to_date) {
                let from = from_date;
                let to = to_date;

                if (from && from.length === 10) from = `${from} 00:00:00`;
                if (to && to.length === 10) to = `${to} 23:59:59.999`;

                if (from && to) {
                    builder.andWhereBetween('user_activity_detail.action_date_time', [from, to]);
                } else if (from) {
                    builder.andWhere('user_activity_detail.action_date_time', '>=', from);
                } else if (to) {
                    builder.andWhere('user_activity_detail.action_date_time', '<=', to);
                }
            }
        });

    const totalResult = await query.clone().count('user_activity_detail.id as count').first();
    const total = parseInt(totalResult?.count || 0, 10);

    const value = await query
        .clone()
        .orderBy('user_activity_detail.action_date_time', 'desc')
        .offset(skip)
        .limit(take)
        .select('user_activity_detail.*', 'user_detail.login_user_id as user_name');

    return { value, total, skip, take };
};

// Delete activity record
const deleteUserActivity = async (id) => {
    return db('user_activity_detail').where({ id }).del();
};

module.exports = {
    createUserActivity,
    getAllUserActivity,
    getUserActivityByFilter,
    deleteUserActivity
};
