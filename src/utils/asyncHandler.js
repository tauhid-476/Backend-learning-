//talking to databse is sometthing which happens alot therefore we create a utility
//2 ways promises and try catch
//asyncHandler function is an error-handling middleware for asynchronous functions



//2nd using promises
// ***
const asyncHandler = (requestHandler) => {
  return (req, res, next) =>{
    Promise.resolve(requestHandler(req,res,next))
    .catch((err)=> next(err))
  }
}

export { asyncHandler }



//1st using try and catch
//next==>middleware
// const asyncHandler = (fn) => async (req,res,next)=>{
//   try {
    
//     await fn(req, res, next)

//   } catch (error) {
//     res.status(error.code || 500).json({
//       success : false,
//       message: error.message
//     })
//   }
// }

//exampleon how to use this asynchandler




//higher order function basics 

//normal function
// const asyncHandler = () =>{}

//higher oreder
// const asyncHandler = (f1) =>{()=>{}}

//just remove the curly braces
// const asyncHandler = () => ()=> {}
