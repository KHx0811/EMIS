import mongoose from "mongoose";

const budgetUsageSchema = new mongoose.Schema({
    budget_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    purpose: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    receipt_number: {
        type: String
    },
    recorded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const BudgetUsage = mongoose.model('BudgetUsage', budgetUsageSchema);

export default BudgetUsage;