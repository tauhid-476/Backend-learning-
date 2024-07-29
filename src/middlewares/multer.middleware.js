import multer from "multer";
//It's a Node.js middleware for Express and Node.js that makes it easy to handle file uploads in web applications.

//Multer's diskStorage method, which specifies how and where the uploaded files should be stored.
//cb: The callback function used to specify the storage location. It takes two arguments: an error (if any) and the destination path. Here, it sets the destination to /public/temp.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)
  }
})

//docs

export const upload = multer({ 
  storage
})