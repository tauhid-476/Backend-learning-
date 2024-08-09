import mongoose,{ Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcryt from "bcrypt"//to hash password
//encrypt ===> to change information into secret code

const userSchema = new Schema({
  
        username : {
          type : String,
          required : true,
          unique : true,
          lowercase : true,
          trim : true,
          index : true
          //index true ==> username is something which is often searched . To enable searching feild for a data set index:true .Optimise way
        },
        email : {
          type : String,
          required : true,
          unique : true,
          lowercase : true,
          trim : true
        },
        fullName : {
          type : String,
          required : true,
          trim : true,
          index : true
         },
         avatar : {
          type : String, //cloudinary url
          required : true,
         },
         coverImage : {
          type : String, //cloudinary url
         },
         watchHistory : [
          {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
           }
         ],
         password : {
          type : String,
          required : [true , 'Password is required']
         },
         refreshToken : {
          type : String
         }
},{timestamps:true})
//
//imp points
//select event ("validate","save","remove","updateone","deleteone")
//second , callback .Dont use arrow fn cuz it doenst know the context of data on userSchem
//async fn cuz its complex and take time
//data save hone ke pehle ye kardo
userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next()

  this.password = await bcryt.hash(this.password, 10);
  next()
    //this will create problem it will encrypt pass everytime even if a user do something with avatar etc.
    //this thing shoud only run when there is modificatio in password
    //therefore use if statment
})



//check password is correct or not

userSchema.methods.isPasswordCorrect = async  function(password){

  //PlaintextPassword,hashed password
 return  await bcryt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
//    payload key : coming from db
//     we get this id from mogodb
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName, 
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
  
}

userSchema.methods.generateRefreshToken = function(){

  return jwt.sign(
    {
//    payload key : coming from db
      _id: this._id

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}
//this user can contact db directly cuz it is made thru mongoose
export const User = mongoose.model("User",userSchema)
