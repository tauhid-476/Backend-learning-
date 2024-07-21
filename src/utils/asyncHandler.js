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

/*
app.get('/example', asyncHandler(async (req, res, next) => {
  const data = await someAsyncFunction();
  res.json({ success: true, data });
}));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

This way, if any error occurs in someAsyncFunction, it will be caught by asyncHandler, and an appropriate response will be sent to the client.
*/


//higher order function basics 

//normal function
// const asyncHandler = () =>{}

//higher oreder
// const asyncHandler = (f1) =>{()=>{}}

//just remove the curly braces
// const asyncHandler = () => ()=> {}
