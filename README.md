# TradeCastServer
The Node.js backend server uses Server Sent events to send realtime Trading updates over a stream

##########################

For simplicity setInterval is used to generate this stream but in real world Kafka topics or AWS SNS/SQS or Rabbitmq 
Pub/Sub model is used to push and Fan out updates to Queue ans Subscribers

##########################
/sse -> Real time stream
/SendCast -> Send last active Cast
/CancelCast -> Cancel Cast to take it off from Stream
/GetActiveCasts -> Get all Active casts per user

##########################
The app has been deployed to Heroku as well
https://ancient-savannah-82140.herokuapp.com/
