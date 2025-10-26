const formatResponse = (value, total, isSuccess = true, error = 0, exception = null) => ({
    IsSuccess: isSuccess,
    Value: value,
    Total: total,
    Error: error,
    Exception: exception
});

//  Success handlers
const responseHandlers = {
    create: (id) => formatResponse({ message: "Inserted successfully", id }),
    readAll: (value, total) => formatResponse(value, total),
    readById: (record, total) => formatResponse(record, total),
    update: (id) => formatResponse({ message: "Updated successfully", id }),
    delete: (id) => formatResponse({ message: "Deleted successfully", id }),
    empty: () => formatResponse([], 0, 0, null),

    //  Failure handler
    failure: (errorMessage = "An error occurred", errorCode = 1) =>
        formatResponse(null, false, errorCode, errorMessage)
};

module.exports = {
    formatResponse,
    responseHandlers
};