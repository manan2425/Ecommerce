import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userName : {
        type : 'string',
        required : true,
    },
    email : {
        type : 'string',
        required : true,
        unique : true,
    },
    password : {
        type : 'string',
        required : true,
    },
    role : {
        type : 'string',
        default : 'user',
    }
});

const User = mongoose.model('User', UserSchema);
export default User;