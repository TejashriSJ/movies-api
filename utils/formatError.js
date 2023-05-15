const formatError = (statusCode, messageForClient) => {
  let error = {
    status: statusCode,
    messageObj: { status: "Error", Message: messageForClient },
  };
  return error;
};

export default formatError;
