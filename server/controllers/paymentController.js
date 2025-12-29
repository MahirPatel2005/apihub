const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const Api = require('../models/Api');

// Initialize Stripe with key or valid placeholder if missing to prevent crash during dev
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing in .env. Payment features will fail.');
}
const stripe = new Stripe(stripeKey);

const SPONSORSHIP_PLANS = {
    '7-days': {
        amount: 1000, // $10.00
        days: 7,
        name: '7 Days Sponsorship'
    },
    '30-days': {
        amount: 3000, // $30.00
        days: 30,
        name: '30 Days Sponsorship'
    }
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const { apiId, planId } = req.body;
        const plan = SPONSORSHIP_PLANS[planId];

        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        const api = await Api.findById(apiId);
        if (!api) {
            return res.status(404).json({ message: 'API not found' });
        }

        if (api.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Sponsor API: ${api.name}`,
                            description: `${plan.name} - Boost visibility for ${plan.days} days`,
                        },
                        unit_amount: plan.amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}&api_id=${apiId}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment_canceled=true`,
            metadata: {
                userId: req.user.id,
                apiId: apiId,
                planId: planId,
                days: plan.days
            }
        });

        res.status(200).json({ id: session.id, url: session.url });

    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Payment and Activate Sponsorship
// @route   GET /api/payment/verify-session
// @access  Private
const verifySession = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ message: 'Session ID required' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const { userId, apiId, planId, days } = session.metadata;

        // Check if transaction already recorded to prevent duplicates
        const existingTx = await Transaction.findOne({ stripeSessionId: session.id });
        if (existingTx) {
            return res.status(200).json({ message: 'Transaction already recorded', transaction: existingTx });
        }

        // Create Transaction Record
        const transaction = await Transaction.create({
            user: userId,
            api: apiId,
            stripeSessionId: session.id,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'completed',
            durationDays: Number(days),
            planType: planId
        });

        // Activate Sponsorship
        const sponsoredUntil = new Date();
        sponsoredUntil.setDate(sponsoredUntil.getDate() + Number(days));

        const updatedApi = await Api.findByIdAndUpdate(apiId, {
            isSponsored: true,
            sponsoredUntil: sponsoredUntil,
            $setOnInsert: { // This won't work with findByIdAndUpdate for updating existing docs logic, but we need to ensure analytics exists
                'analytics.impressions': 0,
                'analytics.clicks': 0
            }
        }, { new: true });

        // Ensure analytics structure exists if it was empty
        if (!updatedApi.analytics || !updatedApi.analytics.dailyStats) {
            updatedApi.analytics = {
                impressions: 0,
                clicks: 0,
                dailyStats: []
            };
            await updatedApi.save();
        }

        console.log(`[Payment] Activated sponsorship for API ${updatedApi?.name} until ${sponsoredUntil}`);

        res.status(200).json({ success: true, transaction, api: updatedApi });

        res.status(200).json({ success: true, transaction });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCheckoutSession,
    verifySession
};
