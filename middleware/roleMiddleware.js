export const adminCheck = (req, res, next) => {
 
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({ message: 'Admin access required' });
    }
};






export const authorizeRoles = (...allowRoles) =>{
    return (req, res, next) => {
        if (!allowRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
}