import Validator from "validator";
import isEmpty from "./isEmpty";

const validateTextInput = data => {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : '';

  if (!Validator.isLength(data.text, { min: 2, max: 300 })) {
    errors.text = "Minimum of words should be from 2 to 300"
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Text field is empty"
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}

export default validateTextInput;
