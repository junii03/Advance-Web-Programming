import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { connectDB } from '../config/database.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Account.deleteMany({});
        await Transaction.deleteMany({});

        logger.info('🗑️  Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@hbl.com',
            password: 'admin123456',
            phone: '+923001234567',
            cnic: '42101-1234567-1',
            dateOfBirth: new Date('1985-01-01'),
            gender: 'male',
            address: {
                street: 'I.I. Chundrigar Road',
                city: 'Karachi',
                state: 'Sindh',
                postalCode: '74000',
                country: 'Pakistan'
            },
            role: 'admin',
            isEmailVerified: true,
            isPhoneVerified: true
        });

        // Create sample customers
        const customers = await User.create([
            {
                firstName: 'Ahmed',
                lastName: 'Ali',
                email: 'ahmed.ali@example.com',
                password: 'password123',
                phone: '+923001234568',
                cnic: '42101-1234567-2',
                dateOfBirth: new Date('1990-05-15'),
                gender: 'male',
                address: {
                    street: 'Gulshan-e-Iqbal Block 13',
                    city: 'Karachi',
                    state: 'Sindh',
                    postalCode: '75300',
                    country: 'Pakistan'
                },
                role: 'customer',
                isEmailVerified: true,
                isPhoneVerified: true
            },
            {
                firstName: 'Fatima',
                lastName: 'Khan',
                email: 'fatima.khan@example.com',
                password: 'password123',
                phone: '+923001234569',
                cnic: '42101-1234567-3',
                dateOfBirth: new Date('1988-08-22'),
                gender: 'female',
                address: {
                    street: 'Model Town Block B',
                    city: 'Lahore',
                    state: 'Punjab',
                    postalCode: '54700',
                    country: 'Pakistan'
                },
                role: 'customer',
                isEmailVerified: true,
                isPhoneVerified: true
            },
            {
                firstName: 'Muhammad',
                lastName: 'Hassan',
                email: 'muhammad.hassan@example.com',
                password: 'password123',
                phone: '+923001234570',
                cnic: '42101-1234567-4',
                dateOfBirth: new Date('1992-12-10'),
                gender: 'male',
                address: {
                    street: 'F-7 Markaz',
                    city: 'Islamabad',
                    state: 'Federal Capital Territory',
                    postalCode: '44000',
                    country: 'Pakistan'
                },
                role: 'customer',
                isEmailVerified: true,
                isPhoneVerified: true
            }
        ]);

        logger.info(`👥 Created ${customers.length + 1} users (including admin)`);

        // Create sample accounts for customers
        const accounts = [];
        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];

            // Create a savings account
            const savingsAccount = await Account.create({
                userId: customer._id,
                accountType: 'savings',
                accountTitle: `${customer.firstName} ${customer.lastName} - Savings`,
                branchCode: '1001',
                branchName: 'HBL Main Branch Karachi',
                balance: Math.floor(Math.random() * 500000) + 50000, // Random balance between 50k-550k
                interestRate: 7.5,
                minimumBalance: 1000,
                dailyTransactionLimit: 500000,
                monthlyTransactionLimit: 2000000
            });

            accounts.push(savingsAccount);

            // Create a current account for some customers
            if (i < 2) {
                const currentAccount = await Account.create({
                    userId: customer._id,
                    accountType: 'current',
                    accountTitle: `${customer.firstName} ${customer.lastName} - Current`,
                    branchCode: '1001',
                    branchName: 'HBL Main Branch Karachi',
                    balance: Math.floor(Math.random() * 200000) + 100000, // Random balance between 100k-300k
                    interestRate: 0,
                    minimumBalance: 5000,
                    dailyTransactionLimit: 1000000,
                    monthlyTransactionLimit: 5000000
                });

                accounts.push(currentAccount);
            }
        }

        logger.info(`💳 Created ${accounts.length} accounts`);

        // Create sample transactions
        const transactions = [];
        for (let i = 0; i < 20; i++) {
            const fromAccount = accounts[Math.floor(Math.random() * accounts.length)];
            const toAccount = accounts[Math.floor(Math.random() * accounts.length)];

            if (fromAccount._id.toString() !== toAccount._id.toString()) {
                const amount = Math.floor(Math.random() * 10000) + 1000; // Random amount between 1k-11k

                const transaction = await Transaction.create({
                    type: 'transfer',
                    subType: 'online_transfer',
                    fromAccount: fromAccount._id,
                    toAccount: toAccount._id,
                    amount,
                    currency: 'PKR',
                    status: 'completed',
                    description: `Transfer from ${fromAccount.accountTitle} to ${toAccount.accountTitle}`,
                    channel: 'online',
                    fromAccountBalanceBefore: fromAccount.balance,
                    fromAccountBalanceAfter: fromAccount.balance - amount,
                    toAccountBalanceBefore: toAccount.balance,
                    toAccountBalanceAfter: toAccount.balance + amount,
                    processedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
                });

                transactions.push(transaction);
            }
        }

        logger.info(`💸 Created ${transactions.length} sample transactions`);

        // Create some deposits
        for (let i = 0; i < 10; i++) {
            const account = accounts[Math.floor(Math.random() * accounts.length)];
            const amount = Math.floor(Math.random() * 20000) + 5000; // Random amount between 5k-25k

            await Transaction.create({
                type: 'deposit',
                subType: 'branch_deposit',
                toAccount: account._id,
                amount,
                currency: 'PKR',
                status: 'completed',
                description: 'Cash deposit at branch',
                channel: 'branch',
                toAccountBalanceBefore: account.balance,
                toAccountBalanceAfter: account.balance + amount,
                processedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) // Random date within last 15 days
            });
        }

        logger.info('💰 Created sample deposits');

        logger.info('✅ Database seeded successfully!');

        console.log('\n📋 Sample Login Credentials:');
        console.log('='.repeat(40));
        console.log('👑 Admin:');
        console.log('   Email: admin@hbl.com');
        console.log('   Password: admin123456');
        console.log('\n👤 Customer 1:');
        console.log('   Email: ahmed.ali@example.com');
        console.log('   Password: password123');
        console.log('\n👤 Customer 2:');
        console.log('   Email: fatima.khan@example.com');
        console.log('   Password: password123');
        console.log('\n👤 Customer 3:');
        console.log('   Email: muhammad.hassan@example.com');
        console.log('   Password: password123');
        console.log('='.repeat(40));

    } catch (error) {
        logger.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

// Run the seeder
seedDatabase();
