import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    school_id: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    usage: {
        type: Number,
        default: 0,
        min: 0
    },
    fiscal_year: {
        type: Number,
        required: true,
        default: () => new Date().getFullYear()
    },
    category: {
        type: String,
        enum: ['general', 'infrastructure', 'technology', 'sports', 'academics', 'staff_development', 'maintenance', 'other'],
        default: 'general'
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['allocated', 'in_use', 'depleted', 'closed'],
        default: 'allocated'
    },
    allocation_date: {
        type: Date,
        default: Date.now
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }
}, {
    timestamps: true
});

budgetSchema.virtual('usagePercentage').get(function() {
    return this.amount > 0 ? (this.usage / this.amount) * 100 : 0;
});

budgetSchema.virtual('remaining').get(function() {
    return this.amount - this.usage;
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;