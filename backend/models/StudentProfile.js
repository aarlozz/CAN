import mongoose from "mongoose"
//yo sababi schema haru ko name milaunu xa ahile

const studentSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    }, 

    personal_info:{
        dob: {
            type: Date
        },
        gender: {
            type: String,
            enum: [ 'Male', 'Female', 'Other'],
        },
            phone: {
                type: String,
                maxlength: 10
            },
},

address:{
    province: {
        type: String,
        required:true
    },
    district: {
        type: String,
        required: true
    },

   municipality: {
        type: String, 
        required: true
    },

    ward: {
        type: String
    },
    street: {
        type: String
    },
},

guardian_info:{
    name:{
        type: String,
        required: true
    },
    relation:{
        type: String,
        required: true
    },

    phone_number: {
        type: String,
        required: true,
        maxlength: 10
    }, 
    occupation:{
        type: String,
    }
},


}, {timestamps: true});

studentSchema.index({ 'address.province': 1})
studentSchema.index({ 'address.districtt': 1})

export default mongoose.model('StudentProfile', studentSchema)

