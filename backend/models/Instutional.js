// Instutional schema
const mongoose = require("mongoose");

const institutionalSchema = new mongoose.Schema(
    {
        institutional_name: {
            type: String,
            required: true,
        },
        province: {
            type: String,
            required: true,
        },
        address:{
            type: String,
        },
        website: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
            timestamps: true,
        }
);

module.exports = mongoose.model("Institutional", institutionalSchema);