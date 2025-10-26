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
                    table_menu_name: table,
                    record_id: recordId,
                    action: action,
                    user_id: req.user.id,
                    shift_id: req.user.shift_id,
                    business_centre_id: req.user.business_centre_id,
                    status: true
                });
            }
        }
    });
    next();
};
