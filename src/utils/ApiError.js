//extend error class given by node using innheritance to overwrite and control errors


class ApiError extends Error {

  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false
    this.errors = errors

    //where actually is error
    if (stack) {
      this.stack = stack

    }else{
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export {ApiError}