import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//This is a Mongoose plugin that adds pagination functionality to Mongoose aggregation queries
//paginate==>manage and display large amounts of data in smaller, more manageable chunks, typically referred to as "pages." Instead of loading and displaying all the data at once, pagination allows users to view a subset of the data at a time,

const videoSchema = new Schema({
      videofile : {
        type : String,//cloudinary url
        required : true,
      },
      thumbnail : {
        type : String,//cloudinary url
        required : true,
      },
      title : {
        type : String,
        required : true,
      },
      description : {
        type : String,
        required : true,
      },
      duration : {
        type : Number,
        required : true,
      },
      views : {
        type : Number,
        default : 0
      },
      isPublished : {
        type : Boolean,
        default : true
      },
      owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
      }
      

},{timestamps:true})


//a query is a request to access data from a database. 
//mongoDB queries

//In mongoose you can add yourown plugins


videoSchema.plugin(mongooseAggregatePaginate)



export const Video = mongoose.model("Video",videoSchema)