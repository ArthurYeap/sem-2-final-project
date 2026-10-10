// ! catch any error froms the controller and send it to error handler since it's the nearest middleware with a fourth error arguments
const asyncHandler = (controller) => {
    return (req, res, next) => {
        Promise
            // ! resolve turn any funtion into a promise(commonly used for non async functions)
            .resolve(controller(req, res, next))
            .catch(next);
    //     ? error => next(error)
    };
};

module.exports = asyncHandler;