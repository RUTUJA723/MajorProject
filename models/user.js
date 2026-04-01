const mongoose = require("mongoose");
const { isOwner } = require("../middleware");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique:true,
    },
     isOwner: {
        type : Boolean,
        default : false
    },
    wishlist: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Listing",
        }
    ],
    isVerified : {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type : Boolean,
        default : false
    },
    hostRequest: {
    type: Boolean,
    default: false
   },
   hostDocument: {
    type: String   // store file path
   },
   hostStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: null
   }
});

userSchema.plugin(passportLocalMongoose);/*You're free to define your User how you like. 
Passport-Local Mongoose will add a username, 
 hash and salt field to store the username, 
the hashed password and the salt value.*/

module.exports = mongoose.model("User", userSchema);

//pbkdf2 hashing algorithm(we are implementing in our project)