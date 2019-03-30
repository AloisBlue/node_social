import Validator from "validator";
import isEmpty from './isEmpty';

const validateSignupInput = data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if(!Validator.isLength(data.name, { min: 2, max: 30 })){
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if(!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }

  if(Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }

  if(!data.password.match('^(?=.{8,}$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%&^+=!]).*')) {
    errors.password = 'A good password should contain uppercase, lowercase, special characters @#$%&^+=! , digits and above 8 characters'
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  // if(!Validator.isLength(data.password, { min: 8, max: 30 })) {
  //   errors.password = 'Password must be atleast 8 characters';
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}

const validateLoginInput = data => {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if(!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid'
  }

  if(Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required'
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required'
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }

}

export { validateSignupInput, validateLoginInput };
