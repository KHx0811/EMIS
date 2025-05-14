import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: true,
        index: true
    },
    school_id: {
        type: String,
        required: true
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    feeType: {
        type: String,
        required: true,
        enum: ['Tuition', 'Transport', 'Sports', 'Development', 'Library', 'Lab', 'Exam', 'Uniform', 'Books', 'Hostel', 'Other']
    },
    academicYear: {
        type: String,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Cheque', 'Online', 'Card', 'UPI', 'Bank Transfer', 'Other'],
        default: 'Online'
    },
    transactionId: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Completed'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    remarks: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    __v: {
        type: Number,
        default: 0
    }
});

// Create indexes for better query performance
// feePaymentSchema.index({ student_id: 1, academicYear: 1 });
// feePaymentSchema.index({ school_id: 1 });

const FeePaymentModel = mongoose.model('FeePayment', feePaymentSchema);

export default FeePaymentModel;