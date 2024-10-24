// Controller for admin dashboard
export const getAdminDashboard = (req, res) => {
    try {
        // Your admin dashboard logic here
        res.status(200).json({ message: 'Welcome to the Admin Dashboard', user: req.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
