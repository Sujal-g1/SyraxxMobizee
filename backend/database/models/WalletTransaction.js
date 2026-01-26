const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  wallet_id: { 
    type: String, 
    required: true 
  },

  type: { 
    type: String, 
    enum: ["RECHARGE", "FARE_DEBIT"], 
    required: true 
  },

  amount: { 
    type: Number, 
    required: true 
  },

  balance_after: { 
    type: Number, 
    required: true 
  },

  reference_id: { 
    type: String 
  },

  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
