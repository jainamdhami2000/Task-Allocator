<%- include('partials/header'); %>

<head>
  <script src="/socket.io/socket.io.js"></script>
  <!-- Bootstrap core CSS -->
  <style media="screen">
    /* Chat containers */
    .chatcontainer {
      border: 2px solid #dedede;
      background-color: #f1f1f1;
      border-radius: 5px;
      padding: 2px;
      margin: 10px 5px;
    }

    /* Darker chat container */
    .darker {
      border-color: #ccc;
      background-color: #ddd;
    }

    /* Clear floats */
    .chatcontainer::after {
      content: "";
      clear: both;
      display: table;
    }

    /* Style images */
    .chatcontainer img {
      float: left;
      max-width: 60px;
      width: 100%;
      margin-right: 20px;
      border-radius: 50%;
    }

    /* Style the right image */
    .chatcontainer .right {
      float: right;
      margin-left: 20px;
      margin-right: 0;
    }

    /* Style time text */
    .time-right {
      float: right;
      color: #aaa;
    }

    /* Style time text */
    .time-left {
      float: left;
      color: #999;
    }
  </style>
</head>
<%-include('partials/sidebar')%>
<div class="container">

  <div class="card" style="width:100%;height: 500px;overflow: auto;">
    <div id="messages">

    </div>
    <div style="padding:0px;bottom:0px">
      <br>
      <!-- <input id = "name" class="form-control" placeholder="Name">
          <br> -->
      <textarea id="message" class="form-control" placeholder="Your Message Here"></textarea>
      <button id="send" class="btn btn-success">Send</button>
    </div>
  </div>
  <input type="text" id="userName" style="visibility:hidden" name="" value="<%= user.username %>">

</div>
<script>
  var socket = io();
  $(() => {
    $("#send").click(() => {
      sendMessage({
        name: $("#userName").val(),
        message: $("#message").val()
      });
    })

    getMessages()
  })

  socket.on('message', addMessages)

  function addMessages(message) {
    if ('<%=user.username%>' == `${message.name}`) {
      $("#messages").append(`<div class="chatcontainer darker">
        <h4>${message.name}</h4>
        <p>${message.message}</p>
      </div>`)
      // <span class="time-left">${message.msg_time}</span>

    } else {
      $("#messages").append(`<div class="chatcontainer">
        <h4 class="right">${message.name}</h4>
        <p class="right">${message.message}</p>
      </div>`)
    } //nikali leje class='right' just for showing'
// <span class="time-right">${message.msg_time}</span>
  }

  function getMessages() {
    $.get('http://localhost:3001/messages/<%= project %>', (data) => {
      data.forEach(addMessages);
    })
  }

  function sendMessage(message) {
    $.post('http://localhost:3001/messages/<%= project %>', message)
  }
</script>
</body>

</html>
<%-include("partials/footer")-%>