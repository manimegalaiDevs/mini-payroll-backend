const onFinished = require('on-finished');
const logActivity = require('./logActivity');

module.exports = function activityLogger(req, res, next) {
    onFinished(res, () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const recordId = res.locals.recordId;
            const action = res.locals.action;
            const table = res.locals.table;

            if (recordId && action && table && req.user) {
                logActivity({
                    user_detail_id: req.user_detail_id || null,
                    action_table_id: recordId,
                    do_action: action,
                    action_table: table,
                });
            }
        }
    });
    next();
};
