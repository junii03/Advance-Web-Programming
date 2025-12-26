import express from 'express';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Mock branch data - in production this would come from database
const branches = [
    {
        id: '1001',
        name: 'HBL Main Branch Karachi',
        code: '1001',
        address: {
            street: 'I.I. Chundrigar Road',
            city: 'Karachi',
            state: 'Sindh',
            postalCode: '74000',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-21-111-111-425',
            email: 'main.karachi@hbl.com'
        },
        coordinates: {
            latitude: 24.8607,
            longitude: 67.0011
        },
        services: ['account_opening', 'loans', 'cash_deposit', 'cash_withdrawal', 'foreign_exchange'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '1002',
        name: 'HBL Clifton Branch',
        code: '1002',
        address: {
            street: 'Clifton Block 2, Main Clifton Road',
            city: 'Karachi',
            state: 'Sindh',
            postalCode: '75600',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-21-35870001',
            email: 'clifton@hbl.com'
        },
        coordinates: {
            latitude: 24.8138,
            longitude: 67.0299
        },
        services: ['account_opening', 'loans', 'cash_deposit', 'cash_withdrawal'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '1003',
        name: 'HBL Gulshan Branch',
        code: '1003',
        address: {
            street: 'Block 3, Gulshan-e-Iqbal',
            city: 'Karachi',
            state: 'Sindh',
            postalCode: '75300',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-21-34982001',
            email: 'gulshan@hbl.com'
        },
        coordinates: {
            latitude: 24.9267,
            longitude: 67.0822
        },
        services: ['account_opening', 'cash_deposit', 'cash_withdrawal'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '2001',
        name: 'HBL Mall Road Lahore',
        code: '2001',
        address: {
            street: 'The Mall Road',
            city: 'Lahore',
            state: 'Punjab',
            postalCode: '54000',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-42-111-111-425',
            email: 'mall.lahore@hbl.com'
        },
        coordinates: {
            latitude: 31.5804,
            longitude: 74.3587
        },
        services: ['account_opening', 'loans', 'cash_deposit', 'cash_withdrawal', 'foreign_exchange'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '2002',
        name: 'HBL DHA Lahore',
        code: '2002',
        address: {
            street: 'Main Boulevard, DHA Phase 5',
            city: 'Lahore',
            state: 'Punjab',
            postalCode: '54792',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-42-37182001',
            email: 'dha.lahore@hbl.com'
        },
        coordinates: {
            latitude: 31.4504,
            longitude: 74.4071
        },
        services: ['account_opening', 'loans', 'cash_deposit', 'cash_withdrawal'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '3001',
        name: 'HBL Blue Area Islamabad',
        code: '3001',
        address: {
            street: 'Jinnah Avenue, Blue Area',
            city: 'Islamabad',
            state: 'Federal Capital Territory',
            postalCode: '44000',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-51-111-111-425',
            email: 'bluearea.islamabad@hbl.com'
        },
        coordinates: {
            latitude: 33.7294,
            longitude: 73.0931
        },
        services: ['account_opening', 'loans', 'cash_deposit', 'cash_withdrawal', 'foreign_exchange'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '4001',
        name: 'HBL Saddar Rawalpindi',
        code: '4001',
        address: {
            street: 'Saddar Bazaar, Bank Road',
            city: 'Rawalpindi',
            state: 'Punjab',
            postalCode: '46000',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-51-5562001',
            email: 'saddar.rawalpindi@hbl.com'
        },
        coordinates: {
            latitude: 33.5977,
            longitude: 73.0545
        },
        services: ['account_opening', 'cash_deposit', 'cash_withdrawal'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '5001',
        name: 'HBL Faisalabad Branch',
        code: '5001',
        address: {
            street: 'Jinnah Road, Civil Lines',
            city: 'Faisalabad',
            state: 'Punjab',
            postalCode: '38000',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-41-111-111-425',
            email: 'main.faisalabad@hbl.com'
        },
        coordinates: {
            latitude: 31.4504,
            longitude: 73.1350
        },
        services: ['account_opening', 'loans', 'cash_deposit', 'cash_withdrawal'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '6001',
        name: 'HBL Peshawar Branch',
        code: '6001',
        address: {
            street: 'Saddar Road, Cantonment',
            city: 'Peshawar',
            state: 'Khyber Pakhtunkhwa',
            postalCode: '25000',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-91-111-111-425',
            email: 'main.peshawar@hbl.com'
        },
        coordinates: {
            latitude: 34.0151,
            longitude: 71.5249
        },
        services: ['account_opening', 'loans', 'cash_deposit', 'cash_withdrawal'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    },
    {
        id: '7001',
        name: 'HBL Quetta Branch',
        code: '7001',
        address: {
            street: 'Jinnah Road, Civil Lines',
            city: 'Quetta',
            state: 'Balochistan',
            postalCode: '87300',
            country: 'Pakistan'
        },
        contact: {
            phone: '+92-81-111-111-425',
            email: 'main.quetta@hbl.com'
        },
        coordinates: {
            latitude: 30.1798,
            longitude: 66.9750
        },
        services: ['account_opening', 'cash_deposit', 'cash_withdrawal'],
        workingHours: {
            monday: '9:00 AM - 5:00 PM',
            tuesday: '9:00 AM - 5:00 PM',
            wednesday: '9:00 AM - 5:00 PM',
            thursday: '9:00 AM - 5:00 PM',
            friday: '9:00 AM - 5:00 PM',
            saturday: '9:00 AM - 1:00 PM',
            sunday: 'Closed'
        },
        isActive: true
    }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique branch identifier
 *           example: "1001"
 *         name:
 *           type: string
 *           description: Branch name
 *           example: "HBL Main Branch Karachi"
 *         code:
 *           type: string
 *           description: Branch code
 *           example: "1001"
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "I.I. Chundrigar Road"
 *             city:
 *               type: string
 *               example: "Karachi"
 *             state:
 *               type: string
 *               example: "Sindh"
 *             postalCode:
 *               type: string
 *               example: "74000"
 *             country:
 *               type: string
 *               example: "Pakistan"
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *               example: "+92-21-111-111-425"
 *             email:
 *               type: string
 *               format: email
 *               example: "main.karachi@hbl.com"
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               format: float
 *               example: 24.8607
 *             longitude:
 *               type: number
 *               format: float
 *               example: 67.0011
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [account_opening, loans, cash_deposit, cash_withdrawal, foreign_exchange]
 *           example: ["account_opening", "loans", "cash_deposit"]
 *         workingHours:
 *           type: object
 *           properties:
 *             monday:
 *               type: string
 *               example: "9:00 AM - 5:00 PM"
 *             tuesday:
 *               type: string
 *               example: "9:00 AM - 5:00 PM"
 *             wednesday:
 *               type: string
 *               example: "9:00 AM - 5:00 PM"
 *             thursday:
 *               type: string
 *               example: "9:00 AM - 5:00 PM"
 *             friday:
 *               type: string
 *               example: "9:00 AM - 5:00 PM"
 *             saturday:
 *               type: string
 *               example: "9:00 AM - 1:00 PM"
 *             sunday:
 *               type: string
 *               example: "Closed"
 *         isActive:
 *           type: boolean
 *           description: Whether the branch is currently active
 *           example: true
 *         distance:
 *           type: number
 *           format: float
 *           description: Distance from user location in kilometers (only in nearby search)
 *           example: 2.5
 *
 *     ATM:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ATM identifier
 *           example: "ATM001"
 *         location:
 *           type: string
 *           description: ATM location name
 *           example: "Dolmen Mall Clifton"
 *         address:
 *           type: string
 *           description: Full address of the ATM
 *           example: "HC-3, Block-4, Marine Drive, Clifton, Karachi"
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               format: float
 *               example: 24.8138
 *             longitude:
 *               type: number
 *               format: float
 *               example: 67.0299
 *         services:
 *           type: array
 *           items:
 *             type: string
 *             enum: [cash_withdrawal, balance_inquiry, mini_statement, cash_deposit]
 *           example: ["cash_withdrawal", "balance_inquiry", "mini_statement"]
 *         isOperational:
 *           type: boolean
 *           description: Whether the ATM is currently operational
 *           example: true
 *         cashAvailable:
 *           type: boolean
 *           description: Whether cash is currently available
 *           example: true
 *         distance:
 *           type: number
 *           format: float
 *           description: Distance from user location in kilometers (only in nearby search)
 *           example: 1.2
 */

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: Get all branches
 *     description: Retrieve a list of all active bank branches with optional filtering
 *     tags: [Branches]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter branches by city name (case-insensitive partial match)
 *         example: "karachi"
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *           enum: [account_opening, loans, cash_deposit, cash_withdrawal, foreign_exchange]
 *         description: Filter branches that offer a specific service
 *         example: "loans"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of branches to return
 *     responses:
 *       200:
 *         description: Branches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Number of branches returned
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Branch'
 *             example:
 *               success: true
 *               count: 3
 *               data:
 *                 - id: "1001"
 *                   name: "HBL Main Branch Karachi"
 *                   code: "1001"
 *                   address:
 *                     street: "I.I. Chundrigar Road"
 *                     city: "Karachi"
 *                     state: "Sindh"
 *                     postalCode: "74000"
 *                     country: "Pakistan"
 *                   contact:
 *                     phone: "+92-21-111-111-425"
 *                     email: "main.karachi@hbl.com"
 *                   services: ["account_opening", "loans", "cash_deposit"]
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const { city, service, limit = 50 } = req.query;

        let filteredBranches = branches.filter(branch => branch.isActive);

        if (city) {
            filteredBranches = filteredBranches.filter(branch =>
                branch.address.city.toLowerCase().includes(city.toLowerCase())
            );
        }

        if (service) {
            filteredBranches = filteredBranches.filter(branch =>
                branch.services.includes(service)
            );
        }

        filteredBranches = filteredBranches.slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            count: filteredBranches.length,
            data: filteredBranches
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     description: Retrieve detailed information about a specific branch
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *         example: "1001"
 *     responses:
 *       200:
 *         description: Branch details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *             example:
 *               success: true
 *               data:
 *                 id: "1001"
 *                 name: "HBL Main Branch Karachi"
 *                 code: "1001"
 *                 address:
 *                   street: "I.I. Chundrigar Road"
 *                   city: "Karachi"
 *                   state: "Sindh"
 *                   postalCode: "74000"
 *                   country: "Pakistan"
 *                 contact:
 *                   phone: "+92-21-111-111-425"
 *                   email: "main.karachi@hbl.com"
 *                 coordinates:
 *                   latitude: 24.8607
 *                   longitude: 67.0011
 *                 services: ["account_opening", "loans", "cash_deposit", "cash_withdrawal", "foreign_exchange"]
 *                 workingHours:
 *                   monday: "9:00 AM - 5:00 PM"
 *                   tuesday: "9:00 AM - 5:00 PM"
 *                   wednesday: "9:00 AM - 5:00 PM"
 *                   thursday: "9:00 AM - 5:00 PM"
 *                   friday: "9:00 AM - 5:00 PM"
 *                   saturday: "9:00 AM - 1:00 PM"
 *                   sunday: "Closed"
 *                 isActive: true
 *       404:
 *         description: Branch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Branch not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Get branch by ID
// @route   GET /api/branches/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const branch = branches.find(b => b.id === req.params.id);

        if (!branch) {
            return next(new AppError('Branch not found', 404));
        }

        res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/branches/nearby:
 *   get:
 *     summary: Find nearest branches
 *     description: Find branches near a specific location using coordinates and radius
 *     tags: [Branches]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude of the location
 *         example: 24.8607
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude of the location
 *         example: 67.0011
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Search radius in kilometers
 *         example: 5
 *     responses:
 *       200:
 *         description: Nearby branches found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Number of branches found within radius
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Branch'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             format: float
 *                             description: Distance from search location in kilometers
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "1001"
 *                   name: "HBL Main Branch Karachi"
 *                   address:
 *                     city: "Karachi"
 *                     street: "I.I. Chundrigar Road"
 *                   distance: 2.3
 *                   coordinates:
 *                     latitude: 24.8607
 *                     longitude: 67.0011
 *                 - id: "1002"
 *                   name: "HBL Clifton Branch"
 *                   address:
 *                     city: "Karachi"
 *                     street: "Clifton Block 2"
 *                   distance: 4.7
 *                   coordinates:
 *                     latitude: 24.8138
 *                     longitude: 67.0299
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Latitude and longitude are required"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Find nearest branches
// @route   GET /api/branches/nearby
// @access  Public
router.get('/nearby', async (req, res, next) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            return next(new AppError('Latitude and longitude are required', 400));
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius);

        // Calculate distance using Haversine formula
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth's radius in kilometers
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const nearbyBranches = branches
            .filter(branch => branch.isActive)
            .map(branch => ({
                ...branch,
                distance: calculateDistance(
                    userLat, userLng,
                    branch.coordinates.latitude,
                    branch.coordinates.longitude
                )
            }))
            .filter(branch => branch.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);

        res.status(200).json({
            success: true,
            count: nearbyBranches.length,
            data: nearbyBranches
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/branches/atms:
 *   get:
 *     summary: Get ATM locations
 *     description: Retrieve a list of all available ATM locations with their services and status
 *     tags: [Branches]
 *     responses:
 *       200:
 *         description: ATM locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Number of ATMs returned
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ATM'
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: "ATM001"
 *                   location: "Dolmen Mall Clifton"
 *                   address: "HC-3, Block-4, Marine Drive, Clifton, Karachi"
 *                   coordinates:
 *                     latitude: 24.8138
 *                     longitude: 67.0299
 *                   services: ["cash_withdrawal", "balance_inquiry", "mini_statement"]
 *                   isOperational: true
 *                   cashAvailable: true
 *                 - id: "ATM002"
 *                   location: "Packages Mall Lahore"
 *                   address: "Walton Road, Lahore Cantt, Lahore"
 *                   coordinates:
 *                     latitude: 31.5096
 *                     longitude: 74.3301
 *                   services: ["cash_withdrawal", "balance_inquiry", "mini_statement"]
 *                   isOperational: true
 *                   cashAvailable: true
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// @desc    Get ATM locations
// @route   GET /api/branches/atms
// @access  Public
router.get('/atms', async (req, res, next) => {
    try {
        // Mock ATM data
        const atms = [
            {
                id: 'ATM001',
                location: 'Dolmen Mall Clifton',
                address: 'HC-3, Block-4, Marine Drive, Clifton, Karachi',
                coordinates: { latitude: 24.8138, longitude: 67.0299 },
                services: ['cash_withdrawal', 'balance_inquiry', 'mini_statement'],
                isOperational: true,
                cashAvailable: true
            },
            {
                id: 'ATM002',
                location: 'Packages Mall Lahore',
                address: 'Walton Road, Lahore Cantt, Lahore',
                coordinates: { latitude: 31.5096, longitude: 74.3301 },
                services: ['cash_withdrawal', 'balance_inquiry', 'mini_statement'],
                isOperational: true,
                cashAvailable: true
            }
        ];

        res.status(200).json({
            success: true,
            count: atms.length,
            data: atms
        });
    } catch (error) {
        next(error);
    }
});

export default router;
