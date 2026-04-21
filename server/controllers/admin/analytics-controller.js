import User from '../../models/User.js';
import UserActivity from '../../models/UserActivity.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';

// Get dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total users
    const totalUsers = await User.countDocuments();

    // Total products
    const totalProducts = await Product.countDocuments();

    // Today's registrations
    const todayRegistrations = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Total logins (today)
    const todayLogins = await UserActivity.countDocuments({
      activityType: 'login',
      createdAt: { $gte: today }
    });

    // ===== ORDER & REVENUE STATISTICS (Optimized) =====
    
    // Aggregate for global and daily/weekly/monthly revenue
    const revenueAgg = await Order.aggregate([
      {
        $facet: {
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          todayRevenue: [
            { $match: { orderDate: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
          ],
          weeklyRevenue: [
            { $match: { orderDate: { $gte: sevenDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          monthlyRevenue: [
            { $match: { orderDate: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          orderStatusCounts: [
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const results = revenueAgg[0];
    const totalRevenue = results.totalRevenue[0]?.total || 0;
    const todayRevenue = results.todayRevenue[0]?.total || 0;
    const todayOrdersCount = results.todayRevenue[0]?.count || 0;
    const weeklyRevenue = results.weeklyRevenue[0]?.total || 0;
    const monthlyRevenue = results.monthlyRevenue[0]?.total || 0;
    
    // Map order status counts
    const orderStatusCounts = {
      pending: 0,
      confirmed: 0,
      inProcess: 0,
      inShipping: 0,
      delivered: 0,
      rejected: 0,
      cancelled: 0,
    };
    results.orderStatusCounts.forEach(item => {
      if (orderStatusCounts.hasOwnProperty(item._id)) {
        orderStatusCounts[item._id] = item.count;
      }
    });

    const totalOrders = await Order.countDocuments();

    // Revenue per day (last 7 days)
    const revenuePerDay = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$orderDate' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Logins per day (last 7 days)
    const loginsPerDay = await UserActivity.aggregate([
      {
        $match: {
          activityType: 'login',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Most viewed products
    const mostViewedProducts = await UserActivity.aggregate([
      {
        $match: {
          activityType: 'product_view',
          productId: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$productId',
          viewCount: { $sum: 1 }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: 1,
          viewCount: 1,
          'product.title': 1,
          'product.image': 1,
          'product.price': 1
        }
      }
    ]);

    // Most purchased products
    const mostPurchasedProducts = await UserActivity.aggregate([
      {
        $match: {
          activityType: 'product_purchase',
          productId: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$productId',
          purchaseCount: { $sum: 1 }
        }
      },
      {
        $sort: { purchaseCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: 1,
          purchaseCount: 1,
          'product.title': 1,
          'product.image': 1,
          'product.price': 1
        }
      }
    ]);

    // User registrations per day (last 7 days)
    const registrationsPerDay = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Active users today
    const activeUsersToday = await UserActivity.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'totalActiveUsers'
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        // User Stats
        totalUsers,
        todayRegistrations,
        todayLogins,
        activeUsersToday: activeUsersToday[0]?.totalActiveUsers || 0,
        
        // Product Stats
        totalProducts,
        
        // Order Stats
        totalOrders,
        todayOrdersCount,
        orderStatusCounts,
        
        // Revenue Stats
        totalRevenue,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        revenuePerDay,
        
        // Trends
        loginsPerDay,
        registrationsPerDay,
        mostViewedProducts,
        mostPurchasedProducts
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

// Get all user activities with filters
export const getUserActivities = async (req, res) => {
  try {
    const { userId, activityType, limit = 50, page = 1 } = req.query;

    let filter = {};
    if (userId) filter.userId = userId;
    if (activityType) filter.activityType = activityType;

    const skip = (page - 1) * limit;

    const activities = await UserActivity.find(filter)
      .populate('userId', 'userName email')
      .populate('productId', 'title price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserActivity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activities'
    });
  }
};

// Get user registration analytics
export const getUserRegistrationAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalRegistrations = await User.countDocuments();
    const newRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        newRegistrations,
        registrationTrend: registrationData
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration analytics'
    });
  }
};

// Log user activity
export const logUserActivity = async (req, res) => {
  try {
    const { userId, activityType, productId, details } = req.body;

    // Validate required fields
    if (!activityType) {
      return res.status(400).json({
        success: false,
        message: 'activityType is required'
      });
    }

    // Use provided userId or try to get from auth
    let finalUserId = userId;
    if (!finalUserId && req.user) {
      finalUserId = req.user._id;
    }

    // If still no userId, we can't log the activity
    if (!finalUserId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const activity = new UserActivity({
      userId: finalUserId,
      activityType,
      productId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      details
    });

    await activity.save();

    res.status(201).json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error logging activity'
    });
  }
};
