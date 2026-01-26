const mongoose = require("mongoose");

const journeySchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  mode: { 
    type: String, 
    enum: ["BUS", "METRO", "TRAIN"], 
    required: true 
  },

  source_station: { 
    type: String, 
    required: true 
  },

  destination_station: { 
    type: String 
  },

  tap_in_time: { 
    type: Date, 
    required: true 
  },

  tap_out_time: { 
    type: Date 
  },

  fare: { 
    type: Number 
  },

  status: { 
    type: String, 
    enum: ["ACTIVE", "COMPLETED"], 
    default: "ACTIVE" 
  }

}, { timestamps: true });

module.exports = mongoose.model("Journey", journeySchema);
