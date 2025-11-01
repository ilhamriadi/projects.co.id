const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
};

// Check if user can access specific area data
const canAccessArea = (req, res, next) => {
    const { kecamatan, desa } = req.params;
    const user = req.user;

    // BPBD can access all areas
    if (user.role === 'bpbd') {
        return next();
    }

    // Kecamatan can access their own kecamatan data
    if (user.role === 'kecamatan') {
        if (user.kecamatan !== kecamatan) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access data from other kecamatan',
                code: 'AREA_ACCESS_DENIED'
            });
        }
        return next();
    }

    // Desa can access their own desa data
    if (user.role === 'desa') {
        if (user.kecamatan !== kecamatan || user.desa !== desa) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access data from other desa',
                code: 'AREA_ACCESS_DENIED'
            });
        }
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Invalid user role',
        code: 'INVALID_ROLE'
    });
};

// Check if user can verify disasters (only BPBD)
const canVerifyDisaster = requireRole('bpbd');

// Check if user can create disasters (Desa and Kecamatan)
const canCreateDisaster = requireRole('desa', 'kecamatan');

// Check if user can update disasters (based on ownership and role)
const canUpdateDisaster = async (req, res, next) => {
    const user = req.user;
    const disasterId = req.params.id || req.params.disasterId;

    // BPBD can update any disaster
    if (user.role === 'bpbd') {
        return next();
    }

    try {
        // Get disaster to check ownership and area
        const Disaster = (await import('../models/Disaster.js')).default;
        const disaster = await Disaster.findById(disasterId);

        if (!disaster) {
            return res.status(404).json({
                success: false,
                message: 'Disaster not found',
                code: 'DISASTER_NOT_FOUND'
            });
        }

        // Check if user can access this disaster
        if (user.role === 'kecamatan' && user.kecamatan !== disaster.kecamatan) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access disaster from other kecamatan',
                code: 'DISASTER_ACCESS_DENIED'
            });
        }

        if (user.role === 'desa' &&
            (user.kecamatan !== disaster.kecamatan || user.desa !== disaster.desa)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot access disaster from other desa',
                code: 'DISASTER_ACCESS_DENIED'
            });
        }

        // Check if user is the reporter (for non-BPBD users)
        if (user.role !== 'bpbd' && disaster.reporter_id !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the reporter can update this disaster',
                code: 'NOT_REPORTER'
            });
        }

        next();
    } catch (error) {
        console.error('Disaster authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Check if user can view reports
const canViewReports = requireRole('kecamatan', 'bpbd');

// Check if user can export data
const canExportData = requireRole('bpbd');

// Check if user can manage users (BPBD only)
const canManageUsers = requireRole('bpbd');

// Check if user can access dashboard
const canAccessDashboard = (req, res, next) => {
    // All authenticated users can access dashboard
    // but data will be filtered by their role and area
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }

    next();
};

export {
    requireRole,
    canAccessArea,
    canVerifyDisaster,
    canCreateDisaster,
    canUpdateDisaster,
    canViewReports,
    canExportData,
    canManageUsers,
    canAccessDashboard
};