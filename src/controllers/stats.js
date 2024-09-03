const errorHandler = require("../middlewares/errorHandler.js");
const Orders = require("../models/orders.js");
const Product = require("../models/product.js");
const User = require("../models/user.js");
const { calculatePercentage, getInventory, getChartData } = require("../util/features.js");

const getDashboradStats = async (req, res, next) => {
    try {
        // requires caching
        let stats = {};
        const today = new Date();
        const sixMonthAgo = new Date;
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth
                (), 1),
            end: today
        }
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth
                () - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth
                (), 0)
        }


        let queries = {
            thisMonthProduct: Product.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            thisMonthUser: User.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            thisMonthOrder: Orders.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            lastMonthProduct: Product.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            lastMonthUser: User.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            lastMonthOrder: Orders.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            productCount: Product.countDocuments(),
            userCount: User.countDocuments(),
            // here for product and user we take count but for orders we need total field as well hence we  have to fetch allorders 
            allOrders: Orders.find({}).select("total"),
            lastsixMonthOders: Orders.find({ createdAt: { $gte: sixMonthAgo, $lte: today } }),
            categories: Product.distinct("category"),
            femaleUserCount: User.countDocuments({ gender: "female" }),
            latestTransactions: Orders.find().select(["orderItems", "discount", "total", "status"]).sort({ createdAt: -1 }).limit(4),
        }

        // using Object.values() converts an object into an array of values only not keys
        const result = await Promise.all(Object.values(queries));
        const [
            thisMonthProduct,
            thisMonthUser,
            thisMonthOrder,
            lastMonthProduct,
            lastMonthUser,
            lastMonthOrder,
            productCount,
            userCount,
            allOrders,
            lastsixMonthOders,
            categories,
            femaleUserCount,
            latestTransactions,
        ] = result;
        const thisMonthRevenue = thisMonthOrder.reduce((total, order) => {
            return total + (order.total || 0);

        }, 0);
        const lastMonthRevenue = lastMonthOrder.reduce((total, order) => {
            return total + (order.total || 0);

        }, 0);

        const changeInPercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            productPercent: calculatePercentage(thisMonthProduct.length, lastMonthProduct.length),
            userPercent: calculatePercentage(thisMonthUser.length, lastMonthUser.length),
            orderPercent: calculatePercentage(thisMonthOrder.length, lastMonthOrder.length),

        }

        const revenue = allOrders.reduce((total, order) => {
            return total + (order.total || 0);
        }, 0);

        const count = {
            revenue,
            product: productCount,
            user: userCount,
            order: allOrders.length,
        }
        const sixMonthOrderCount = new Array(6).fill(0);
        const sixMonthlyOrderRevenue = new Array(6).fill(0);
        lastsixMonthOders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
            if (monthDiff < 6) {
                sixMonthOrderCount[6 - monthDiff - 1] += 1;
                sixMonthlyOrderRevenue[6 - monthDiff - 1] += order.total;
            }
        })

        //     let categoryCountPromise = categories.map((category) => {
        //     return Product.countDocuments({category}); 
        // })

        // let categoryProductCount = await Promise.all(categoryCountPromise); 
        let categoryCount = await getInventory(categories, productCount);
        // categories.forEach((category, i) => {
        //     categoryCount.push({
        //     [category] :  Math.floor((categoryProductCount[i]/productCount) * 100),   
        //     }); 
        // })

        const userRatio = {
            male: userCount - femaleUserCount,
            female: femaleUserCount,
        }

        const modifiedTransactions = [];
        latestTransactions.map((transaction) => {
            return modifiedTransactions.push({
                id: transaction._id,
                discount: transaction.discount,
                amount: transaction.total,
                quantity: transaction.orderItems.quantity,
                status: transaction.status,
            })
        })
        stats = {
            count,
            changeInPercent,
            chart: {
                sixMonthOrderCount,
                sixMonthlyOrderRevenue
            },
            categoryCount,
            userRatio,
            modifiedTransactions,
        }

        //? NOTE :  cache the stats here
        return res.status(201).json({
            success: true,
            message: stats,
        })
    } catch (err) {
        return next(new errorHandler(err.message, 401));
    }
}


const getPieChart = async (req, res, next) => {
    try {
        const queries = {
            processingOrders: Orders.countDocuments({ status: "processing" }),
            shippedOrders: Orders.countDocuments({ status: "shipped" }),
            deliveredOrders: Orders.countDocuments({ status: "delivered" }),
            productCount: Product.countDocuments({}),
            categories: Product.distinct("category"),
            outOfstock: Product.find({ "stock": 0 }),
            allOrders: Orders.find().select(["total", "subtotal", "discount", "tax", "shippingCharges"]),
            allUsersDob: User.find().select("dob"),
            adminUser: User.countDocuments({ role: "admin" }),
            customerUser: User.countDocuments({ role: "user" }),
        };
        const result = await Promise.all(Object.values(queries));
        const [
            processingOrders,
            shippedOrders,
            deliveredOrders,
            productCount,
            categories,
            outOfstock,
            allOrders,
            allUsersDob,
            admins,
            users,
        ] = result;
        const orderFullfillment = {
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
        };

        const productCategories = await getInventory(categories, productCount);

        const stockAvailablity = {
            inStock: productCount - outOfstock.length,
            outOfstock: outOfstock.length,
        }

        const grossIncome = allOrders.reduce((sum, order) => {
            return sum + (order.total || 0);
        }, 0);
        const discount = allOrders.reduce((sum, order) => {
            return sum + (order.discount || 0);
        }, 0);;
        const productionCost = allOrders.reduce((sum, order) => {
            return sum + (order.shippingCharges || 0);
        }, 0);;
        const burnt = allOrders.reduce((sum, order) => {
            return sum + (order.tax || 0);
        }, 0);;
        const marketingCost = Math.round(grossIncome * 30 / 100)
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost
        }
        const usersAgeGroup = {
            teen: allUsersDob.filter((u) => u.age < 20).length,
            adult: allUsersDob.filter((u) => u.age >= 20 && u.age < 40).length,
            old: allUsersDob.filter((u) => u.age >= 40).length,
        };
        const adminCustomerRatio = {
            admins,
            users,
        };
        const chart = {
            orderFullfillment,
            productCategories,
            stockAvailablity,
            revenueDistribution,
            usersAgeGroup,
            adminCustomerRatio,
        }
        return res.status(201).json({
            success: true,
            message: chart,
        })
    }
    catch (err) {
        return next(new errorHandler(err.message, 401));
    }
}


const getBarChart = async (req, res, next) => {
    try {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
        let query = {
            sixMonthProducts: Product.find({
                "createdAt": { $gte: sixMonthAgo, $lte: today }
            }),

            sixMonthUser: User.find({
                "createdAt": { $gte: sixMonthAgo, $lte: today }
            }),

            twelveMonthOrders: Orders.find({
                "createdAt": { $gte: twelveMonthAgo, $lte: today }
            })
        };
        let result = await Promise.all(Object.values(query));

        const [sixMonthProducts, sixMonthUser, twelveMonthOrders] = result;

        const getProducts = await getChartData(6, today, sixMonthProducts);
        const getUsers = await getChartData(6, today, sixMonthUser);
        const getOrders = await getChartData(12, today, twelveMonthOrders);
        const chart = {
            getProducts,
            getUsers,
            getOrders
        }

        res.status(201).json({
            success: true,
            message: chart,
        })
    }
    catch (err) {
        return next(new errorHandler(err.message, 201));
    }
}

const getLineChart = async (req, res, next) => {
    try {
        const today = new Date();
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
        const baseQuery = {
            createdAt: { $gte: twelveMonthAgo, $lte: today }
        }
        const query = {
            products: Product.find(baseQuery).select("createdAt"),
            users: User.find(baseQuery).select("createdAt"),
            orders: Orders.find(baseQuery).select("createdAt"),
            discount: Orders.find(baseQuery).select(["createdAt", "discount"]),
            revenue: Orders.find(baseQuery).select(["createdAt", "total"]),
        }
        const result = await Promise.all(Object.values(query));

        const [products, users, orders, discount, revenue] = result;

        const getProducts = await getChartData(12, today, products);
        const getUsers = await getChartData(12, today, users);
        const getOrders = await getChartData(12, today, orders);
        const getDiscount = await getChartData(12, today, discount, "discount");
        const getRevenue = await getChartData(12, today, revenue, "total");
        const chart = {
            getProducts,
            getUsers,
            getOrders,
            getDiscount,
            getRevenue,
        }
        res.status(201).json({
            success: true,
            message: chart
        })
    }
    catch (err) {
        return next(new errorHandler(err.message, 201));
    }
}

module.exports = {
    getDashboradStats,
    getPieChart,
    getBarChart,
    getLineChart,
}

