const userActivityService = require('../services/userActivity');

async function logActivity(payload) {
    const activity = {
        user_detail_id: payload.user_detail_id,
        do_action: payload.do_action,
        action_table: payload.action_table,
        action_table_id: payload.action_table_id,
        action_date_time: new Date(), // current timestamp
    };

    try {
        await userActivityService.createUserActivity(activity);
        console.log(`Activity logged: ${activity.do_action} on ${activity.action_table}`);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}

module.exports = logActivity;
