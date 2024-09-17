import CustomError from './customError'

class UnAuthenticatedError extends CustomError {
  constructor(message : string) {
    super(401, message)
  }
}

export default UnAuthenticatedError