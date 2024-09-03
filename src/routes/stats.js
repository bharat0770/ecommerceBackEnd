const express = require('express');
const { getDashboradStats, getPieChart, getBarChart, getLineChart } = require('../controllers/stats');
const adminOnly = require("../middlewares/adminOnly");
const app = express();
app.get("/stats", adminOnly, getDashboradStats); 
app.get("/pie", adminOnly, getPieChart); 
app.get("/bar",adminOnly, getBarChart); 
app.get("/line", adminOnly, getLineChart); 
module.exports = app;  