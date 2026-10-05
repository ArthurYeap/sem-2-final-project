// ! catch any error froms the controller and send it to error handler since it's the nearest middleware with a fourth error arguments
const asyncHandler = (controller) => {
    return (req, res, next) => {
        Promise
            .resolve(controller(req, res, next))
            .catch(next);
    };
};

module.exports = asyncHandler;